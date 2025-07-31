"""
Start command handler for the Enhanced Telegram Bot
Handles user registration and verification process
"""

import logging
from aiogram import Router, F
from aiogram.filters import Command, StateFilter
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from config.settings import settings, format_welcome_message
from database.database import verify_user, get_user
from middlewares.auth import verified_required

logger = logging.getLogger(__name__)
router = Router()


class VerificationStates(StatesGroup):
    waiting_for_code = State()


@router.message(Command("start", "ابدأ"))
async def start_command(message: Message, state: FSMContext, db_user: dict, is_verified: bool):
    """Handle start command - welcome and verification"""
    user = message.from_user
    
    if is_verified:
        # User is already verified, show welcome message
        welcome_text = format_welcome_message(user.first_name or user.username or "صديق")
        
        # Create quick action buttons
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
        
        await message.answer(welcome_text, reply_markup=keyboard)
        
    else:
        # User needs verification
        if settings.VERIFICATION_REQUIRED:
            verification_text = f"""🔐 مرحباً بك في دورة {settings.COURSE_NAME}!

للانضمام إلى الدورة، يرجى إدخال رمز الاشتراك الخاص بك.

💡 إذا لم يكن لديك رمز اشتراك، تواصل مع المدرب للحصول عليه.

📝 أدخل رمز الاشتراك الآن:"""

            await message.answer(verification_text)
            await state.set_state(VerificationStates.waiting_for_code)
        else:
            # No verification required
            await verify_user(user.id, "NO_CODE_REQUIRED")
            welcome_text = format_welcome_message(user.first_name or user.username or "صديق")
            await message.answer(welcome_text)


@router.message(StateFilter(VerificationStates.waiting_for_code))
async def process_verification_code(message: Message, state: FSMContext):
    """Process verification code input"""
    code = message.text.strip()
    user = message.from_user
    
    if await verify_user(user.id, code):
        await state.clear()
        
        success_text = f"""✅ تم التحقق من اشتراكك بنجاح!

🎉 مرحباً بك في دورة {settings.COURSE_NAME}!

{format_welcome_message(user.first_name or user.username or "صديق")}"""

        # Create welcome buttons
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="📚 تصفح المحتوى", callback_data="show_content"),
                InlineKeyboardButton(text="📅 الجدول", callback_data="show_schedule")
            ],
            [
                InlineKeyboardButton(text="🆘 المساعدة", callback_data="show_help")
            ]
        ])
        
        await message.answer(success_text, reply_markup=keyboard)
    else:
        error_text = """❌ رمز الاشتراك غير صحيح!

يرجى التأكد من الرمز والمحاولة مرة أخرى.
أو تواصل مع المدرب للحصول على المساعدة.

📝 أدخل رمز الاشتراك مرة أخرى:"""

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="❌ إلغاء", callback_data="cancel_verification")]
        ])
        
        await message.answer(error_text, reply_markup=keyboard)


@router.callback_query(F.data == "cancel_verification")
async def cancel_verification(callback: CallbackQuery, state: FSMContext):
    """Cancel verification process"""
    await state.clear()
    await callback.message.edit_text(
        "🚫 تم إلغاء عملية التحقق.\n\n"
        "يمكنك المحاولة مرة أخرى باستخدام /start"
    )
    await callback.answer()


# Quick action callback handlers
@router.callback_query(F.data == "show_help")
async def show_help_callback(callback: CallbackQuery, is_verified: bool):
    """Show help via callback"""
    if not await verified_required(callback, is_verified):
        return
        
    from .help import get_help_text
    help_text = get_help_text()
    
    await callback.message.edit_text(help_text)
    await callback.answer()


@router.callback_query(F.data == "show_content")
async def show_content_callback(callback: CallbackQuery, is_verified: bool):
    """Show content menu via callback"""
    if not await verified_required(callback, is_verified):
        return
        
    # This will be implemented in content.py
    await callback.answer("📚 قائمة المحتوى قيد التطوير...")


@router.callback_query(F.data == "show_schedule")
async def show_schedule_callback(callback: CallbackQuery, is_verified: bool):
    """Show schedule via callback"""
    if not await verified_required(callback, is_verified):
        return
        
    # This will be implemented in schedule.py
    await callback.answer("📅 عرض الجدول قيد التطوير...")


@router.callback_query(F.data == "show_faq")
async def show_faq_callback(callback: CallbackQuery, is_verified: bool):
    """Show FAQ via callback"""
    if not await verified_required(callback, is_verified):
        return
        
    # This will be implemented in faq.py
    await callback.answer("❓ الأسئلة الشائعة قيد التطوير...")


@router.callback_query(F.data == "show_stats")
async def show_stats_callback(callback: CallbackQuery, is_verified: bool):
    """Show statistics via callback"""
    if not await verified_required(callback, is_verified):
        return
        
    # This will be implemented in stats.py
    await callback.answer("📊 الإحصائيات قيد التطوير...")