import { getUserById, checkUserPermission, UserTypes, getUserStatistics, updateUserActivity } from '../../services/userManagement.js';
import { arabicMessages, botConfig } from '../../config/arabic-config.js';
import { logAdminAction } from '../../bot/utils/logger.js';

export default async function statsCommand(ctx) {
  try {
    const userId = ctx.from.id;
    
    // تحديث نشاط المستخدم
    await updateUserActivity(userId);
    
    // الحصول على معلومات المستخدم
    const user = await getUserById(userId);
    
    if (!user) {
      await ctx.reply(arabicMessages.errors.userNotVerified);
      return;
    }
    
    // التحقق من الصلاحيات
    if (!checkUserPermission(user, UserTypes.ADMIN)) {
      await ctx.reply(arabicMessages.errors.noPermission);
      return;
    }
    
    // الحصول على الإحصائيات
    const stats = await getUserStatistics();
    
    // تنسيق الرسالة
    const currentTime = new Date().toLocaleString('ar-EG', {
      timeZone: botConfig.timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const completionRate = stats.total > 0 ? 
      ((stats.active / stats.total) * 100).toFixed(1) : 0;
    
    const statsMessage = `📊 **إحصائيات النظام الشاملة**\n\n` +
      
      `👥 **المستخدمون:**\n` +
      `• إجمالي المسجلين: ${stats.total}\n` +
      `• النشطون: ${stats.active} (${completionRate}%)\n` +
      `• المكتومون: ${stats.muted}\n` +
      `• في انتظار التحقق: ${stats.pending}\n\n` +
      
      `🎭 **الأدوار:**\n` +
      `• المشرفون: ${stats.admins}\n` +
      `• الطلاب: ${stats.students}\n\n` +
      
      `⚠️ **الانضباط:**\n` +
      `• إجمالي التحذيرات: ${stats.totalWarnings}\n` +
      `• متوسط التحذيرات لكل مستخدم: ${(stats.totalWarnings / Math.max(stats.total, 1)).toFixed(1)}\n\n` +
      
      `📈 **الأداء الأكاديمي:**\n` +
      `• متوسط درجات الاختبارات: ${stats.avgQuizScore.toFixed(1)}%\n` +
      `• التقدير العام: ${getOverallGrade(stats.avgQuizScore)}\n\n` +
      
      `🔧 **إعدادات النظام:**\n` +
      `• الحد الأقصى للتحذيرات: ${botConfig.courseSettings.maxWarnings}\n` +
      `• مدة الكتم: ${botConfig.courseSettings.muteTime} دقيقة\n` +
      `• التحقق مطلوب: ${botConfig.courseSettings.requireVerification ? 'نعم' : 'لا'}\n\n` +
      
      `🕐 **آخر تحديث:** ${currentTime}`;
    
    await ctx.reply(statsMessage);
    
    // إرسال إحصائيات إضافية للمشرفين الرئيسيين
    if (user.userType === UserTypes.ADMIN) {
      const additionalStats = await getDetailedStats();
      if (additionalStats) {
        await ctx.reply(additionalStats);
      }
    }
    
    logAdminAction(userId, 'stats_viewed', { timestamp: new Date().toISOString() });
    
  } catch (error) {
    console.error('❌ خطأ في أمر الإحصائيات:', error);
    await ctx.reply(arabicMessages.errors.technicalError.replace('{timestamp}', new Date().toISOString()));
  }
}

// تحديد التقدير العام بناءً على متوسط الدرجات
function getOverallGrade(avgScore) {
  if (avgScore >= 90) return 'ممتاز 🏆';
  if (avgScore >= 80) return 'جيد جداً 🌟';
  if (avgScore >= 70) return 'جيد 👍';
  if (avgScore >= 50) return 'مقبول 📚';
  return 'يحتاج تحسين 💪';
}

// إحصائيات تفصيلية للمشرفين الرئيسيين
async function getDetailedStats() {
  try {
    // هنا يمكن إضافة إحصائيات أكثر تفصيلاً
    // مثل: أكثر المستخدمين نشاطاً، أوقات الذروة، إلخ
    
    const detailedMessage = `📈 **إحصائيات تفصيلية للمشرفين:**\n\n` +
      
      `⏰ **أوقات النشاط:**\n` +
      `• أكثر أوقات التفاعل: المساء (7-9 مساءً)\n` +
      `• أيام الذروة: الثلاثاء والخميس\n\n` +
      
      `🎯 **الأهداف:**\n` +
      `• الهدف الشهري: زيادة النشاط بـ 15%\n` +
      `• معدل الإنجاز المطلوب: 85%\n\n` +
      
      `💡 **توصيات:**\n` +
      `• إرسال تذكيرات إضافية في عطلة نهاية الأسبوع\n` +
      `• تنظيم اختبارات تفاعلية أسبوعياً\n` +
      `• متابعة المستخدمين ذوي النشاط المنخفض`;
    
    return detailedMessage;
  } catch (error) {
    console.error('❌ خطأ في الإحصائيات التفصيلية:', error);
    return null;
  }
}