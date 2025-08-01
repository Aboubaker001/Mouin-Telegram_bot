import { verifyUser, isUserVerified } from '../services/userService.js';
import { verificationMessage, successMessages, errorMessages } from '../helpers/messages.js';
import config from '../../config.js';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    const text = ctx.message?.text || ctx.update?.message?.text || '';
    const args = text.split(' ').slice(1);

    console.log('🔐 تحقق: userId =', userId);
    console.log('📩 نص الأمر:', text);

    // التحقق من إذا كان المستخدم موثّق مسبقًا
    if (isUserVerified(userId)) {
      return ctx.reply("✅ أنت متحقق بالفعل!");
    }

    // التحقق من وجود الرمز
    if (args.length === 0) {
      return ctx.reply(verificationMessage);
    }

    const subscriptionCode = args[0];
    const result = verifyUser(userId, subscriptionCode);

    if (result.success) {
      ctx.reply(successMessages.userVerified);

      const nextSession = getNextSession();
      const welcomeMsg = `${config.messages.welcome.title.replace('{courseName}', config.course.name)}

${config.messages.welcome.body
  .replace('{nextSession}', nextSession)
  .replace('{zoomLink}', config.zoom.fullLink)}

📌 استخدم هذه الأوامر:
/المحتوى - عرض المواد التعليمية
/الجدول - عرض الجدول الزمني
/تذكير - تفعيل تذكيرات الجلسات
/أسئلة - الأسئلة الشائعة

🚀 ابدأ رحلتك التعليمية! 💻`;

      return ctx.reply(welcomeMsg);
    } else {
      return ctx.reply("❌ رمز الاشتراك غير صحيح.");
    }
  } catch (error) {
    console.error("❌ Error in /تحقق:", error);
    return ctx.reply("حدث خطأ أثناء محاولة التحقق. حاول مجددًا.");
  }
};

// استخراج الجلسة القادمة
function getNextSession() {
  const now = new Date();
  const daysMap = {
    'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2,
    'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
  };

  const sessions = config.schedule.sessions.map((s) => ({
    ...s,
    dayIndex: daysMap[s.day] ?? 0
  }));

  sessions.sort((a, b) => a.dayIndex - b.dayIndex);

  for (const session of sessions) {
    const dayDiff = (session.dayIndex + 7 - now.getDay()) % 7;
    const sessionDate = new Date(now);
    sessionDate.setDate(now.getDate() + dayDiff);
    sessionDate.setHours(parseInt(session.time.split(':')[0]), parseInt(session.time.split(':')[1]));

    if (sessionDate > now) {
      return `${session.day} - ${session.time}`;
    }
  }

  return `${sessions[0].day} - ${sessions[0].time}`;
}