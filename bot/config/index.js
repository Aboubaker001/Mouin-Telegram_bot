import start from '../commands/start.js';
import add from '../commands/add.js';
import remove from '../commands/remove.js';
import view from '../commands/view.js';
import userinfo from '../commands/userinfo.js';
import done from '../commands/done.js';

// New enhanced commands
import verify from '../commands/verify.js';
import schedule from '../commands/schedule.js';
import content from '../commands/content.js';
import faq from '../commands/faq.js';
import quiz from '../commands/quiz.js';
import stats from '../commands/stats.js';
import publish from '../commands/publish.js';
import reminder from '../commands/reminder.js';

// Handlers
import messageHandler from '../handlers/messageHandler.js';
import callbackHandler from '../handlers/callbackHandler.js';
import logger from '../middlewares/logger.js';

export function setupBot(bot) {
  // Apply middleware
  bot.use(logger);

  // Register basic commands (keeping original for backward compatibility)
  bot.command('start', start);
  bot.command('add', add);
  bot.command('remove', remove);
  bot.command('view', view);
  bot.command('userinfo', userinfo);
  bot.command('done', done);
  
  // Register English aliases for convenience
  bot.command('verify', verify);
  bot.command('schedule', schedule);
  bot.command('content', content);
  bot.command('faq', faq);
  bot.command('quiz', quiz);
  bot.command('stats', stats);
  bot.command('publish', publish);
  bot.command('reminder', reminder);
  
  // Help command with enhanced Arabic support
  bot.command('help', (ctx) => ctx.reply(
    "📚 *قائمة الأوامر المتاحة*\n\n" +
    "👋 *أوامر أساسية:*\n" +
    "/ابدأ - بدء استخدام البوت والتسجيل\n" +
    "/تحقق [رمز] - التحقق من الهوية\n" +
    "/مساعدة - عرض هذه القائمة\n" +
    "/معلوماتي - عرض معلومات المستخدم\n\n" +
    "📅 *أوامر الجدول والتذكيرات:*\n" +
    "/الجدول - عرض جدول الجلسات الأسبوعي\n" +
    "/تذكير - تفعيل/إلغاء تذكيرات الجلسات\n" +
    "/الجلسة_القادمة - معلومات الجلسة القادمة\n\n" +
    "📚 *أوامر المحتوى التعليمي:*\n" +
    "/المحتوى - عرض جميع المواد التعليمية\n" +
    "/ملفات - عرض الملفات والكتب\n" +
    "/فيديوهات - عرض الفيديوهات التعليمية\n\n" +
    "❓ *أوامر المساعدة:*\n" +
    "/أسئلة - الأسئلة الشائعة\n" +
    "/اختبار - بدء اختبار قصير\n" +
    "/تقييم - تقييم الجلسة\n\n" +
    "📊 *أوامر الإحصائيات:*\n" +
    "/إحصائيات - إحصائيات المجموعة (للمدربين)\n" +
    "/إحصائياتي - إحصائياتك الشخصية\n\n" +
    "🔧 *أوامر الإدارة (للمدربين):*\n" +
    "/نشر - نشر إعلان جديد\n" +
    "/حظر - حظر مستخدم\n" +
    "/إلغاء_حظر - إلغاء حظر مستخدم", {
      parse_mode: 'Markdown'
    }
  ));

  // Handle callback queries (inline keyboard buttons)
  bot.on('callback_query', callbackHandler);

  // Handle unknown commands
  bot.on('text', (ctx) => {
    if (ctx.message.text.startsWith('/')) {
      ctx.reply("📚 استخدم الأمر /مساعدة لعرض قائمة الأوامر المتاحة.");
    }
  });

  // Handle other message types
  bot.on('message', messageHandler);
}
