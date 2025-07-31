"""
Help command handler for the Enhanced Telegram Bot
Provides comprehensive command documentation in Arabic
"""

import logging
from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton

from config.settings import settings
from middlewares.auth import verified_required

logger = logging.getLogger(__name__)
router = Router()


def get_help_text() -> str:
    """Generate comprehensive help text in Arabic"""
    return f"""🆘 مرحباً بك في دليل المساعدة لدورة {settings.COURSE_NAME}

📋 الأوامر المتاحة:

🔰 الأوامر الأساسية:
/ابدأ أو /start - رسالة الترحيب وبدء استخدام البوت
/مساعدة أو /help - عرض هذه القائمة

📚 أوامر المحتوى والدروس:
/المحتوى - عرض مواد الدورة (PDFs، فيديوهات، روابط)
/الجدول - عرض جدول المحاضرات الأسبوعي
/تذكير - تفعيل/إلغاء تذكيرات الجلسات

❓ المساعدة والدعم:
/أسئلة - الأسئلة الشائعة والإجابات
/تقييم - تقييم الجلسة الأخيرة
/اختبار - اختبار قصير (3 أسئلة)

📊 الإحصائيات:
/إحصائيات - عرض إحصائيات المجموعة

👨‍💼 أوامر المدراء فقط:
/نشر - نشر إعلان أو رسالة للمجموعة
/كتم - كتم مستخدم لفترة محددة
/تحذير - إعطاء تحذير لمستخدم

🎯 معلومات مفيدة:
📅 أيام المحاضرات: {', '.join([day for day, config in settings.CLASS_SCHEDULE.items() if config['enabled']])}
⏰ توقيت المحاضرات: {settings.CLASS_SCHEDULE.get('الاثنين', {}).get('time', 'غير محدد')}
🔗 رابط Zoom: {settings.ZOOM_LINK}
👨‍🏫 المدرب: {settings.INSTRUCTOR_NAME}

💡 نصائح:
• استخدم الأزرار التفاعلية للوصول السريع
• تأكد من تفعيل الإشعارات لتلقي التذكيرات
• راجع المحتوى بانتظام للمراجعة

🆘 للمساعدة الإضافية، تواصل مع المدرب مباشرة."""


@router.message(Command("help", "مساعدة"))
async def help_command(message: Message, is_verified: bool):
    """Handle help command"""
    if not await verified_required(message, is_verified):
        return
    
    help_text = get_help_text()
    
    # Create navigation buttons
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
            InlineKeyboardButton(text="🔙 العودة للقائمة الرئيسية", callback_data="back_to_main")
        ]
    ])
    
    await message.answer(help_text, reply_markup=keyboard)