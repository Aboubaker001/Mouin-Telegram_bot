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
      ctx.reply("✅ تم تسجيلك بنجاح لتلقي التذكيرات والإشعارات.");
    } else {
      ctx.reply("📌 أنت مسجّل مسبقًا في النظام.");
    }
    
    ctx.reply(welcomeMessage);
  } catch (error) {
    console.error("Error in start command:", error);
    ctx.reply("❌ حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.");
  }
};
