import { isUserVerified, isUserAdmin } from '../services/userService.js';
import { errorMessages } from '../helpers/messages.js';
import { handleQuizAnswer } from '../commands/quiz.js';
import { handleAnnouncementCallback } from '../commands/publish.js';
import { handleReminderCallback } from '../commands/reminder.js';
import config from '../../config.js';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    const callbackData = ctx.callbackQuery.data;
    
    // Check if user is verified for most callbacks
    if (!isUserVerified(userId) && !callbackData.startsWith('verify_')) {
      return ctx.reply(errorMessages.notVerified);
    }
    
    // Parse callback data
    const [action, ...params] = callbackData.split('_');
    
    switch (action) {
      // Quiz callbacks
      case 'quiz':
        if (params[0] === 'answer') {
          const [questionId, answerIndex] = params.slice(1);
          await handleQuizAnswer(ctx, questionId, answerIndex);
        }
        break;
        
      // Content callbacks
      case 'content':
        await handleContentCallback(ctx, params[0]);
        break;
        
      // Schedule callbacks
      case 'schedule':
        await handleScheduleCallback(ctx, params[0]);
        break;
        
      // FAQ callbacks
      case 'faq':
        await handleFaqCallback(ctx, params[0]);
        break;
        
      // Reminder callbacks
      case 'enable':
      case 'disable':
        if (params[0] === 'reminders') {
          await handleReminderCallback(ctx, `${action}_reminders`);
        }
        break;
        
      // Admin callbacks
      case 'admin':
        await handleAdminCallback(ctx, params[0]);
        break;
        
      // Statistics callbacks
      case 'stats':
        await handleStatsCallback(ctx, params[0]);
        break;
        
      // Announcement callbacks
      case 'pin':
      case 'announcement':
        if (params[0] === 'announcement') {
          const [announcementAction, announcementId] = params.slice(1);
          await handleAnnouncementCallback(ctx, announcementAction, announcementId);
        }
        break;
        
      // Navigation callbacks
      case 'main':
        if (params[0] === 'menu') {
          await showMainMenu(ctx);
        }
        break;
        
      // Zoom link callback
      case 'zoom':
        if (params[0] === 'link') {
          ctx.reply(`🔗 رابط الزوم: ${config.zoom.fullLink}`);
        }
        break;
        
      // Next session callback
      case 'next':
        if (params[0] === 'session') {
          await showNextSession(ctx);
        }
        break;
        
      // Default case
      default:
        ctx.reply("❌ زر غير معروف. الرجاء المحاولة مرة أخرى.");
    }
    
    // Answer callback query to remove loading state
    ctx.answerCbQuery();
    
  } catch (error) {
    console.error("Error handling callback:", error);
    ctx.reply("❌ حدث خطأ أثناء معالجة الطلب. الرجاء المحاولة مرة أخرى.");
  }
};

// Handle content callbacks
async function handleContentCallback(ctx, contentType) {
  const userId = ctx.from.id;

  switch (contentType) {
    case 'pdf': {
      const pdfMaterials = config.content.materials.filter(m => m.type === 'pdf');
      if (pdfMaterials.length > 0) {
        let message = "📄 *ملفات PDF:*\n\n";
        pdfMaterials.forEach((material, index) => {
          message += `${index + 1}. *${material.title}*\n`;
          message += `   ${material.description}\n`;
          message += `   ${material.url}\n\n`;
        });
        ctx.reply(message, { parse_mode: 'Markdown' });
      } else {
        ctx.reply("❌ لا توجد ملفات PDF متاحة حالياً.");
      }
      break;
    }

    case 'video': {
      const videoMaterials = config.content.materials.filter(m => m.type === 'video');
      if (videoMaterials.length > 0) {
        let message = "🎥 *الفيديوهات التعليمية:*\n\n";
        videoMaterials.forEach((material, index) => {
          message += `${index + 1}. *${material.title}*\n`;
          message += `   ${material.description}\n`;
          message += `   ${material.url}\n\n`;
        });
        ctx.reply(message, { parse_mode: 'Markdown' });
      } else {
        ctx.reply("❌ لا توجد فيديوهات متاحة حالياً.");
      }
      break;
    }

    case 'link': {
      const linkMaterials = config.content.materials.filter(m => m.type === 'link');
      if (linkMaterials.length > 0) {
        let message = "🔗 *الروابط المفيدة:*\n\n";
        linkMaterials.forEach((material, index) => {
          message += `${index + 1}. *${material.title}*\n`;
          message += `   ${material.description}\n`;
          message += `   ${material.url}\n\n`;
        });
        ctx.reply(message, { parse_mode: 'Markdown' });
      } else {
        ctx.reply("❌ لا توجد روابط متاحة حالياً.");
      }
      break;
    }

    case 'image': {
      const imageMaterials = config.content.materials.filter(m => m.type === 'image');
      if (imageMaterials.length > 0) {
        let message = "🖼️ *الصور والرسوم:*\n\n";
        imageMaterials.forEach((material, index) => {
          message += `${index + 1}. *${material.title}*\n`;
          message += `   ${material.description}\n`;
          message += `   ${material.url}\n\n`;
        });
        ctx.reply(message, { parse_mode: 'Markdown' });
      } else {
        ctx.reply("❌ لا توجد صور متاحة حالياً.");
      }
      break;
    }

    case 'all': {
      let message = "📚 *جميع المواد التعليمية:*\n\n";
      config.content.materials.forEach((material, index) => {
        const emoji = getContentEmoji(material.type);
        message += `${index + 1}. ${emoji} *${material.title}*\n`;
        message += `   ${material.description}\n`;
        message += `   ${material.url}\n\n`;
      });
      ctx.reply(message, { parse_mode: 'Markdown' });
      break;
    }

    case 'search':
      ctx.reply("🔍 استخدم الأمر /البحث متبوعاً بالكلمة المفتاحية للبحث في المحتوى.");
      break;

    default:
      ctx.reply("❌ نوع محتوى غير معروف.");
  }
}


