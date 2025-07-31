"""
Schedule command handler for the Enhanced Telegram Bot
Displays course schedule and upcoming sessions
"""

import logging
from datetime import datetime, timedelta
from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton

from config.settings import settings, get_next_session
from middlewares.auth import verified_required

logger = logging.getLogger(__name__)
router = Router()


def get_schedule_text() -> str:
    """Generate schedule text in Arabic"""
    schedule_text = f"📅 جدول دورة {settings.COURSE_NAME}\n\n"
    
    if not settings.CLASS_SCHEDULE:
        return schedule_text + "❌ لم يتم تحديد جدول للدورة بعد."
    
    schedule_text += "🗓️ الجدول الأسبوعي:\n\n"
    
    # Display weekly schedule
    for day, config in settings.CLASS_SCHEDULE.items():
        if config.get('enabled', False):
            duration_hours = config.get('duration', 120) // 60
            duration_minutes = config.get('duration', 120) % 60
            duration_str = f"{duration_hours} ساعة"
            if duration_minutes > 0:
                duration_str += f" و {duration_minutes} دقيقة"
            
            schedule_text += f"📌 {day}: {config['time']} ({duration_str})\n"
    
    # Add next session info
    next_session = get_next_session()
    if next_session:
        schedule_text += f"\n⏰ الجلسة القادمة:\n"
        schedule_text += f"📅 {next_session['day']} - {next_session['date']}\n"
        schedule_text += f"🕐 {next_session['time']}\n"
        
        # Calculate time until next session
        try:
            import pytz
            tz = pytz.timezone(settings.TIMEZONE)
            now = datetime.now(tz)
            session_time = next_session['datetime']
            
            if isinstance(session_time, str):
                session_time = datetime.fromisoformat(session_time)
            
            if session_time.tzinfo is None:
                session_time = tz.localize(session_time)
            
            time_diff = session_time - now
            
            if time_diff.total_seconds() > 0:
                days = time_diff.days
                hours = time_diff.seconds // 3600
                minutes = (time_diff.seconds % 3600) // 60
                
                countdown = "⏳ باقي على الجلسة: "
                if days > 0:
                    countdown += f"{days} يوم "
                if hours > 0:
                    countdown += f"{hours} ساعة "
                if minutes > 0:
                    countdown += f"{minutes} دقيقة"
                
                schedule_text += f"{countdown}\n"
                
        except Exception as e:
            logger.error(f"Error calculating time until next session: {e}")
    
    # Add Zoom info
    if settings.ZOOM_LINK and settings.ZOOM_LINK != "https://zoom.us/j/meeting-id":
        schedule_text += f"\n🔗 رابط Zoom: {settings.ZOOM_LINK}\n"
        
        if settings.ZOOM_PASSWORD:
            schedule_text += f"🔑 كلمة المرور: {settings.ZOOM_PASSWORD}\n"
    
    schedule_text += f"\n⏰ التوقيت: {settings.TIMEZONE}"
    schedule_text += f"\n👨‍🏫 المدرب: {settings.INSTRUCTOR_NAME}"
    
    return schedule_text


@router.message(Command("schedule", "الجدول"))
async def schedule_command(message: Message, is_verified: bool):
    """Handle schedule command"""
    if not await verified_required(message, is_verified):
        return
    
    schedule_text = get_schedule_text()
    
    # Create action buttons
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔔 تفعيل التذكيرات", callback_data="enable_reminders"),
            InlineKeyboardButton(text="🔕 إلغاء التذكيرات", callback_data="disable_reminders")
        ],
        [
            InlineKeyboardButton(text="🔗 فتح Zoom", url=settings.ZOOM_LINK if settings.ZOOM_LINK != "https://zoom.us/j/meeting-id" else None)
        ] if settings.ZOOM_LINK != "https://zoom.us/j/meeting-id" else [],
        [
            InlineKeyboardButton(text="🔄 تحديث الجدول", callback_data="refresh_schedule"),
            InlineKeyboardButton(text="🔙 العودة", callback_data="back_to_main")
        ]
    ])
    
    await message.answer(schedule_text, reply_markup=keyboard)


@router.callback_query(F.data == "refresh_schedule")
async def refresh_schedule(callback: CallbackQuery, is_verified: bool):
    """Refresh schedule display"""
    if not await verified_required(callback, is_verified):
        return
    
    schedule_text = get_schedule_text()
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔔 تفعيل التذكيرات", callback_data="enable_reminders"),
            InlineKeyboardButton(text="🔕 إلغاء التذكيرات", callback_data="disable_reminders")
        ],
        [
            InlineKeyboardButton(text="🔗 فتح Zoom", url=settings.ZOOM_LINK if settings.ZOOM_LINK != "https://zoom.us/j/meeting-id" else None)
        ] if settings.ZOOM_LINK != "https://zoom.us/j/meeting-id" else [],
        [
            InlineKeyboardButton(text="🔄 تحديث الجدول", callback_data="refresh_schedule"),
            InlineKeyboardButton(text="🔙 العودة", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(schedule_text, reply_markup=keyboard)
    await callback.answer("✅ تم تحديث الجدول")


@router.callback_query(F.data == "enable_reminders")
async def enable_reminders(callback: CallbackQuery):
    """Enable reminders for user"""
    # This would typically update user preferences in database
    await callback.answer("🔔 تم تفعيل التذكيرات! ستتلقى تذكيرات قبل كل جلسة.")


@router.callback_query(F.data == "disable_reminders")
async def disable_reminders(callback: CallbackQuery):
    """Disable reminders for user"""
    # This would typically update user preferences in database
    await callback.answer("🔕 تم إلغاء التذكيرات.")


@router.callback_query(F.data == "back_to_main")
async def back_to_main(callback: CallbackQuery):
    """Return to main menu"""
    from config.settings import format_welcome_message
    
    user = callback.from_user
    welcome_text = format_welcome_message(user.first_name or user.username or "صديق")
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📚 المحتوى", callback_data="show_content"),
            InlineKeyboardButton(text="📅 الجدول", callback_data="show_schedule")
        ],
        [
            InlineKeyboardButton(text="❓ الأسئلة الشائعة", callback_data="show_faq"),
            InlineKeyboardButton(text="📊 الإحصائيات", callback_data="show_stats")
        ],
        [
            InlineKeyboardButton(text="🆘 المساعدة", callback_data="show_help")
        ]
    ])
    
    await callback.message.edit_text(welcome_text, reply_markup=keyboard)
    await callback.answer()