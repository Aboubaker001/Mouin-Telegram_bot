import { getUserState, clearUserState, isAssignmentFormat } from '../utils/helpers.js';
import { processAssignmentData } from '../commands/add.js';
import { isAdmin } from '../middlewares/auth.js';

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
      // Check if user is still admin (security check)
      if (!isAdmin(userId)) {
        clearUserState(userId);
        return ctx.reply(
          "🔒 **انتهت الصلاحية**\n\n" +
          "لم تعد لديك صلاحيات إضافة التكليفات. تم إلغاء العملية."
        );
      }
      
      if (isAssignmentFormat(messageText)) {
        // Process the assignment data
        await processAssignmentData(ctx, messageText);
      } else {
        ctx.reply(
          "⚠️ **صيغة غير صحيحة**\n\n" +
          "الرجاء إدخال البيانات بالشكل التالي:\n" +
          "`العنوان | النوع | الموعد النهائي`\n\n" +
          "**أمثلة صحيحة:**\n" +
          "• `واجب الرياضيات | واجب | 2025-12-31 23:59`\n" +
          "• `مشاهدة درس أدب الطلب | درس | 2025-08-04 21:30`\n" +
          "• `كتابة تأمل | تأمل | 2025-08-05`\n\n" +
          "اكتب `/cancel` للإلغاء"
        );
      }
      return;
    }
    
    // Handle general messages
    if (messageText) {
      // Check if it looks like assignment data (smart detection)
      if (isAssignmentFormat(messageText)) {
        if (isAdmin(userId)) {
          ctx.reply(
            "📝 **يبدو أنك تريد إضافة تكليف!**\n\n" +
            "لإضافة تكليف، استخدم الأمر `/add` أولاً، أو أرسل:\n" +
            `\`/add ${messageText}\`\n\n` +
            "**أو استخدم الطريقة التفاعلية:**\n" +
            "1. اكتب `/add`\n" +
            "2. أرسل البيانات في الرسالة التالية"
          );
        } else {
          ctx.reply(
            "📝 **تم اكتشاف تنسيق تكليف**\n\n" +
            "يبدو أنك تحاول إضافة تكليف، لكن هذه الصلاحية متاحة للمدراء فقط.\n\n" +
            "إذا كنت مدير، تأكد من إضافة معرف المستخدم الخاص بك إلى إعدادات ADMIN_IDS.\n\n" +
            `🆔 **معرف المستخدم الخاص بك:** \`${userId}\``
          );
        }
      } else {
        // Check for common user queries
        const lowerText = messageText.toLowerCase();
        
        if (lowerText.includes('مساعدة') || lowerText.includes('help')) {
          ctx.reply(
            "👋 **أهلاً بك!**\n\n" +
            "استخدم `/help` لعرض قائمة الأوامر المتاحة.\n\n" +
            "**الأوامر الأساسية:**\n" +
            "• `/start` - التسجيل\n" +
            "• `/view` - عرض التكليفات\n" +
            "• `/done [رقم]` - إنجاز تكليف\n" +
            "• `/help` - المساعدة الكاملة"
          );
        } else if (lowerText.includes('شكرا') || lowerText.includes('شكراً')) {
          ctx.reply("🌟 عفواً! سعداء بخدمتك دائماً 😊");
        } else if (lowerText.includes('سلام') || lowerText.includes('مرحبا')) {
          ctx.reply(
            "👋 أهلاً وسهلاً بك!\n\n" +
            "أنا بوت معين المجتهدين، هنا لمساعدتك في تنظيم تكليفاتك الدراسية.\n\n" +
            "اكتب `/help` للبدء!"
          );
        } else {
          // Generic helpful response
          ctx.reply(
            "👋 **مرحباً!**\n\n" +
            "لست متأكداً من كيفية مساعدتك في هذا. استخدم `/help` لعرض الأوامر المتاحة.\n\n" +
            "**نصائح سريعة:**\n" +
            "• `/view` - لعرض تكليفاتك\n" +
            "• `/done [رقم]` - لتسجيل إنجاز تكليف\n" +
            "• `/help` - للمساعدة الكاملة\n\n" +
            "🤖 إذا كنت تواجه مشكلة، جرب إعادة كتابة طلبك بشكل مختلف."
          );
        }
      }
    }
    
  } catch (error) {
    console.error("Error in message handler:", error);
    ctx.reply(
      "❌ **حدث خطأ**\n\n" +
      "عذراً، حدث خطأ أثناء معالجة رسالتك.\n" +
      "الرجاء المحاولة مرة أخرى أو استخدام `/help` للمساعدة."
    );
  }
};
