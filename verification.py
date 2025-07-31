from aiogram import Router, F
from aiogram.types import Message
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from database import db
from config import Config

router = Router()

class VerificationState(StatesGroup):
    waiting_for_code = State()

@router.message(Command("verify"))
async def verify_command(message: Message, state: FSMContext):
    """Handle /verify command for subscription code verification"""
    user_id = message.from_user.id
    
    # Check if user is already verified
    if db.is_verified(user_id):
        await message.reply("✅ أنت مسجل ومتحقق بالفعل!")
        return
    
    # Check if user is registered
    user = db.get_user(user_id)
    if not user:
        await message.reply("⚠️ الرجاء استخدام /start أولاً لتسجيل حسابك.")
        return
    
    await state.set_state(VerificationState.waiting_for_code)
    await message.reply(
        "🔐 *التحقق من العضوية*\n\n"
        "الرجاء إدخال رمز الاشتراك الخاص بك:",
        parse_mode='Markdown'
    )

@router.message(VerificationState.waiting_for_code)
async def handle_verification_code(message: Message, state: FSMContext):
    """Handle subscription code input"""
    user_id = message.from_user.id
    subscription_code = message.text.strip()
    
    # Verify the code
    if db.verify_user(user_id, subscription_code):
        await state.clear()
        
        # Send welcome message
        user = db.get_user(user_id)
        welcome_text = Config.MESSAGES['welcome'].format(
            username=user['first_name'] or user['username'],
            course_name=Config.COURSE_NAME,
            next_session="الثلاثاء 8:00 مساءً",
            zoom_link=Config.ZOOM_LINK
        )
        
        await message.reply(
            "✅ تم التحقق من عضويتك بنجاح! 🎉\n\n" + welcome_text,
            parse_mode='Markdown'
        )
    else:
        await message.reply(
            "❌ رمز الاشتراك غير صحيح.\n"
            "الرجاء التأكد من الرمز والمحاولة مرة أخرى."
        )

@router.message(Command("status"))
async def status_command(message: Message):
    """Handle /status command to check verification status"""
    user_id = message.from_user.id
    user = db.get_user(user_id)
    
    if not user:
        await message.reply("⚠️ أنت غير مسجل. استخدم /start لتسجيل حسابك.")
        return
    
    if db.is_verified(user_id):
        status_text = "✅ *حالة العضوية: متحقق*\n\n"
        status_text += f"👤 الاسم: {user['first_name']} {user['last_name']}\n"
        status_text += f"📅 تاريخ التسجيل: {user['registered_at'][:10]}\n"
        status_text += f"⚠️ التحذيرات: {user['warnings']}/{Config.MAX_WARNINGS}"
        
        if user['is_muted']:
            status_text += "\n🔇 الحالة: محظور مؤقتاً"
    else:
        status_text = "❌ *حالة العضوية: غير متحقق*\n\n"
        status_text += "استخدم /verify لإدخال رمز الاشتراك."
    
    await message.reply(status_text, parse_mode='Markdown')