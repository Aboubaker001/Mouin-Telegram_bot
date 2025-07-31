import { getUserById, checkUserPermission, UserTypes, updateUserActivity } from '../../services/userManagement.js';
import { arabicMessages, arabicCommands } from '../../config/arabic-config.js';
import { logUserAction } from '../../bot/utils/logger.js';

export default async function helpCommand(ctx) {
  try {
    const userId = ctx.from.id;
    
    // تحديث نشاط المستخدم
    await updateUserActivity(userId);
    
    // الحصول على معلومات المستخدم
    const user = await getUserById(userId);
    
    if (!user) {
      await ctx.reply(`❗ **يجب التسجيل أولاً**\n\nاستخدم /ابدأ للتسجيل في الدورة`);
      return;
    }
    
    // تحديد نوع المساعدة بناءً على صلاحيات المستخدم
    let helpMessage = arabicMessages.help.general;
    
    if (checkUserPermission(user, UserTypes.ADMIN)) {
      helpMessage += '\n\n' + arabicMessages.help.admin;
    }
    
    // إضافة معلومات المستخدم
    const userInfoSection = `\n\n👤 **معلوماتك:**\n` +
      `📛 الاسم: ${user.firstName} ${user.lastName}\n` +
      `🎯 النوع: ${getUserTypeText(user.userType)}\n` +
      `📊 الحالة: ${getUserStatusText(user.status)}\n` +
      `📈 الاختبارات المكتملة: ${user.stats.completedQuizzes}\n` +
      `🏆 متوسط الدرجات: ${user.stats.averageScore.toFixed(1)}%`;
    
    helpMessage += userInfoSection;
    
    // إضافة روابط سريعة
    const quickLinksSection = `\n\n🚀 **روابط سريعة:**\n` +
      `• /${arabicCommands.schedule} - جدول هذا الأسبوع\n` +
      `• /${arabicCommands.content} - آخر المحتوى المضاف\n` +
      `• /${arabicCommands.quiz} - اختبار سريع\n` +
      `• /${arabicCommands.reminder} - إعدادات التذكير`;
    
    helpMessage += quickLinksSection;
    
    await ctx.reply(helpMessage);
    logUserAction(userId, 'help_viewed', { userType: user.userType });
    
  } catch (error) {
    console.error('❌ خطأ في أمر المساعدة:', error);
    await ctx.reply(arabicMessages.errors.technicalError.replace('{timestamp}', new Date().toISOString()));
  }
}

// تحويل نوع المستخدم إلى نص عربي
function getUserTypeText(userType) {
  const types = {
    [UserTypes.ADMIN]: '👨‍💼 مشرف',
    [UserTypes.MODERATOR]: '👮‍♂️ مشرف مساعد',
    [UserTypes.STUDENT]: '🎓 طالب',
    [UserTypes.PENDING]: '⏳ في الانتظار'
  };
  
  return types[userType] || 'غير محدد';
}

// تحويل حالة المستخدم إلى نص عربي
function getUserStatusText(status) {
  const statuses = {
    'active': '🟢 نشط',
    'muted': '🔇 مكتوم',
    'banned': '🚫 محظور',
    'pending_verification': '⏳ في انتظار التحقق'
  };
  
  return statuses[status] || 'غير محدد';
}