// Handle schedule callbacks
async function handleScheduleCallback(ctx, scheduleAction) {
  switch (scheduleAction) {
    case 'reminders':
      await handleReminderCallback(ctx, 'enable_reminders');
      break;
      
    case 'next':
      await showNextSession(ctx);
      break;
      
    case 'zoom':
      ctx.reply(`🔗 رابط الزوم: ${config.zoom.fullLink}`);
      break;
      
    case 'calendar':
      ctx.reply("📅 يمكنك إضافة الجلسات إلى تقويمك باستخدام الروابط التالية:");
      config.schedule.sessions.forEach(session => {
        ctx.reply(`${session.day} ${session.time}: ${config.zoom.fullLink}`);
      });
      break;
      
    default:
      ctx.reply("❌ إجراء الجدول غير معروف.");
  }
}

// Handle FAQ callbacks
async function handleFaqCallback(ctx, faqAction) {
  switch (faqAction) {
    case 'schedule':
      ctx.reply("📅 استخدم الأمر /الجدول لعرض جدول الجلسات الأسبوعي.");
      break;
      
    case 'links':
      ctx.reply(`🔗 *الروابط المهمة:*
      
🔗 رابط الزوم: ${config.zoom.fullLink}
📞 قناة الدعم: ${config.admin.supportChannel}
📚 المحتوى التعليمي: استخدم /المحتوى`);
      break;
      
    case 'content':
      ctx.reply("📚 استخدم الأمر /المحتوى لعرض جميع المواد التعليمية المتاحة.");
      break;
      
    case 'help':
      ctx.reply("❓ استخدم الأمر /مساعدة لعرض قائمة الأوامر المتاحة.");
      break;
      
    case 'support':
      ctx.reply(`📞 للتواصل مع الدعم:
      
📱 قناة الدعم: ${config.admin.supportChannel}
📧 البريد الإلكتروني: support@course.com
⏰ أوقات الدعم: الأحد - الخميس 9 ص - 6 م`);
      break;
      
    default:
      ctx.reply("❌ قسم FAQ غير معروف.");
  }
}

// Handle admin callbacks
async function handleAdminCallback(ctx, adminAction) {
  const userId = ctx.from.id;
  
  if (!isUserAdmin(userId)) {
    return ctx.reply(errorMessages.unauthorized);
  }
  
  switch (adminAction) {
    case 'menu':
      await showAdminMenu(ctx);
      break;
      
    case 'stats':
      ctx.reply("📊 استخدم الأمر /stats إحصائيات المجموعة.");
      break;
      
    case 'ban':
      ctx.reply("🚫 استخدم الأمر /ban متبوعاً بمعرف المستخدم لحظر مستخدم.");
      break;
      
    case 'unban':
      ctx.reply("✅ استخدم الأمر /unban متبوعاً بمعرف المستخدم لإلغاء حظر مستخدم.");
      break;
      
    default:
      ctx.reply("❌ إجراء الإدارة غير معروف.");
  }
}

