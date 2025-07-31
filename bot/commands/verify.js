import { verifyUser, isUserVerified } from '../services/userService.js';
import { verificationMessage, successMessages, errorMessages } from '../helpers/messages.js';
import config from '../../config.js';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    const args = ctx.message.text.split(' ').slice(1);
    
    // Check if user is already verified
    if (isUserVerified(userId)) {
      return ctx.reply("✅ أنت مسجل ومتحقق بالفعل!");
    }
    
    // Check if subscription code is provided
    if (args.length === 0) {
      return ctx.reply(verificationMessage);
    }
    
    const subscriptionCode = args[0];
    const result = verifyUser(userId, subscriptionCode);
    
    if (result.success) {
      ctx.reply(successMessages.userVerified);
      
      // Send welcome message with course info
      const nextSession = getNextSession();
      const welcomeMsg = `🎉 مرحبًا بك في دورة ${config.course.name}! 🚀

أنت الآن جزء من مجتمع التعلم
📅 الجلسة القادمة: ${nextSession}
🔗 رابط الزوم: ${config.zoom.fullLink}
📌 تحقق من التعليمات المثبتة وابدأ رحلتك! 💪

📌 استخدم هذه الأوامر:
/المحتوى - عرض المواد التعليمية
/الجدول - عرض الجدول الزمني
/تذكير - تفعيل تذكيرات الجلسات
/أسئلة - الأسئلة الشائعة

🚀 ابدأ رحلتك التعليمية! 💻`;
      
      ctx.reply(welcomeMsg);
    } else {
      ctx.reply(errorMessages.verificationFailed);
    }
  } catch (error) {
    console.error("Error in verify command:", error);
    ctx.reply("❌ حدث خطأ أثناء التحقق. الرجاء المحاولة مرة أخرى.");
  }
};

// Helper function to get next session info
function getNextSession() {
  const now = new Date();
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const today = days[now.getDay()];
  
  // Find next session
  const nextSession = config.schedule.sessions.find(session => {
    const sessionDay = session.day;
    return sessionDay !== today; // For now, just return the first session
  }) || config.schedule.sessions[0];
  
  return `${nextSession.day} - ${nextSession.time}`;
}