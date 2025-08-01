import { registerUser } from '../services/userService.js';
import { welcomeMessage } from '../helpers/messages.js';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || "بدون اسم";
    const firstName = ctx.from.first_name || "";
    const lastName = ctx.from.last_name || "";
    
    const user = {
      id: userId,
      username,
      firstName,
      lastName,
      registeredAt: new Date().toISOString()
    };
    
    const result = registerUser(user);
    
    if (result.success) {
      await ctx.reply("✅ تم تسجيلك بنجاح لتلقي التذكيرات والإشعارات.");
    } else {
      await ctx.reply("📌 أنت مسجّل مسبقًا في النظام.");
    }

    // رسالة الترحيب العامة
    await ctx.reply(welcomeMessage);

    // قائمة الأوامر بالأزرار (inline keyboard)
    await ctx.reply("📌 اختر من القائمة التالية:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📚 المحتوى", callback_data: "content_all" },
            { text: "📅 الجدول", callback_data: "schedule_show" }
          ],
          [
            { text: "⏰ التذكير", callback_data: "enable_reminders" },
            { text: "❓ الأسئلة", callback_data: "faq_help" }
          ],
          [
            { text: "🧪 اختبار", callback_data: "quiz_start" },
            { text: "📊 إحصائياتي", callback_data: "stats_personal" }
          ]
        ]
      }
    });

  } catch (error) {
    console.error("Error in start command:", error);
    ctx.reply("❌ حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.");
  }
};