// Handle statistics callbacks
async function handleStatsCallback(ctx, statsAction) {
  const userId = ctx.from.id;
  
  switch (statsAction) {
    case 'detailed':
      if (isUserAdmin(userId)) {
        ctx.reply("📊 استخدم الأمر /detailed لعرض تقرير مفصل.");
      } else {
        ctx.reply("📊 استخدم الأمر /detailed لعرض إحصائياتك الشخصية.");
      }
      break;
      
    case 'member':
      if (isUserAdmin(userId)) {
        ctx.reply("👥 استخدم الأمر /member لعرض قائمة الأعضاء.");
      } else {
        ctx.reply("❌ هذه الميزة متاحة للمشرفين فقط.");
      }
      break;
      
    case 'attendance':
      if (isUserAdmin(userId)) {
        ctx.reply("📅 استخدم الأمر /إحصائيات_الحضور لعرض إحصائيات الحضور.");
      } else {
        ctx.reply("📅 استخدم الأمر /حضوري لعرض سجل حضورك.");
      }
      break;
      
    case 'activity':
      if (isUserAdmin(userId)) {
        ctx.reply("📈 استخدم الأمر /activity لعرض تحليل النشاط.");
      } else {
        ctx.reply("📈 استخدم الأمر /MyActivity نشاطك الشخصي.");
      }
      break;
      
    case 'export':
      if (isUserAdmin(userId)) {
        ctx.reply("📤 استخدم الأمر /export لتصدير البيانات.");
      } else {
        ctx.reply("❌ هذه الميزة متاحة للمشرفين فقط.");
      }
      break;
      
    default:
      ctx.reply("❌ نوع الإحصائيات غير معروف.");
  }
}

// Show main menu
async function showMainMenu(ctx) {
  const message = `🏠 *القائمة الرئيسية*

اختر من الخيارات التالية:

📅 الجدول والتذكيرات
📚 المحتوى التعليمي
❓ الأسئلة الشائعة
📊 الإحصائيات
🔧 الإعدادات`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "📅 الجدول", callback_data: "schedule_show" },
        { text: "📚 المحتوى", callback_data: "content_all" }
      ],
      [
        { text: "❓ الأسئلة الشائعة", callback_data: "faq_help" },
        { text: "📊 إحصائياتي", callback_data: "stats_personal" }
      ],
      [
        { text: "🔔 التذكيرات", callback_data: "reminder_status" },
        { text: "🔧 الإعدادات", callback_data: "settings_menu" }
      ]
    ]
  };
  
  ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Show next session info
async function showNextSession(ctx) {
  const nextSession = config.schedule.sessions[0]; // Simplified for now
  const message = `📅 *الجلسة القادمة:*

🗓️ اليوم: ${nextSession.day}
⏰ الوقت: ${nextSession.time}
⏱️ المدة: ${nextSession.duration}
📝 النوع: ${nextSession.type}

🔗 رابط الزوم: ${config.zoom.fullLink}

📝 *تذكير:* لا تنسى إحضار دفتر الملاحظات! 😊`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔔 تفعيل التذكيرات", callback_data: "enable_reminders" },
        { text: "📅 عرض الجدول الكامل", callback_data: "schedule_show" }
      ],
      [
        { text: "🔗 رابط الزوم", callback_data: "zoom_link" },
        { text: "📝 إضافة للتقويم", callback_data: "schedule_calendar" }
      ]
    ]
  };
  
  ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Show admin menu
async function showAdminMenu(ctx) {
  const message = `🔧 *لوحة تحكم المشرف*

اختر من الخيارات التالية:`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "📢 نشر إعلان", callback_data: "admin_announcement" },
        { text: "📊 الإحصائيات", callback_data: "admin_stats" }
      ],
      [
        { text: "👥 إدارة الأعضاء", callback_data: "admin_members" },
        { text: "📅 إدارة الجدول", callback_data: "admin_schedule" }
      ],
      [
        { text: "📚 إدارة المحتوى", callback_data: "admin_content" },
        { text: "⚙️ الإعدادات", callback_data: "admin_settings" }
      ]
    ]
  };
  
  ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Helper function to get content emoji
function getContentEmoji(type) {
  const emojis = {
    pdf: "📄",
    video: "🎥",
    link: "🔗",
    image: "🖼️"
  };
  return emojis[type] || "📄";
}