import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { botConfig, arabicCommands, arabicMessages } from './config/arabic-config.js';
import { startSchedulingService } from './services/schedulingService.js';
import { checkMuteExpirations } from './services/userManagement.js';
import { logInfo, logError } from './bot/utils/logger.js';

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء البوت
const bot = new Telegraf(botConfig.token);

// استيراد الأوامر العربية
import startCommand from './commands/arabic/ابدأ.js';
import helpCommand from './commands/arabic/مساعدة.js';
import statsCommand from './commands/arabic/إحصائيات.js';

async function setupArabicBot() {
  try {
    logInfo('🚀 بدء إعداد بوت معين المجتهدين العربي...');
    
    // ========== الأوامر الأساسية ==========
    
    // أمر البدء
    bot.command(['ابدأ', 'start'], startCommand);
    
    // أمر المساعدة  
    bot.command(['مساعدة', 'help'], helpCommand);
    
    // ========== أوامر المشرفين ==========
    
    // الإحصائيات
    bot.command(['إحصائيات', 'stats'], statsCommand);
    
    // ========== أوامر المحتوى والجدولة ==========
    
    // عرض الجدول
    bot.command(['الجدول', 'schedule'], async (ctx) => {
      const { getTodaySchedule, formatWeeklySchedule, loadSchedule } = await import('./services/schedulingService.js');
      const { getUserById, updateUserActivity } = await import('./services/userManagement.js');
      
      try {
        await updateUserActivity(ctx.from.id);
        
        const user = await getUserById(ctx.from.id);
        if (!user) {
          await ctx.reply(arabicMessages.errors.userNotVerified);
          return;
        }
        
        const args = ctx.message.text.split(' ').slice(1);
        
        if (args.length > 0 && args[0] === 'الأسبوع') {
          // عرض الجدول الأسبوعي
          const schedule = await loadSchedule();
          const weeklySchedule = formatWeeklySchedule(schedule.weeklySchedule);
          await ctx.reply(weeklySchedule);
        } else {
          // عرض جدول اليوم
          const todaySchedule = await getTodaySchedule();
          
          if (todaySchedule.regular.length === 0 && todaySchedule.special.length === 0) {
            await ctx.reply(`📅 **${todaySchedule.dayName}**\n\n🎯 لا توجد جلسات مجدولة اليوم\n\n💡 استخدم /الجدول الأسبوع لعرض الجدول الكامل`);
          } else {
            const { formatDailySchedule } = await import('./services/schedulingService.js');
            let message = formatDailySchedule('today', todaySchedule.regular);
            
            if (todaySchedule.special.length > 0) {
              message += '\n\n⭐ **أحداث خاصة:**\n';
              todaySchedule.special.forEach((event, index) => {
                message += `${index + 1}. 🕐 ${event.time} - ${event.topic}\n`;
              });
            }
            
            await ctx.reply(message);
          }
        }
      } catch (error) {
        logError('خطأ في أمر الجدول:', error);
        await ctx.reply(arabicMessages.errors.technicalError.replace('{timestamp}', new Date().toISOString()));
      }
    });
    
    // المحتوى التعليمي
    bot.command(['المحتوى', 'content'], async (ctx) => {
      const { getUserById, updateUserActivity } = await import('./services/userManagement.js');
      
      try {
        await updateUserActivity(ctx.from.id);
        
        const user = await getUserById(ctx.from.id);
        if (!user) {
          await ctx.reply(arabicMessages.errors.userNotVerified);
          return;
        }
        
        const contentMessage = `📚 **مكتبة المحتوى التعليمي**\n\n` +
          
          `📖 **الدروس الأساسية:**\n` +
          `• [مقدمة في البرمجة](https://example.com/intro)\n` +
          `• [أساسيات JavaScript](https://example.com/js-basics)\n` +
          `• [HTML و CSS](https://example.com/html-css)\n\n` +
          
          `🎥 **مقاطع الفيديو:**\n` +
          `• [شرح المتغيرات](https://youtube.com/watch?v=example1)\n` +
          `• [الدوال في JavaScript](https://youtube.com/watch?v=example2)\n` +
          `• [التحكم في DOM](https://youtube.com/watch?v=example3)\n\n` +
          
          `📄 **ملفات PDF:**\n` +
          `• [ملخص الأساسيات](https://drive.google.com/file/d/example1)\n` +
          `• [تمارين عملية](https://drive.google.com/file/d/example2)\n` +
          `• [مشاريع للتطبيق](https://drive.google.com/file/d/example3)\n\n` +
          
          `💡 **روابط مفيدة:**\n` +
          `• [موقع المطور العربي](https://developer.mozilla.org/ar/)\n` +
          `• [أكاديمية حسوب](https://academy.hsoub.com/)\n` +
          `• [كودكاديمي بالعربية](https://www.codecademy.com/ar)\n\n` +
          
          `❓ لطلب محتوى معين، تواصل مع المشرفين`;
        
        await ctx.reply(contentMessage);
      } catch (error) {
        logError('خطأ في أمر المحتوى:', error);
        await ctx.reply(arabicMessages.errors.technicalError.replace('{timestamp}', new Date().toISOString()));
      }
    });
    
    // تفعيل/إلغاء التذكيرات
    bot.command(['تذكير', 'reminder'], async (ctx) => {
      const { getUserById, updateUserActivity, loadUsers, saveUsers } = await import('./services/userManagement.js');
      
      try {
        await updateUserActivity(ctx.from.id);
        
        const users = await loadUsers();
        const userIndex = users.findIndex(user => user.id === ctx.from.id);
        
        if (userIndex === -1) {
          await ctx.reply(arabicMessages.errors.userNotVerified);
          return;
        }
        
        // تبديل حالة التذكيرات
        users[userIndex].settings.remindersEnabled = !users[userIndex].settings.remindersEnabled;
        await saveUsers(users);
        
        if (users[userIndex].settings.remindersEnabled) {
          await ctx.reply(arabicMessages.success.reminderActivated);
        } else {
          await ctx.reply(`🔕 **تم إلغاء التذكيرات**\n\nلن تصلك تنبيهات الجلسات والأحداث\n\n⚙️ **لإعادة التفعيل:** أرسل /${arabicCommands.reminder} مرة أخرى`);
        }
      } catch (error) {
        logError('خطأ في أمر التذكير:', error);
        await ctx.reply(arabicMessages.errors.technicalError.replace('{timestamp}', new Date().toISOString()));
      }
    });
    
    // الأسئلة الشائعة
    bot.command(['أسئلة', 'questions', 'faq'], async (ctx) => {
      const { getUserById, updateUserActivity } = await import('./services/userManagement.js');
      
      try {
        await updateUserActivity(ctx.from.id);
        
        const user = await getUserById(ctx.from.id);
        if (!user) {
          await ctx.reply(arabicMessages.errors.userNotVerified);
          return;
        }
        
        const faqMessage = `❓ **الأسئلة الشائعة**\n\n` +
          
          `🕐 **متى الجلسة القادمة؟**\n` +
          `استخدم /${arabicCommands.schedule} لمعرفة مواعيد الجلسات\n\n` +
          
          `🔗 **أين رابط الزووم؟**\n` +
          `يتم إرسال الرابط قبل الجلسة بساعة في التذكير\n\n` +
          
          `📚 **كيف أحصل على المواد التعليمية؟**\n` +
          `استخدم /${arabicCommands.content} للوصول للمكتبة\n\n` +
          
          `⏰ **كيف أفعل التذكيرات؟**\n` +
          `استخدم /${arabicCommands.reminder} لتفعيل/إلغاء التنبيهات\n\n` +
          
          `📝 **كيف أجري اختبار؟**\n` +
          `استخدم /${arabicCommands.quiz} لبدء اختبار سريع\n\n` +
          
          `🎓 **متى تنتهي الدورة؟**\n` +
          `مدة الدورة 8 أسابيع، تنتهي في نهاية أغسطس\n\n` +
          
          `📞 **كيف أتواصل مع المشرفين؟**\n` +
          `يمكنك الكتابة في المجموعة أو إرسال رسالة خاصة\n\n` +
          
          `💻 **هل أحتاج خبرة سابقة؟**\n` +
          `لا، الدورة مصممة للمبتدئين تماماً\n\n` +
          
          `📱 **هل يمكن المتابعة من الهاتف؟**\n` +
          `نعم، لكن الكمبيوتر أفضل للتطبيق العملي`;
        
        await ctx.reply(faqMessage);
      } catch (error) {
        logError('خطأ في أمر الأسئلة:', error);
        await ctx.reply(arabicMessages.errors.technicalError.replace('{timestamp}', new Date().toISOString()));
      }
    });
    
    // ========== أوامر التحذير والإنضباط (المشرفين فقط) ==========
    
    // تحذير مستخدم
    bot.command(['تحذير', 'warn'], async (ctx) => {
      const { getUserById, checkUserPermission, UserTypes, addWarning } = await import('./services/userManagement.js');
      
      try {
        const user = await getUserById(ctx.from.id);
        
        if (!user || !checkUserPermission(user, UserTypes.ADMIN)) {
          await ctx.reply(arabicMessages.errors.noPermission);
          return;
        }
        
        const args = ctx.message.text.split(' ').slice(1);
        if (args.length < 2) {
          await ctx.reply(`📝 **استخدم الأمر بالصيغة التالية:**\n/${arabicCommands.warn} [معرف_المستخدم] [السبب]\n\n**مثال:**\n/${arabicCommands.warn} 123456789 مخالفة آداب المجموعة`);
          return;
        }
        
        const targetUserId = parseInt(args[0]);
        const reason = args.slice(1).join(' ');
        
        const result = await addWarning(targetUserId, reason, ctx.from.id);
        
        if (result.success) {
          let message = '';
          
          if (result.muted) {
            message = arabicMessages.warnings.userMuted
              .replace('{username}', `${targetUserId}`)
              .replace('{duration}', botConfig.courseSettings.muteTime)
              .replace('{reason}', reason);
          } else if (result.warningCount === botConfig.courseSettings.maxWarnings - 1) {
            message = arabicMessages.warnings.finalWarning
              .replace('{reason}', reason)
              .replace('{muteTime}', botConfig.courseSettings.muteTime);
          } else {
            message = arabicMessages.warnings.firstWarning
              .replace('{reason}', reason)
              .replace('{remainingWarnings}', result.remainingWarnings);
          }
          
          await ctx.reply(message);
          
          // إرسال التحذير للمستخدم المحذر
          try {
            await bot.telegram.sendMessage(targetUserId, message);
          } catch (error) {
            await ctx.reply(`⚠️ تم إصدار التحذير لكن فشل إرساله للمستخدم (ربما حظر البوت)`);
          }
        } else {
          await ctx.reply(`❌ فشل في إصدار التحذير: ${result.message}`);
        }
      } catch (error) {
        logError('خطأ في أمر التحذير:', error);
        await ctx.reply(arabicMessages.errors.technicalError.replace('{timestamp}', new Date().toISOString()));
      }
    });
    
    // كتم مستخدم
    bot.command(['كتم', 'mute'], async (ctx) => {
      const { getUserById, checkUserPermission, UserTypes, muteUser } = await import('./services/userManagement.js');
      
      try {
        const user = await getUserById(ctx.from.id);
        
        if (!user || !checkUserPermission(user, UserTypes.ADMIN)) {
          await ctx.reply(arabicMessages.errors.noPermission);
          return;
        }
        
        const args = ctx.message.text.split(' ').slice(1);
        if (args.length < 3) {
          await ctx.reply(`📝 **استخدم الأمر بالصيغة التالية:**\n/${arabicCommands.mute} [معرف_المستخدم] [المدة_بالدقائق] [السبب]\n\n**مثال:**\n/${arabicCommands.mute} 123456789 30 إزعاج متكرر`);
          return;
        }
        
        const targetUserId = parseInt(args[0]);
        const duration = parseInt(args[1]);
        const reason = args.slice(2).join(' ');
        
        if (isNaN(duration) || duration <= 0) {
          await ctx.reply('❌ مدة الكتم يجب أن تكون رقماً موجباً (بالدقائق)');
          return;
        }
        
        const result = await muteUser(targetUserId, duration, reason, ctx.from.id);
        
        if (result.success) {
          const message = arabicMessages.warnings.userMuted
            .replace('{username}', `${targetUserId}`)
            .replace('{duration}', duration)
            .replace('{reason}', reason);
          
          await ctx.reply(message);
          
          // إرسال إشعار للمستخدم المكتوم
          try {
            await bot.telegram.sendMessage(targetUserId, message);
          } catch (error) {
            await ctx.reply(`⚠️ تم كتم المستخدم لكن فشل إرسال الإشعار له`);
          }
        } else {
          await ctx.reply(`❌ فشل في كتم المستخدم: ${result.message}`);
        }
      } catch (error) {
        logError('خطأ في أمر الكتم:', error);
        await ctx.reply(arabicMessages.errors.technicalError.replace('{timestamp}', new Date().toISOString()));
      }
    });
    
    // ========== معالجة الرسائل العامة ==========
    
    bot.on('text', async (ctx) => {
      try {
        const { updateUserActivity, getUserById, isUserActive } = await import('./services/userManagement.js');
        
        // تحديث نشاط المستخدم
        await updateUserActivity(ctx.from.id);
        
        // التحقق من حالة المستخدم
        const user = await getUserById(ctx.from.id);
        
        if (user && !isUserActive(user)) {
          // إذا كان المستخدم مكتوماً، تجاهل الرسالة
          return;
        }
        
        const message = ctx.message.text.toLowerCase();
        
        // ردود تلقائية ذكية
        if (message.includes('مرحبا') || message.includes('السلام') || message.includes('أهلا')) {
          await ctx.reply(`👋 أهلاً وسهلاً! استخدم /${arabicCommands.help} للمساعدة`);
        } else if (message.includes('شكرا') || message.includes('شكراً')) {
          await ctx.reply('🌟 عفواً! سعداء بخدمتك');
        } else if (message.includes('متى') && message.includes('جلسة')) {
          await ctx.reply(`⏰ استخدم /${arabicCommands.schedule} لمعرفة مواعيد الجلسات`);
        } else if (message.includes('رابط') && message.includes('زووم')) {
          await ctx.reply(`🔗 سيتم إرسال رابط الزووم قبل الجلسة بساعة\nفعّل التذكيرات: /${arabicCommands.reminder}`);
        } else if (message.includes('محتوى') || message.includes('مواد')) {
          await ctx.reply(`📚 استخدم /${arabicCommands.content} للوصول للمواد التعليمية`);
        }
      } catch (error) {
        logError('خطأ في معالجة الرسالة:', error);
      }
    });
    
    // ========== معالجة الأخطاء العامة ==========
    
    bot.catch((err, ctx) => {
      logError('خطأ عام في البوت:', err);
      
      if (ctx && ctx.reply) {
        const errorMessage = arabicMessages.errors.technicalError
          .replace('{timestamp}', new Date().toISOString());
        ctx.reply(errorMessage).catch(() => {});
      }
    });
    
    logInfo('✅ تم إعداد البوت العربي بنجاح');
    
  } catch (error) {
    logError('خطأ في إعداد البوت:', error);
    process.exit(1);
  }
}

async function startArabicBot() {
  try {
    // إعداد البوت
    await setupArabicBot();
    
    // بدء خدمة الجدولة
    startSchedulingService(bot);
    
    // فحص دوري لانتهاء الكتم (كل دقيقة)
    setInterval(checkMuteExpirations, 60000);
    
    // تشغيل البوت
    await bot.launch();
    
    logInfo('🎉 بوت معين المجتهدين يعمل الآن بنجاح!');
    logInfo(`🌍 المنطقة الزمنية: ${botConfig.timezone}`);
    logInfo(`👨‍💼 عدد المشرفين: ${botConfig.adminIds.length}`);
    
    // معالجة إنهاء البرنامج بأمان
    process.once('SIGINT', () => {
      logInfo('إيقاف البوت (SIGINT)...');
      bot.stop('SIGINT');
    });
    
    process.once('SIGTERM', () => {
      logInfo('إيقاف البوت (SIGTERM)...');
      bot.stop('SIGTERM');
    });
    
  } catch (error) {
    logError('فشل في تشغيل البوت:', error);
    process.exit(1);
  }
}

// تشغيل البوت
startArabicBot();