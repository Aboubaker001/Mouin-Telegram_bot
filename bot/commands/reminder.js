import { isUserVerified, isUserAdmin, toggleReminders, getUsersWithReminders } from '../services/userService.js';
import { errorMessages, successMessages, sessionReminder } from '../helpers/messages.js';
import config from '../../config.js';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Check if user is verified
    if (!isUserVerified(userId)) {
      return ctx.reply(errorMessages.notVerified);
    }
    
    const args = ctx.message.text.split(' ').slice(1);
    
    if (args.length === 0) {
      // Show reminder status and options
      return showReminderStatus(ctx, userId);
    }
    
    const action = args[0];
    
    if (action === 'تشغيل' || action === 'on') {
      const result = toggleReminders(userId);
      if (result.remindersEnabled) {
        ctx.reply(successMessages.reminderEnabled);
      } else {
        ctx.reply(successMessages.reminderDisabled);
      }
    } else if (action === 'إيقاف' || action === 'off') {
      const result = toggleReminders(userId);
      if (!result.remindersEnabled) {
        ctx.reply(successMessages.reminderDisabled);
      } else {
        ctx.reply(successMessages.reminderEnabled);
      }
    } else if (action === 'إرسال' && isUserAdmin(userId)) {
      // Admin can send manual reminder
      await sendManualReminder(ctx, args.slice(1).join(' '));
    } else {
      ctx.reply(`📝 *أوامر التذكيرات:*

/تذكير - عرض حالة التذكيرات
/تذكير تشغيل - تفعيل التذكيرات
/تذكير إيقاف - إلغاء التذكيرات

*للمدربين:*
/تذكير إرسال [نص_التذكير] - إرسال تذكير يدوي`, {
        parse_mode: 'Markdown'
      });
    }
    
  } catch (error) {
    console.error("Error in reminder command:", error);
    ctx.reply("❌ حدث خطأ أثناء إدارة التذكيرات. الرجاء المحاولة مرة أخرى.");
  }
};

// Show reminder status
async function showReminderStatus(ctx, userId) {
  const users = getUsersWithReminders();
  const user = users.find(u => u.id === userId);
  
  const isEnabled = user ? user.remindersEnabled : false;
  
  const message = `🔔 *حالة التذكيرات*

${isEnabled ? '✅' : '❌'} التذكيرات ${isEnabled ? 'مفعلة' : 'معطلة'}

📅 *الجدول الزمني:*
${config.schedule.sessions.map(session => 
  `- ${session.day} ${session.time} (${session.type})`
).join('\n')}

⏰ *التذكير قبل:* ${config.schedule.reminderTime} دقيقة

🔗 *رابط الزوم:* ${config.zoom.fullLink}`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { 
          text: isEnabled ? "🔕 إلغاء التذكيرات" : "🔔 تفعيل التذكيرات", 
          callback_data: isEnabled ? "disable_reminders" : "enable_reminders" 
        }
      ],
      [
        { text: "📅 عرض الجدول", callback_data: "show_schedule" },
        { text: "🔗 رابط الزوم", callback_data: "zoom_link" }
      ],
      [
        { text: "⚙️ إعدادات التذكيرات", callback_data: "reminder_settings" }
      ]
    ]
  };
  
  ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Send manual reminder (admin only)
async function sendManualReminder(ctx, customMessage) {
  try {
    const users = getUsersWithReminders();
    
    if (users.length === 0) {
      return ctx.reply("❌ لا يوجد مستخدمين مع تذكيرات مفعلة.");
    }
    
    const message = customMessage || sessionReminder(
      config.schedule.sessions[0].time,
      config.zoom.fullLink
    );
    
    let sentCount = 0;
    let failedCount = 0;
    
    for (const user of users) {
      try {
        await ctx.telegram.sendMessage(user.id, message, {
          parse_mode: 'Markdown'
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder to user ${user.id}:`, error);
        failedCount++;
      }
    }
    
    ctx.reply(`📢 *تم إرسال التذكيرات*

✅ تم الإرسال بنجاح: ${sentCount} مستخدم
❌ فشل في الإرسال: ${failedCount} مستخدم

📝 *الرسالة المرسلة:*
${message}`);
    
  } catch (error) {
    console.error("Error sending manual reminder:", error);
    ctx.reply("❌ حدث خطأ أثناء إرسال التذكيرات.");
  }
}

// Handle reminder callbacks
export async function handleReminderCallback(ctx, action) {
  try {
    const userId = ctx.from.id;
    
    switch (action) {
      case 'enable_reminders':
        const enableResult = toggleReminders(userId);
        if (enableResult.remindersEnabled) {
          ctx.reply(successMessages.reminderEnabled);
        }
        break;
        
      case 'disable_reminders':
        const disableResult = toggleReminders(userId);
        if (!disableResult.remindersEnabled) {
          ctx.reply(successMessages.reminderDisabled);
        }
        break;
        
      case 'show_schedule':
        // This would trigger the schedule command
        ctx.reply("📅 استخدم الأمر /الجدول لعرض الجدول الكامل");
        break;
        
      case 'zoom_link':
        ctx.reply(`🔗 رابط الزوم: ${config.zoom.fullLink}`);
        break;
        
      case 'reminder_settings':
        if (isUserAdmin(userId)) {
          ctx.reply(`⚙️ *إعدادات التذكيرات (للمدرب)*

⏰ التذكير قبل: ${config.schedule.reminderTime} دقيقة
📅 الجلسات: ${config.schedule.sessions.length} جلسة أسبوعية
👥 المستخدمين مع تذكيرات: ${getUsersWithReminders().length}

*الأوامر المتاحة:*
/تذكير إرسال [نص] - إرسال تذكير يدوي
/تذكير إعدادات - تعديل إعدادات التذكيرات`, {
            parse_mode: 'Markdown'
          });
        } else {
          ctx.reply("⚙️ إعدادات التذكيرات غير متاحة للمستخدمين العاديين.");
        }
        break;
    }
    
    // Answer callback query
    ctx.answerCbQuery();
    
  } catch (error) {
    console.error("Error handling reminder callback:", error);
    ctx.reply("❌ حدث خطأ أثناء معالجة الطلب.");
  }
}