import start from '../commands/start.js';
import add from '../commands/add.js';
import remove from '../commands/remove.js';
import view from '../commands/view.js';
import userinfo from '../commands/userinfo.js';
import done from '../commands/done.js';
import messageHandler from '../handlers/messageHandler.js';
import logger from '../middlewares/logger.js';
import { clearUserState } from '../utils/helpers.js';

export function setupBot(bot) {
  // Apply middleware
  bot.use(logger);

  // Register commands
  bot.command('start', start);
  bot.command('add', add);
  bot.command('remove', remove);
  bot.command('view', view);
  bot.command('userinfo', userinfo);
  bot.command('done', done);
  
  // Cancel command to exit conversation states
  bot.command('cancel', (ctx) => {
    clearUserState(ctx.from.id);
    ctx.reply("✅ تم إلغاء العملية الحالية.");
  });
  
  // Help command
  bot.command('help', (ctx) => ctx.reply(
    "📚 استخدم الأوامر التالية:\n" +
    "/start - لبدء استخدام البوت والتسجيل\n" +
    "/add - لإضافة تكليف جديد\n" +
    "/view - لعرض التكليفات النشطة\n" +
    "/done - لتأكيد إنجاز التكليف\n" +
    "/remove - لإزالة تكليف\n" +
    "/userinfo - لعرض معلومات المستخدم\n" +
    "/cancel - لإلغاء العملية الحالية\n\n" +
    "💡 نصيحة: يمكنك إضافة تكليف بطريقتين:\n" +
    "1️⃣ /add ثم أرسل البيانات في رسالة منفصلة\n" +
    "2️⃣ /add العنوان | النوع | الموعد (كله في رسالة واحدة)"
  ));

  // Handle unknown commands
  bot.on('text', (ctx) => {
    if (ctx.message.text.startsWith('/')) {
      ctx.reply("📚 أمر غير معروف. استخدم الأمر /help لعرض قائمة الأوامر المتاحة.");
    }
  });

  // Handle other message types
  bot.on('message', messageHandler);
}
