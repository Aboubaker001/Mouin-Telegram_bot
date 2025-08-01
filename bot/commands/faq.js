import { faqMessage } from '../helpers/messages.js';
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
    
    // Process FAQ answers with dynamic content
    const processedFaqs = config.faq.map(faq => ({
      question: faq.question,
      answer: faq.answer
        .replace('{nextDay}', getNextSessionDay())
        .replace('{nextTime}', getNextSessionTime())
        .replace('{zoomLink}', config.zoom.fullLink)
        .replace('{supportChannel}', config.admin.supportChannel)
    }));
    
    const message = faqMessage(processedFaqs);
    
    // Create inline keyboard for FAQ navigation
    const keyboard = {
      inline_keyboard: [
        [
          { text: "📅 مواعيد الجلسات", callback_data: "faq_schedule" },
          { text: "🔗 روابط مهمة", callback_data: "faq_links" }
        ],
        [
          { text: "📚 المحتوى التعليمي", callback_data: "faq_content" },
          { text: "❓ مساعدة إضافية", callback_data: "faq_help" }
        ],
        [
          { text: "📞 التواصل مع الدعم", callback_data: "faq_support" },
          { text: "🔙 العودة للقائمة الرئيسية", callback_data: "main_menu" }
        ]
      ]
    };
    
    ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    
  } catch (error) {
    console.error("Error in FAQ command:", error);
    ctx.reply("❌ حدث خطأ أثناء عرض الأسئلة الشائعة. الرجاء المحاولة مرة أخرى.");
  }
};

// Helper functions to get dynamic content
function getNextSessionDay() {
  const now = new Date();
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const today = days[now.getDay()];
  
  const nextSession = config.schedule.sessions.find(session => 
    session.day !== today
  ) || config.schedule.sessions[0];
  
  return nextSession.day;
}

function getNextSessionTime() {
  const nextSession = config.schedule.sessions[0];
  return nextSession.time;
}