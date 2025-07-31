import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Bot Configuration
    BOT_TOKEN = os.getenv('BOT_TOKEN')
    ADMIN_IDS = [int(id.strip()) for id in os.getenv('ADMIN_IDS', '').split(',') if id.strip()]
    
    # Course Configuration
    COURSE_NAME = "أساسيات البرمجة"  # Programming Basics
    COURSE_DESCRIPTION = "دورة تعليمية شاملة في أساسيات البرمجة للمبتدئين"
    
    # Schedule Configuration
    SCHEDULE = {
        "السبت": "8:00 PM - 10:00 PM",
        "الأحد": "8:00 PM - 10:00 PM", 
        "الاثنين": "8:00 PM - 10:00 PM",
        "الثلاثاء": "8:00 PM - 10:00 PM",
        "الأربعاء": "8:00 PM - 10:00 PM",
        "الخميس": "8:00 PM - 10:00 PM",
        "الجمعة": "راحة"
    }
    
    # Zoom Configuration
    ZOOM_LINK = os.getenv('ZOOM_LINK', 'https://zoom.us/j/123456789')
    ZOOM_PASSWORD = os.getenv('ZOOM_PASSWORD', '123456')
    
    # Database Configuration
    DATABASE_PATH = "data/bot_database.db"
    
    # User Verification
    VERIFICATION_TIMEOUT = 300  # 5 minutes in seconds
    SUBSCRIPTION_CODES = os.getenv('SUBSCRIPTION_CODES', 'CODE123,CODE456').split(',')
    
    # Warning System
    MAX_WARNINGS = 3
    MUTE_DURATION = 3600  # 1 hour in seconds
    
    # Reminder Configuration
    REMINDER_BEFORE_SESSION = 3600  # 1 hour before session
    DAILY_SCHEDULE_TIME = "09:00"  # Daily schedule reminder time
    
    # Google Sheets Configuration (for quizzes and feedback)
    GOOGLE_SHEETS_CREDENTIALS_FILE = "credentials.json"
    QUIZ_SHEET_ID = os.getenv('QUIZ_SHEET_ID')
    FEEDBACK_SHEET_ID = os.getenv('FEEDBACK_SHEET_ID')
    
    # Content Configuration
    CONTENT_LINKS = {
        "الملخصات": "https://drive.google.com/drive/folders/...",
        "الفيديوهات": "https://www.youtube.com/playlist?list=...",
        "التمارين": "https://drive.google.com/drive/folders/...",
        "المراجع": "https://drive.google.com/drive/folders/..."
    }
    
    # FAQ Configuration
    FAQ = {
        "متى الجلسة القادمة؟": "الجلسة القادمة يوم الثلاثاء الساعة 8:00 مساءً. رابط الزوم: " + ZOOM_LINK,
        "أين أجد المحتوى؟": "استخدم الأمر /المحتوى للوصول إلى جميع المواد التعليمية",
        "كيف أسجل حضوري؟": "استخدم الأمر /حضور لتسجيل حضورك في الجلسة",
        "متى تبدأ الدورة؟": "الدورة بدأت بالفعل! يمكنك الانضمام في أي وقت",
        "كيف أحصل على المساعدة؟": "استخدم الأمر /مساعدة لعرض جميع الأوامر المتاحة"
    }
    
    # Quiz Configuration
    QUIZ_QUESTIONS = [
        {
            "question": "ما هو نوع البيانات المستخدم لتخزين النصوص في Python؟",
            "options": ["int", "str", "float", "bool"],
            "correct": 1
        },
        {
            "question": "أي من التالي يستخدم لإنشاء حلقة في Python؟",
            "options": ["if", "for", "class", "def"],
            "correct": 1
        },
        {
            "question": "ما هو الرمز المستخدم للتعليقات في Python؟",
            "options": ["//", "/*", "#", "--"],
            "correct": 2
        }
    ]
    
    # Messages Configuration
    MESSAGES = {
        "welcome": """🎉 مرحباً {username}! 🚀
أنت الآن جزء من دورة *{course_name}* 📚
📅 الجلسة القادمة: {next_session}
🔗 رابط الزوم: {zoom_link}

📌 استخدم هذه الأوامر:
/المحتوى - عرض المواد التعليمية
/الجدول - عرض الجدول الزمني
/تذكير - تفعيل تذكيرات الجلسات
/أسئلة - الأسئلة الشائعة

🚀 ابدأ رحلة التعلم! 💻""",
        
        "reminder": """⏰ تذكير: جلسة اليوم تبدأ الساعة 7:00 مساءً! 💻
🔗 رابط الزوم: {zoom_link}
📝 لا تنسى دفتر الملاحظات! 😎""",
        
        "error": "❗ عذراً، هذا الأمر غير صحيح. جرب /مساعدة لعرض الأوامر المتاحة! 😊",
        
        "stats": """📊 إحصائيات المجموعة:
👥 الأعضاء: {member_count}
💬 التفاعل الأسبوعي: {weekly_messages} رسالة
🎯 نسبة الحضور: {attendance_rate}% (آخر جلسة)""",
        
        "help": """📚 الأوامر المتاحة:

🎯 الأوامر الأساسية:
/ابدأ - رسالة الترحيب والتعليمات
/مساعدة - عرض هذه القائمة
/الجدول - عرض جدول الدورة الأسبوعي
/المحتوى - الوصول للمواد التعليمية
/أسئلة - الأسئلة الشائعة

📢 للمشرفين فقط:
/نشر - نشر إعلان جديد
/تذكير - إرسال تذكير يدوي
/إحصائيات - عرض إحصائيات المجموعة
/اختبار - إرسال اختبار قصير
/تقييم - جمع تقييم الجلسة

🎓 للطلاب:
/حضور - تسجيل الحضور
/تقييم - تقييم الجلسة

💡 للمساعدة الإضافية، تواصل مع المشرفين!"""
    }