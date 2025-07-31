import start from '../commands/start.js';
import add from '../commands/add.js';
import remove from '../commands/remove.js';
import view from '../commands/view.js';
import userinfo from '../commands/userinfo.js';
import done from '../commands/done.js';
import messageHandler from '../handlers/messageHandler.js';
import logger from '../middlewares/logger.js';

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
  
  // Help command
  bot.command('help', (ctx) => ctx.reply(
    "📚 استخدم الأوامر التالية:\n" +
    "/start - لبدء استخدام البوت والتسجيل\n" +
    "/add - لإضافة تكليف\n" +
    "/remove - لإزالة تكليف\n" +
    "/view - لعرض التكليفات\n" +
    "/userinfo - لعرض معلومات المستخدم\n" +
    "/done - لتأكيد إنجاز التكليف"
  ));

  // Handle unknown commands
  bot.on('text', (ctx) => {
    if (ctx.message.text.startsWith('/')) {
      ctx.reply("📚 استخدم الأمر /help لعرض قائمة الأوامر المتاحة.");
    }
  });

  // Handle other message types
  bot.on('message', messageHandler);
}
