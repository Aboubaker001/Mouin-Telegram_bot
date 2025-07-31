import { getUserState, clearUserState, isAssignmentFormat } from '../utils/helpers.js';
import { processAssignmentData } from '../commands/add.js';

export default async (ctx) => {
  try {
    // Skip if it's a command
    if (ctx.message.text && ctx.message.text.startsWith('/')) {
      return;
    }
    
    const userId = ctx.from.id;
    const userState = getUserState(userId);
    const messageText = ctx.message.text;
    
    // Handle user states
    if (userState === 'awaiting_assignment') {
      if (isAssignmentFormat(messageText)) {
        // Process the assignment data
        await processAssignmentData(ctx, messageText);
      } else {
        ctx.reply(
          "⚠️ الصيغة غير صحيحة. الرجاء إدخال البيانات بالشكل التالي:\n" +
          "العنوان | النوع | الموعد النهائي\n\n" +
          "مثال: مشاهدة درس أدب الطلب | درس | 2025-08-04 21:30\n\n" +
          "أو اكتب /cancel للإلغاء"
        );
      }
      return;
    }
    
    // Handle general messages
    if (messageText) {
      // Check if it looks like assignment data (in case user sends it without /add first)
      if (isAssignmentFormat(messageText)) {
        ctx.reply(
          "📝 يبدو أنك تريد إضافة تكليف!\n\n" +
          "لإضافة تكليف، استخدم الأمر /add أولاً، أو أرسل:\n" +
          `/add ${messageText}`
        );
      } else {
        // Generic helpful response
        ctx.reply(
          "👋 مرحباً! استخدم الأمر /help لعرض قائمة الأوامر المتاحة.\n\n" +
          "للإضافة السريعة، يمكنك كتابة:\n" +
          "/add عنوان التكليف | نوع التكليف | الموعد النهائي"
        );
      }
    }
    
  } catch (error) {
    console.error("Error in message handler:", error);
    ctx.reply("❌ حدث خطأ. الرجاء المحاولة مرة أخرى أو استخدام /help للمساعدة.");
  }
};
