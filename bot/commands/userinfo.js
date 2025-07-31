import { getUserInfo } from '../services/userService.js';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    const user = getUserInfo(userId);
    
    if (user) {
      ctx.reply(
        "👤 معلومات المستخدم:\n" +
        `🆔 المعرف: ${user.id}\n` +
        `👤 الاسم المستخدم: ${user.username || "غير محدد"}\n` +
        `📅 تاريخ التسجيل: ${new Date(user.registeredAt).toLocaleString('ar-EG')}`
      );
    } else {
      ctx.reply("⚠️ أنت غير مسجل. الرجاء استخدام الأمر /start للتسجيل.");
    }
  } catch (error) {
    console.error("Error in userinfo command:", error);
    ctx.reply("❌ حدث خطأ أثناء استرجاع معلومات المستخدم. الرجاء المحاولة مرة أخرى.");
  }
};
