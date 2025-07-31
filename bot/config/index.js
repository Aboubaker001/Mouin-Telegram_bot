import start from '../commands/start.js';
import add from '../commands/add.js';
import remove, { confirmRemove } from '../commands/remove.js';
import view from '../commands/view.js';
import userinfo from '../commands/userinfo.js';
import done from '../commands/done.js';
import messageHandler from '../handlers/messageHandler.js';
import logger from '../middlewares/logger.js';
import { clearUserState, isAssignmentFormat } from '../utils/helpers.js';
import { isAdmin, getAdminInfo } from '../middlewares/auth.js';

export function setupBot(bot) {
  // Apply middleware
  bot.use(logger);

  // Register basic commands
  bot.command('start', start);
  bot.command('view', view);
  bot.command('userinfo', userinfo);
  bot.command('done', done);
  
  // Admin-only commands
  bot.command('add', add);
  bot.command('remove', remove);
  bot.command('confirm_remove', confirmRemove);
  
  // Cancel command to exit conversation states
  bot.command('cancel', (ctx) => {
    clearUserState(ctx.from.id);
    ctx.reply("✅ تم إلغاء العملية الحالية.");
  });
  
  // Admin info command
  bot.command('admin_info', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.reply("🔒 هذا الأمر متاح للمدراء فقط.");
    }
    
    const adminInfo = getAdminInfo();
    const message = 
      "👨‍💼 **معلومات المدراء**\n\n" +
      `📊 **عدد المدراء:** ${adminInfo.count}\n` +
      `🆔 **معرفات المدراء:** ${adminInfo.ids.join(', ')}\n\n` +
      `✅ **حالة النظام:** ${adminInfo.hasAdmins ? 'مُعد بشكل صحيح' : 'لا يوجد مدراء مُعينين'}\n\n` +
      "**الأوامر المتاحة للمدراء:**\n" +
      "• `/add` - إضافة تكليف جديد\n" +
      "• `/remove` - حذف تكليف\n" +
      "• `/admin_info` - معلومات المدراء\n" +
      "• `/stats` - إحصائيات النظام";
    
    await ctx.reply(message);
  });
  
  // Statistics command (admin only)
  bot.command('stats', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      return ctx.reply("🔒 هذا الأمر متاح للمدراء فقط.");
    }
    
    try {
      const { getAllAssignments } = await import('../services/assignmentService.js');
      const { getAllUsers } = await import('../services/userService.js');
      
      const assignments = getAllAssignments();
      const users = getAllUsers();
      
      const activeAssignments = assignments.filter(a => a.status === 'active');
      const completedAssignments = assignments.filter(a => a.completedBy.length > 0);
      const totalCompletions = assignments.reduce((sum, a) => sum + a.completedBy.length, 0);
      
      const now = new Date();
      const overdueAssignments = assignments.filter(a => 
        new Date(a.deadline) < now && a.status === 'active'
      );
      
      const message = 
        "📊 **إحصائيات النظام**\n\n" +
        `👥 **المستخدمون:** ${users.length}\n` +
        `📝 **إجمالي التكليفات:** ${assignments.length}\n` +
        `🟢 **النشطة:** ${activeAssignments.length}\n` +
        `🔴 **المتأخرة:** ${overdueAssignments.length}\n` +
        `✅ **إجمالي الإنجازات:** ${totalCompletions}\n\n` +
        `📈 **معدل الإنجاز:** ${assignments.length > 0 ? Math.round((totalCompletions / assignments.length) * 100) : 0}%\n\n` +
        `🕐 **آخر تحديث:** ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`;
      
      await ctx.reply(message);
    } catch (error) {
      console.error('Error getting stats:', error);
      await ctx.reply("❌ حدث خطأ أثناء جلب الإحصائيات.");
    }
  });
  
  // Enhanced help command
  bot.command('help', (ctx) => {
    const isUserAdmin = isAdmin(ctx.from.id);
    
    let message = 
      "📚 **أوامر البوت المتاحة**\n\n" +
      "👤 **للجميع:**\n" +
      "• `/start` - التسجيل في البوت\n" +
      "• `/view` - عرض التكليفات النشطة\n" +
      "• `/done [رقم]` - تسجيل إنجاز تكليف\n" +
      "• `/userinfo` - معلومات المستخدم\n" +
      "• `/help` - عرض هذه المساعدة\n" +
      "• `/cancel` - إلغاء العملية الحالية\n\n";
    
    if (isUserAdmin) {
      message += 
        "👨‍💼 **للمدراء فقط:**\n" +
        "• `/add` - إضافة تكليف جديد\n" +
        "• `/remove [رقم]` - حذف تكليف\n" +
        "• `/admin_info` - معلومات المدراء\n" +
        "• `/stats` - إحصائيات النظام\n\n";
    }
    
    message += 
      "💡 **نصائح:**\n" +
      "• يمكن إضافة التكليفات بطرق متعددة\n" +
      "• سيتم إرسال تذكيرات تلقائية\n" +
      "• استخدم `/cancel` للخروج من أي عملية\n\n" +
      "**مثال على إضافة تكليف:**\n" +
      "`/add واجب الرياضيات | واجب | 2025-12-31 23:59`";
    
    ctx.reply(message);
  });

  // Handle unknown commands
  bot.on('text', (ctx) => {
    if (ctx.message.text.startsWith('/')) {
      const command = ctx.message.text.split(' ')[0].substring(1);
      const suggestions = ['start', 'help', 'view', 'done'];
      
      if (isAdmin(ctx.from.id)) {
        suggestions.push('add', 'remove', 'stats');
      }
      
      ctx.reply(
        `❌ **أمر غير معروف:** \`/${command}\`\n\n` +
        "**الأوامر المتاحة:**\n" +
        suggestions.map(cmd => `• \`/${cmd}\``).join('\n') + "\n\n" +
        "استخدم `/help` لعرض قائمة كاملة بالأوامر."
      );
    }
  });

  // Handle other message types
  bot.on('message', messageHandler);
  
  // Log bot setup completion
  console.log("✅ Bot commands and handlers configured successfully");
}
