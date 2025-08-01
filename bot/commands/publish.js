import { isUserVerified, isUserAdmin } from '../services/userService.js';
import { errorMessages, successMessages } from '../helpers/messages.js';
import { readJSON, writeJSON } from '../utils/database.js';

const ANNOUNCEMENTS_FILE = './data/announcements.json';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Check if user is verified and admin
    if (!isUserVerified(userId)) {
      return ctx.reply(errorMessages.notVerified);
    }
    
    if (!isUserAdmin(userId)) {
      return ctx.reply(errorMessages.unauthorized);
    }
    
    const args = ctx.message.text.split(' ').slice(1);
    
    if (args.length === 0) {
      return ctx.reply(`📢 *نشر إعلان جديد*

استخدم الأمر كالتالي:
/نشر [نوع_الإعلان] [المحتوى]

*أنواع الإعلانات:*
- عام: إعلان للجميع
- مهم: إعلان مهم مع تنبيه
- تذكير: تذكير بالجلسة القادمة
- محتوى: إعلان عن محتوى جديد

*أمثلة:*
/نشر عام مرحبًا بكم في الجلسة الجديدة!
/نشر مهم موعد تسليم المشروع النهائي
/نشر تذكير الجلسة غدًا في الساعة 8 مساءً
/نشر محتوى تم إضافة فيديو جديد عن المتغيرات`, {
        parse_mode: 'Markdown'
      });
    }
    
    const announcementType = args[0];
    const content = args.slice(1).join(' ');
    
    if (!content) {
      return ctx.reply("❌ يرجى إدخال محتوى الإعلان.");
    }
    
    // Create announcement
    const announcement = {
      id: Date.now(),
      type: announcementType,
      content,
      authorId: userId,
      authorName: ctx.from.first_name || ctx.from.username || "مدرب",
      date: new Date().toISOString(),
      isPinned: false
    };
    
    // Save announcement
    const announcements = readJSON(ANNOUNCEMENTS_FILE, []);
    announcements.push(announcement);
    writeJSON(ANNOUNCEMENTS_FILE, announcements);
    
    // Format announcement message
    const typeEmoji = getAnnouncementEmoji(announcementType);
    const message = `${typeEmoji} *إعلان ${getAnnouncementTypeName(announcementType)}*

${content}

📅 ${new Date().toLocaleDateString('ar-SA')}
👤 ${announcement.authorName}`;
    
    // Send to group if available
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
      const sentMessage = await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📌 تثبيت", callback_data: `pin_announcement_${announcement.id}` },
              { text: "📊 إحصائيات", callback_data: `announcement_stats_${announcement.id}` }
            ],
            [
              { text: "✏️ تعديل", callback_data: `edit_announcement_${announcement.id}` },
              { text: "🗑️ حذف", callback_data: `delete_announcement_${announcement.id}` }
            ]
          ]
        }
      });
      
      // Pin the message if it's important
      if (announcementType === 'مهم') {
        try {
          await ctx.pinChatMessage(sentMessage.message_id);
          announcement.isPinned = true;
          writeJSON(ANNOUNCEMENTS_FILE, announcements);
        } catch (error) {
          console.error("Error pinning message:", error);
        }
      }
    } else {
      // Send to admin in private chat
      ctx.reply(successMessages.announcementPosted);
      ctx.reply(message, { parse_mode: 'Markdown' });
    }
    
  } catch (error) {
    console.error("Error in publish command:", error);
    ctx.reply("❌ حدث خطأ أثناء نشر الإعلان. الرجاء المحاولة مرة أخرى.");
  }
};

// Helper functions
function getAnnouncementEmoji(type) {
  const emojis = {
    'عام': '📢',
    'مهم': '🚨',
    'تذكير': '⏰',
    'محتوى': '📚',
    'تحذير': '⚠️',
    'معلومات': 'ℹ️'
  };
  return emojis[type] || '📢';
}

function getAnnouncementTypeName(type) {
  const names = {
    'عام': 'عام',
    'مهم': 'مهم',
    'تذكير': 'تذكير',
    'محتوى': 'محتوى جديد',
    'تحذير': 'تحذير',
    'معلومات': 'معلومات'
  };
  return names[type] || 'عام';
}

// Function to handle announcement callbacks
export async function handleAnnouncementCallback(ctx, action, announcementId) {
  try {
    const userId = ctx.from.id;
    
    if (!isUserAdmin(userId)) {
      return ctx.reply(errorMessages.unauthorized);
    }
    
    const announcements = readJSON(ANNOUNCEMENTS_FILE, []);
    const announcementIndex = announcements.findIndex(a => a.id === parseInt(announcementId));
    
    if (announcementIndex === -1) {
      return ctx.reply("❌ الإعلان غير موجود.");
    }
    
    const announcement = announcements[announcementIndex];
    
    switch (action) {
      case 'pin':
        try {
          await ctx.pinChatMessage(ctx.callbackQuery.message.message_id);
          announcements[announcementIndex].isPinned = true;
          writeJSON(ANNOUNCEMENTS_FILE, announcements);
          ctx.reply("✅ تم تثبيت الإعلان بنجاح!");
        } catch (error) {
          ctx.reply("❌ لا يمكن تثبيت الإعلان. تأكد من صلاحيات البوت.");
        }
        break;
        
      case 'stats':
        const views = announcement.views || 0;
        const reactions = announcement.reactions || 0;
        ctx.reply(`📊 إحصائيات الإعلان:
👁️ المشاهدات: ${views}
👍 التفاعلات: ${reactions}
📅 تاريخ النشر: ${new Date(announcement.date).toLocaleDateString('ar-SA')}`);
        break;
        
      case 'edit':
        ctx.reply("✏️ أرسل المحتوى الجديد للإعلان:");
        // Store edit state for this user
        // This would require implementing a state management system
        break;
        
      case 'delete':
        announcements.splice(announcementIndex, 1);
        writeJSON(ANNOUNCEMENTS_FILE, announcements);
        ctx.reply("✅ تم حذف الإعلان بنجاح!");
        break;
    }
    
    // Answer callback query
    ctx.answerCbQuery();
    
  } catch (error) {
    console.error("Error handling announcement callback:", error);
    ctx.reply("❌ حدث خطأ أثناء معالجة الطلب.");
  }
}