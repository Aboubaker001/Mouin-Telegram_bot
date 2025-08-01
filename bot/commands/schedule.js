import { scheduleMessage } from '../helpers/messages.js';
import { isUserVerified } from '../services/userService.js';
import { errorMessages } from '../helpers/messages.js';
import config from '../../config.js';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Check if user is verified
    if (!isUserVerified(userId)) {
      return ctx.reply(errorMessages.notVerified);
    }
    
    const message = scheduleMessage(config.schedule);
    
    // Create inline keyboard for additional options
    const keyboard = {
      inline_keyboard: [
        [
          { text: "🔔 تفعيل التذكيرات", callback_data: "enable_reminders" },
          { text: "📅 الجلسة القادمة", callback_data: "next_session" }
        ],
        [
          { text: "🔗 رابط الزوم", callback_data: "zoom_link" },
          { text: "📝 إضافة إلى التقويم", callback_data: "add_calendar" }
        ]
      ]
    };
    
    ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    
  } catch (error) {
    console.error("Error in schedule command:", error);
    ctx.reply("❌ حدث خطأ أثناء عرض الجدول. الرجاء المحاولة مرة أخرى.");
  }
};