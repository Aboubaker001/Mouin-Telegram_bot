"""
Configuration settings for the Enhanced Telegram Bot
All customizable settings are centralized here for easy management
"""

import os
from typing import List, Dict, Any
from pydantic import BaseSettings, validator
from datetime import time, datetime


class Settings(BaseSettings):
    """Bot configuration settings"""
    
    # Bot Configuration
    BOT_TOKEN: str
    ADMIN_IDS: List[int] = []
    
    # Course Configuration
    COURSE_NAME: str = "أساسيات البرمجة"
    COURSE_DESCRIPTION: str = "دورة شاملة في تعلم أساسيات البرمجة باللغة العربية"
    INSTRUCTOR_NAME: str = "المعلم"
    
    # Zoom Configuration
    ZOOM_LINK: str = "https://zoom.us/j/meeting-id"
    ZOOM_PASSWORD: str = ""
    MEETING_ID: str = ""
    
    # Schedule Configuration (Cairo timezone)
    CLASS_SCHEDULE: Dict[str, Dict[str, Any]] = {
        "الاثنين": {
            "time": "20:00",
            "duration": 120,  # minutes
            "enabled": True
        },
        "الخميس": {
            "time": "20:00", 
            "duration": 120,
            "enabled": True
        }
    }
    
    # Reminder Configuration
    REMINDER_BEFORE_CLASS: int = 60  # minutes before class
    DAILY_REMINDER_TIME: str = "18:00"  # 6 PM
    TIMEZONE: str = "Africa/Cairo"
    
    # User Verification
    VERIFICATION_REQUIRED: bool = True
    VERIFICATION_TIMEOUT: int = 300  # 5 minutes
    SUBSCRIPTION_CODES: List[str] = ["STUDENT2024", "COURSE123", "PROG101"]
    
    # Warning System
    MAX_WARNINGS: int = 3
    MUTE_DURATION: int = 3600  # 1 hour in seconds
    SPAM_THRESHOLD: int = 5  # messages per minute
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./data/bot_database.db"
    
    # File Storage
    CONTENT_DIRECTORY: str = "./content"
    UPLOADS_DIRECTORY: str = "./uploads"
    
    # Quiz Configuration
    QUIZ_QUESTIONS_PER_SESSION: int = 3
    QUIZ_TIME_LIMIT: int = 300  # 5 minutes
    
    # Google Sheets Integration (Optional)
    GOOGLE_SHEETS_ENABLED: bool = False
    GOOGLE_SHEETS_ID: str = ""
    GOOGLE_CREDENTIALS_FILE: str = "./credentials/google_credentials.json"
    
    # Security
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".docx", ".txt", ".jpg", ".png", ".mp4"]
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # Messages Configuration
    WELCOME_MESSAGE: str = """🎉 أهلاً وسهلاً بك، {username}! 🚀

📚 لقد انضممت إلى دورة *{course_name}*
👨‍🏫 المدرب: {instructor}

📅 الجلسة القادمة: {next_session}
🔗 رابط Zoom: {zoom_link}

📌 تحقق من التعليمات المثبتة وابدأ رحلتك التعليمية! 💪

استخدم /مساعدة لعرض الأوامر المتاحة."""

    ERROR_MESSAGE: str = "❗ عذراً، هذا الأمر غير صحيح. جرب /مساعدة لعرض الأوامر المتاحة! 😊"
    
    UNAUTHORIZED_MESSAGE: str = "🚫 عذراً، ليس لديك صلاحية لاستخدام هذا الأمر."
    
    # FAQ Default Questions
    DEFAULT_FAQ: Dict[str, str] = {
        "متى الجلسة القادمة؟": "📅 الجلسة القادمة يوم {next_day} في تمام الساعة {time}",
        "أين رابط Zoom؟": "🔗 رابط Zoom: {zoom_link}",
        "كيف أحصل على المواد؟": "📚 استخدم الأمر /المحتوى للوصول إلى جميع مواد الدورة",
        "كيف أتواصل مع المدرب؟": "👨‍🏫 يمكنك التواصل مع المدرب من خلال المجموعة أو إرسال رسالة خاصة"
    }
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @validator('ADMIN_IDS', pre=True)
    def parse_admin_ids(cls, v):
        if isinstance(v, str):
            return [int(x.strip()) for x in v.split(',') if x.strip()]
        return v
    
    @validator('SUBSCRIPTION_CODES', pre=True) 
    def parse_subscription_codes(cls, v):
        if isinstance(v, str):
            return [x.strip() for x in v.split(',') if x.strip()]
        return v


# Create settings instance
settings = Settings()


# Course schedule helper functions
def get_next_session():
    """Get the next scheduled session"""
    from datetime import datetime, timedelta
    import pytz
    
    tz = pytz.timezone(settings.TIMEZONE)
    now = datetime.now(tz)
    
    days_map = {
        "الاثنين": 0,
        "الثلاثاء": 1, 
        "الأربعاء": 2,
        "الخميس": 3,
        "الجمعة": 4,
        "السبت": 5,
        "الأحد": 6
    }
    
    for day_name, day_num in days_map.items():
        if day_name in settings.CLASS_SCHEDULE and settings.CLASS_SCHEDULE[day_name]["enabled"]:
            class_time = settings.CLASS_SCHEDULE[day_name]["time"]
            hour, minute = map(int, class_time.split(":"))
            
            # Calculate days until this day
            days_ahead = day_num - now.weekday()
            if days_ahead <= 0:  # Target day already happened this week
                days_ahead += 7
                
            session_date = now + timedelta(days=days_ahead)
            session_datetime = session_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            return {
                "day": day_name,
                "date": session_datetime.strftime("%Y-%m-%d"),
                "time": class_time,
                "datetime": session_datetime
            }
    
    return None


def format_welcome_message(username: str) -> str:
    """Format the welcome message with current data"""
    next_session = get_next_session()
    next_session_str = "قريباً"
    
    if next_session:
        next_session_str = f"{next_session['day']} {next_session['date']} في {next_session['time']}"
    
    return settings.WELCOME_MESSAGE.format(
        username=username,
        course_name=settings.COURSE_NAME,
        instructor=settings.INSTRUCTOR_NAME,
        next_session=next_session_str,
        zoom_link=settings.ZOOM_LINK
    )