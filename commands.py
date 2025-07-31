import asyncio
from datetime import datetime, timedelta
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from config import Config
from database import db
from scheduler import BotScheduler

router = Router()

# FSM States for interactive commands
class PublishState(StatesGroup):
    waiting_for_announcement = State()

class QuizState(StatesGroup):
    answering_question = State()

class FeedbackState(StatesGroup):
    waiting_for_rating = State()
    waiting_for_comment = State()

# Inline keyboards
def get_content_keyboard():
    """Get content selection keyboard"""
    keyboard = []
    for title, link in Config.CONTENT_LINKS.items():
        keyboard.append([InlineKeyboardButton(text=title, url=link)])
    keyboard.append([InlineKeyboardButton(text="🔙 رجوع", callback_data="back_to_main")])
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_faq_keyboard():
    """Get FAQ selection keyboard"""
    faq_entries = db.get_faq()
    keyboard = []
    for i, entry in enumerate(faq_entries[:8]):  # Limit to 8 entries
        keyboard.append([InlineKeyboardButton(
            text=entry['question'][:30] + "...", 
            callback_data=f"faq_{i}"
        )])
    keyboard.append([InlineKeyboardButton(text="🔙 رجوع", callback_data="back_to_main")])
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_quiz_keyboard(question_index: int):
    """Get quiz keyboard for current question"""
    question = Config.QUIZ_QUESTIONS[question_index]
    keyboard = []
    for i, option in enumerate(question['options']):
        keyboard.append([InlineKeyboardButton(
            text=option,
            callback_data=f"quiz_{question_index}_{i}"
        )])
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_feedback_keyboard():
    """Get feedback rating keyboard"""
    keyboard = [
        [InlineKeyboardButton(text="⭐ ممتاز", callback_data="feedback_5")],
        [InlineKeyboardButton(text="⭐⭐ جيد جداً", callback_data="feedback_4")],
        [InlineKeyboardButton(text="⭐⭐⭐ جيد", callback_data="feedback_3")],
        [InlineKeyboardButton(text="⭐⭐⭐⭐ مقبول", callback_data="feedback_2")],
        [InlineKeyboardButton(text="⭐⭐⭐⭐⭐ ضعيف", callback_data="feedback_1")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_admin_keyboard():
    """Get admin control keyboard"""
    keyboard = [
        [InlineKeyboardButton(text="📢 نشر إعلان", callback_data="admin_publish")],
        [InlineKeyboardButton(text="⏰ إرسال تذكير", callback_data="admin_reminder")],
        [InlineKeyboardButton(text="📊 الإحصائيات", callback_data="admin_stats")],
        [InlineKeyboardButton(text="🎯 إرسال اختبار", callback_data="admin_quiz")],
        [InlineKeyboardButton(text="📝 جمع التقييم", callback_data="admin_feedback")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

# Command handlers
@router.message(Command("start"))
async def start_command(message: Message):
    """Handle /start command"""
    user_data = {
        'id': message.from_user.id,
        'username': message.from_user.username or "بدون اسم",
        'first_name': message.from_user.first_name or "",
        'last_name': message.from_user.last_name or ""
    }
    
    is_new_user = db.register_user(user_data)
    
    if is_new_user:
        await message.reply("✅ تم تسجيلك بنجاح! الرجاء إدخال رمز الاشتراك للتحقق.")
    else:
        # Check if user is verified
        if db.is_verified(message.from_user.id):
            welcome_text = Config.MESSAGES['welcome'].format(
                username=user_data['first_name'] or user_data['username'],
                course_name=Config.COURSE_NAME,
                next_session="الثلاثاء 8:00 مساءً",
                zoom_link=Config.ZOOM_LINK
            )
            await message.reply(welcome_text, parse_mode='Markdown')
        else:
            await message.reply("⚠️ الرجاء إدخال رمز الاشتراك للتحقق من عضويتك.")

@router.message(Command("help"))
async def help_command(message: Message):
    """Handle /help command"""
    help_text = Config.MESSAGES['help']
    await message.reply(help_text, parse_mode='Markdown')

@router.message(Command("schedule"))
async def schedule_command(message: Message):
    """Handle /الجدول command"""
    if not db.is_verified(message.from_user.id):
        await message.reply("⚠️ يجب التحقق من عضويتك أولاً.")
        return
    
    schedule_text = "📅 *جدول الدورة الأسبوعي*\n\n"
    for day, time in Config.SCHEDULE.items():
        schedule_text += f"📚 {day}: {time}\n"
    
    schedule_text += f"\n🔗 رابط الزوم: {Config.ZOOM_LINK}"
    schedule_text += f"\n🔑 كلمة المرور: {Config.ZOOM_PASSWORD}"
    
    await message.reply(schedule_text, parse_mode='Markdown')

@router.message(Command("content"))
async def content_command(message: Message):
    """Handle /المحتوى command"""
    if not db.is_verified(message.from_user.id):
        await message.reply("⚠️ يجب التحقق من عضويتك أولاً.")
        return
    
    content_text = "📚 *المواد التعليمية*\n\nاختر المحتوى الذي تريد الوصول إليه:"
    await message.reply(content_text, reply_markup=get_content_keyboard(), parse_mode='Markdown')

@router.message(Command("faq"))
async def faq_command(message: Message):
    """Handle /أسئلة command"""
    if not db.is_verified(message.from_user.id):
        await message.reply("⚠️ يجب التحقق من عضويتك أولاً.")
        return
    
    faq_text = "❓ *الأسئلة الشائعة*\n\nاختر السؤال الذي تريد إجابته:"
    await message.reply(faq_text, reply_markup=get_faq_keyboard(), parse_mode='Markdown')

@router.message(Command("stats"))
async def stats_command(message: Message):
    """Handle /إحصائيات command (admin only)"""
    if not db.is_admin(message.from_user.id):
        await message.reply("❌ هذا الأمر متاح للمشرفين فقط.")
        return
    
    stats = db.get_statistics()
    stats_text = Config.MESSAGES['stats'].format(
        member_count=stats['member_count'],
        weekly_messages=stats['weekly_messages'],
        attendance_rate=stats['attendance_rate']
    )
    await message.reply(stats_text, parse_mode='Markdown')

@router.message(Command("publish"))
async def publish_command(message: Message, state: FSMContext):
    """Handle /نشر command (admin only)"""
    if not db.is_admin(message.from_user.id):
        await message.reply("❌ هذا الأمر متاح للمشرفين فقط.")
        return
    
    await state.set_state(PublishState.waiting_for_announcement)
    await message.reply("📢 الرجاء إدخال نص الإعلان:")

@router.message(Command("reminder"))
async def reminder_command(message: Message):
    """Handle /تذكير command (admin only)"""
    if not db.is_admin(message.from_user.id):
        await message.reply("❌ هذا الأمر متاح للمشرفين فقط.")
        return
    
    reminder_text = Config.MESSAGES['reminder'].format(zoom_link=Config.ZOOM_LINK)
    await message.reply(reminder_text, parse_mode='Markdown')

@router.message(Command("quiz"))
async def quiz_command(message: Message, state: FSMContext):
    """Handle /اختبار command (admin only)"""
    if not db.is_admin(message.from_user.id):
        await message.reply("❌ هذا الأمر متاح للمشرفين فقط.")
        return
    
    await state.set_state(QuizState.answering_question)
    await state.update_data(question_index=0, answers=[])
    
    question = Config.QUIZ_QUESTIONS[0]
    quiz_text = f"🎯 *الاختبار*\n\nالسؤال 1/3:\n{question['question']}"
    await message.reply(quiz_text, reply_markup=get_quiz_keyboard(0), parse_mode='Markdown')

@router.message(Command("feedback"))
async def feedback_command(message: Message, state: FSMContext):
    """Handle /تقييم command"""
    if not db.is_verified(message.from_user.id):
        await message.reply("⚠️ يجب التحقق من عضويتك أولاً.")
        return
    
    await state.set_state(FeedbackState.waiting_for_rating)
    feedback_text = "📝 *تقييم الجلسة*\n\nكيف تقيم جلسة اليوم؟"
    await message.reply(feedback_text, reply_markup=get_feedback_keyboard(), parse_mode='Markdown')

@router.message(Command("attendance"))
async def attendance_command(message: Message):
    """Handle /حضور command"""
    if not db.is_verified(message.from_user.id):
        await message.reply("⚠️ يجب التحقق من عضويتك أولاً.")
        return
    
    if db.record_attendance(message.from_user.id):
        await message.reply("✅ تم تسجيل حضورك بنجاح! 🎉")
    else:
        await message.reply("❌ حدث خطأ في تسجيل الحضور. الرجاء المحاولة مرة أخرى.")

@router.message(Command("admin"))
async def admin_command(message: Message):
    """Handle /admin command (admin only)"""
    if not db.is_admin(message.from_user.id):
        await message.reply("❌ هذا الأمر متاح للمشرفين فقط.")
        return
    
    admin_text = "🔧 *لوحة تحكم المشرف*\n\nاختر الإجراء المطلوب:"
    await message.reply(admin_text, reply_markup=get_admin_keyboard(), parse_mode='Markdown')

# Callback query handlers
@router.callback_query(F.data == "back_to_main")
async def back_to_main(callback: CallbackQuery):
    """Handle back to main menu"""
    await callback.message.delete()
    await callback.answer()

@router.callback_query(F.data.startswith("faq_"))
async def handle_faq(callback: CallbackQuery):
    """Handle FAQ selection"""
    faq_index = int(callback.data.split("_")[1])
    faq_entries = db.get_faq()
    
    if faq_index < len(faq_entries):
        entry = faq_entries[faq_index]
        faq_text = f"❓ *{entry['question']}*\n\n{entry['answer']}"
        await callback.message.edit_text(faq_text, parse_mode='Markdown')
    
    await callback.answer()

@router.callback_query(F.data.startswith("quiz_"))
async def handle_quiz_answer(callback: CallbackQuery, state: FSMContext):
    """Handle quiz answer"""
    parts = callback.data.split("_")
    question_index = int(parts[1])
    answer_index = int(parts[2])
    
    data = await state.get_data()
    answers = data.get('answers', [])
    answers.append(answer_index)
    
    if question_index < len(Config.QUIZ_QUESTIONS) - 1:
        # Next question
        next_question_index = question_index + 1
        question = Config.QUIZ_QUESTIONS[next_question_index]
        
        quiz_text = f"🎯 *الاختبار*\n\nالسؤال {next_question_index + 1}/3:\n{question['question']}"
        await callback.message.edit_text(
            quiz_text, 
            reply_markup=get_quiz_keyboard(next_question_index), 
            parse_mode='Markdown'
        )
        
        await state.update_data(question_index=next_question_index, answers=answers)
    else:
        # Quiz completed
        answers.append(answer_index)
        score = 0
        for i, answer in enumerate(answers):
            if answer == Config.QUIZ_QUESTIONS[i]['correct']:
                score += 1
        
        # Save quiz result
        quiz_id = f"quiz_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        db.save_quiz_result(
            callback.from_user.id, 
            quiz_id, 
            score, 
            len(Config.QUIZ_QUESTIONS), 
            str(answers)
        )
        
        result_text = f"🎯 *نتيجة الاختبار*\n\nالدرجة: {score}/{len(Config.QUIZ_QUESTIONS)}\n"
        if score == len(Config.QUIZ_QUESTIONS):
            result_text += "🎉 ممتاز! إجابات صحيحة تماماً!"
        elif score >= len(Config.QUIZ_QUESTIONS) * 0.7:
            result_text += "👍 جيد جداً!"
        elif score >= len(Config.QUIZ_QUESTIONS) * 0.5:
            result_text += "👌 جيد"
        else:
            result_text += "📚 راجع المواد مرة أخرى"
        
        await callback.message.edit_text(result_text, parse_mode='Markdown')
        await state.clear()
    
    await callback.answer()

@router.callback_query(F.data.startswith("feedback_"))
async def handle_feedback_rating(callback: CallbackQuery, state: FSMContext):
    """Handle feedback rating"""
    rating = int(callback.data.split("_")[1])
    await state.update_data(rating=rating)
    await state.set_state(FeedbackState.waiting_for_comment)
    
    feedback_text = "📝 *تقييم الجلسة*\n\nتم تسجيل تقييمك. هل تريد إضافة تعليق؟ (اختياري)\n\nأرسل 'لا' إذا كنت لا تريد إضافة تعليق."
    await callback.message.edit_text(feedback_text, parse_mode='Markdown')
    await callback.answer()

@router.callback_query(F.data.startswith("admin_"))
async def handle_admin_action(callback: CallbackQuery, state: FSMContext):
    """Handle admin actions"""
    action = callback.data.split("_")[1]
    
    if action == "publish":
        await state.set_state(PublishState.waiting_for_announcement)
        await callback.message.edit_text("📢 الرجاء إدخال نص الإعلان:")
    
    elif action == "reminder":
        reminder_text = Config.MESSAGES['reminder'].format(zoom_link=Config.ZOOM_LINK)
        await callback.message.edit_text(reminder_text, parse_mode='Markdown')
    
    elif action == "stats":
        stats = db.get_statistics()
        stats_text = Config.MESSAGES['stats'].format(
            member_count=stats['member_count'],
            weekly_messages=stats['weekly_messages'],
            attendance_rate=stats['attendance_rate']
        )
        await callback.message.edit_text(stats_text, parse_mode='Markdown')
    
    elif action == "quiz":
        await state.set_state(QuizState.answering_question)
        await state.update_data(question_index=0, answers=[])
        
        question = Config.QUIZ_QUESTIONS[0]
        quiz_text = f"🎯 *الاختبار*\n\nالسؤال 1/3:\n{question['question']}"
        await callback.message.edit_text(quiz_text, reply_markup=get_quiz_keyboard(0), parse_mode='Markdown')
    
    elif action == "feedback":
        feedback_text = "📝 *تقييم الجلسة*\n\nكيف تقيم جلسة اليوم؟"
        await callback.message.edit_text(feedback_text, reply_markup=get_feedback_keyboard(), parse_mode='Markdown')
    
    await callback.answer()

# State handlers
@router.message(PublishState.waiting_for_announcement)
async def handle_announcement_text(message: Message, state: FSMContext):
    """Handle announcement text input"""
    announcement_text = message.text
    await state.clear()
    
    # Send announcement to group
    formatted_announcement = f"📢 *إعلان مهم*\n\n{announcement_text}\n\n📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    await message.reply("✅ تم إرسال الإعلان بنجاح!", parse_mode='Markdown')
    
    # In a real implementation, you would send this to the group
    # await bot.send_message(GROUP_ID, formatted_announcement, parse_mode='Markdown')

@router.message(FeedbackState.waiting_for_comment)
async def handle_feedback_comment(message: Message, state: FSMContext):
    """Handle feedback comment input"""
    data = await state.get_data()
    rating = data.get('rating', 0)
    comment = message.text if message.text.lower() != 'لا' else None
    
    # Save feedback
    if db.save_feedback(message.from_user.id, rating, comment):
        await message.reply("✅ تم حفظ تقييمك بنجاح! شكراً لك! 🎉")
    else:
        await message.reply("❌ حدث خطأ في حفظ التقييم. الرجاء المحاولة مرة أخرى.")
    
    await state.clear()

# Message handler for logging
@router.message()
async def handle_all_messages(message: Message):
    """Handle all messages for logging"""
    if message.from_user:
        db.log_message(message.from_user.id, message.text or "non-text message", "text")