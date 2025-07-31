import { contentMessage } from '../helpers/messages.js';
import { isUserVerified } from '../services/userService.js';
import { errorMessages } from '../helpers/messages.js';
import config from '../../config.js';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Check if user is verified
    if (!isUserVerified(userId)) {
      return ctx.reply(errorMessages.notVerified);
    }
    
    const message = contentMessage(config.content.materials);
    
    // Create inline keyboard for content categories
    const keyboard = {
      inline_keyboard: [
        [
          { text: "📄 ملفات PDF", callback_data: "content_pdf" },
          { text: "🎥 فيديوهات", callback_data: "content_video" }
        ],
        [
          { text: "🔗 روابط مفيدة", callback_data: "content_link" },
          { text: "🖼️ صور", callback_data: "content_image" }
        ],
        [
          { text: "📚 جميع المواد", callback_data: "content_all" },
          { text: "🔍 البحث", callback_data: "content_search" }
        ]
      ]
    };
    
    ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    
  } catch (error) {
    console.error("Error in content command:", error);
    ctx.reply("❌ حدث خطأ أثناء عرض المحتوى. الرجاء المحاولة مرة أخرى.");
  }
};