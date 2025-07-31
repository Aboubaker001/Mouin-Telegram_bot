import { registerUser, updateUserActivity } from '../../services/userManagement.js';
import { arabicMessages, botConfig } from '../../config/arabic-config.js';
import { logUserAction } from '../../bot/utils/logger.js';

export default async function startCommand(ctx) {
  try {
    const userInfo = ctx.from;
    
    // تحديث نشاط المستخدم
    await updateUserActivity(userInfo.id);
    
    // استخراج رقم الاشتراك من الرسالة (إن وجد)
    const messageText = ctx.message.text;
    const parts = messageText.split(' ');
    const subscriptionCode = parts.length > 1 ? parts[1] : null;
    
    // تسجيل المستخدم
    const result = await registerUser(userInfo, subscriptionCode);
    
    if (result.success) {
      if (result.isNew) {
        // مستخدم جديد
        if (result.message === 'pending_verification') {
          await ctx.reply(arabicMessages.errors.userNotVerified);
          logUserAction(userInfo.id, 'registration_pending_verification');
        } else {
          await ctx.reply(arabicMessages.success.userRegistered);
          await ctx.reply(arabicMessages.welcome.newUser);
          logUserAction(userInfo.id, 'new_user_welcomed');
        }
      } else {
        // مستخدم عائد
        const lastSeen = new Date(result.user.lastSeen).toLocaleString('ar-EG', {
          timeZone: botConfig.timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const welcomeMessage = arabicMessages.welcome.returningUser
          .replace('{lastSeen}', lastSeen);
        
        await ctx.reply(welcomeMessage);
        logUserAction(userInfo.id, 'returning_user_welcomed');
      }
    } else {
      // فشل في التسجيل
      if (result.message === 'invalid_subscription_code') {
        await ctx.reply(`❌ **رقم اشتراك غير صحيح**\n\n${result.error}\n\n💡 **المساعدة:**\nأرسل الأمر بالصيغة التالية:\n/ابدأ 123456`);
      } else {
        const errorMessage = arabicMessages.errors.technicalError
          .replace('{timestamp}', new Date().toLocaleString('ar-EG', { timeZone: botConfig.timezone }));
        await ctx.reply(errorMessage);
      }
      logUserAction(userInfo.id, 'registration_failed', { reason: result.message });
    }
    
  } catch (error) {
    console.error('❌ خطأ في أمر البدء:', error);
    const errorMessage = arabicMessages.errors.technicalError
      .replace('{timestamp}', new Date().toLocaleString('ar-EG', { timeZone: botConfig.timezone }));
    await ctx.reply(errorMessage);
  }
}