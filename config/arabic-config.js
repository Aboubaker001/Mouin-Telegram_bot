import dotenv from 'dotenv';
dotenv.config();

// إعدادات البوت الأساسية
export const botConfig = {
  // معلومات البوت
  token: process.env.BOT_TOKEN,
  botName: process.env.BOT_NAME || 'بوت معين المجتهدين',
  
  // التوقيت والمنطقة الزمنية
  timezone: process.env.TIMEZONE || 'Africa/Cairo',
  
  // معرفات المشرفين
  adminIds: process.env.ADMIN_IDS ? 
    process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim())) : [],
  
  // مسارات الملفات
  paths: {
    users: './data/users.json',
    courses: './data/courses.json',
    quizzes: './data/quizzes.json',
    warnings: './data/warnings.json',
    content: './data/content.json',
    logs: './logs/bot.log'
  },
  
  // إعدادات الدورة
  courseSettings: {
    requireVerification: process.env.REQUIRE_VERIFICATION === 'true',
    subscriptionCode: process.env.SUBSCRIPTION_CODE || '',
    maxWarnings: parseInt(process.env.MAX_WARNINGS) || 3,
    muteTime: parseInt(process.env.MUTE_TIME) || 30 // بالدقائق
  }
};

// الأوامر العربية
export const arabicCommands = {
  // أوامر عامة
  start: 'ابدأ',
  help: 'مساعدة',
  schedule: 'الجدول',
  content: 'المحتوى',
  reminder: 'تذكير',
  questions: 'أسئلة',
  
  // أوامر المشرفين فقط
  publish: 'نشر',
  stats: 'إحصائيات',
  quiz: 'اختبار',
  evaluation: 'تقييم',
  warn: 'تحذير',
  mute: 'كتم',
  unmute: 'إلغاء_الكتم',
  
  // أوامر إدارية متقدمة
  addUser: 'إضافة_مستخدم',
  removeUser: 'حذف_مستخدم',
  broadcast: 'بث',
  backup: 'نسخ_احتياطي'
};

// الرسائل العربية
export const arabicMessages = {
  // رسائل الترحيب
  welcome: {
    newUser: `🎉 أهلاً وسهلاً بك يا بطل!

🎓 انضممت إلى **دورة البرمجة للمبتدئين**
🚀 نحن متحمسون لبدء الرحلة معك!

📋 **الخطوات التالية:**
1️⃣ اقرأ التعليمات المثبتة أعلاه
2️⃣ استخدم /${arabicCommands.help} لعرض الأوامر
3️⃣ تابع /${arabicCommands.schedule} لمعرفة مواعيد الجلسات

✨ **نصائح مهمة:**
• احرص على الحضور في الوقت المحدد
• فعّل الإشعارات لتصلك التذكيرات
• تفاعل مع زملائك في المجموعة

🤝 **مرحباً بك في الأسرة! نتطلع لرؤيتك في أول جلسة**`,

    returningUser: `👋 مرحباً بعودتك!

📚 أهلاً بك مرة أخرى في دورة البرمجة
🕐 آخر زيارة لك كانت: {lastSeen}

استخدم /${arabicCommands.help} لعرض الأوامر المتاحة`
  },

  // رسائل التذكير
  reminders: {
    sessionSoon: `⏰ **تذكير مهم!**

📅 الجلسة القادمة تبدأ خلال **ساعة واحدة**
🕖 الوقت: **{time}**
💻 **رابط الجلسة:** {zoomLink}

📝 **ما تحتاجه:**
• جهاز كمبيوتر أو هاتف
• اتصال إنترنت مستقر
• دفتر للملاحظات

🎯 **موضوع اليوم:** {topic}

نراك هناك! 💪`,

    dailySchedule: `📅 **جدول اليوم**

🗓️ **{date}**

{schedule}

💡 **تذكير:** استخدم /${arabicCommands.reminder} لتفعيل التنبيهات الشخصية`,

    weeklyUpdate: `📊 **تحديث أسبوعي**

🗓️ **الأسبوع القادم:** {weekNumber}

{weeklySchedule}

📈 **إنجازاتك هذا الأسبوع:**
{achievements}

🎯 **أهداف الأسبوع القادم:**
{goals}`
  },

  // رسائل الأخطاء
  errors: {
    commandNotFound: `❗ **عذراً، لم أتمكن من فهم هذا الأمر**

💡 استخدم /${arabicCommands.help} لعرض جميع الأوامر المتاحة

📝 **أوامر شائعة:**
• /${arabicCommands.schedule} - عرض الجدول
• /${arabicCommands.content} - المحتوى التعليمي
• /${arabicCommands.questions} - الأسئلة الشائعة`,

    noPermission: `🔒 **عذراً، هذا الأمر غير متاح لك**

👤 هذا الأمر مخصص للمشرفين فقط
📞 **للمساعدة:** تواصل مع المشرفين`,

    userNotVerified: `⚠️ **يجب التحقق من هويتك أولاً**

🔑 **لاستكمال التسجيل:**
1️⃣ أرسل رقم الاشتراك الخاص بك
2️⃣ انتظر موافقة المشرف
3️⃣ ستصلك رسالة تأكيد

💳 **رقم الاشتراك:** مكون من 6 أرقام`,

    technicalError: `❌ **حدث خطأ تقني**

🔧 نعتذر عن الإزعاج، يرجى المحاولة مرة أخرى
📞 إذا استمر الخطأ، تواصل مع الدعم الفني

🕐 **وقت الخطأ:** {timestamp}`
  },

  // رسائل النجاح
  success: {
    userRegistered: `✅ **تم تسجيلك بنجاح!**

🎊 مرحباً بك في الدورة
📧 ستصلك رسائل التذكير على هذا الحساب
🔔 تأكد من تفعيل الإشعارات`,

    reminderActivated: `🔔 **تم تفعيل التذكيرات!**

⏰ ستصلك تنبيهات قبل كل جلسة بـ:
• ساعة واحدة
• 15 دقيقة
• 5 دقائق

⚙️ **لإلغاء التذكيرات:** أرسل /${arabicCommands.reminder} مرة أخرى`,

    contentShared: `📤 **تم مشاركة المحتوى بنجاح!**

📁 تم إضافة المحتوى إلى مكتبة الدورة
👥 سيتم إشعار جميع المشاركين`,

    quizCompleted: `🎯 **تم إنهاء الاختبار!**

📊 **نتيجتك:** {score}/{total}
📈 **النسبة:** {percentage}%
🏆 **التقدير:** {grade}

💡 **لمراجعة الإجابات:** استخدم /${arabicCommands.content}`
  },

  // رسائل التحذير والإنضباط
  warnings: {
    firstWarning: `⚠️ **تحذير أول**

🎯 **السبب:** {reason}
📋 **القواعد:** يرجى الالتزام بآداب المجموعة

❗ **تبقى لديك:** {remainingWarnings} تحذيرات قبل الكتم`,

    finalWarning: `🚨 **تحذير أخير!**

⛔ **السبب:** {reason}
🔇 **التحذير التالي سيؤدي إلى الكتم لمدة {muteTime} دقيقة**

🙏 يرجى الالتزام بقواعد المجموعة`,

    userMuted: `🔇 **تم كتم المستخدم**

👤 **المستخدم:** {username}
⏰ **مدة الكتم:** {duration} دقيقة
📝 **السبب:** {reason}

🔓 **سيتم إلغاء الكتم تلقائياً بعد انتهاء المدة**`,

    userUnmuted: `🔊 **تم إلغاء الكتم**

👤 **المستخدم:** {username}
✅ **يمكنه الآن المشاركة مرة أخرى**

⚠️ **تذكير:** الالتزام بقواعد المجموعة مطلوب`
  },

  // أوامر المساعدة
  help: {
    general: `📚 **أوامر البوت - دليل الاستخدام**

👥 **للجميع:**
/${arabicCommands.start} - بدء المحادثة والتسجيل
/${arabicCommands.help} - عرض هذه المساعدة
/${arabicCommands.schedule} - عرض جدول الجلسات
/${arabicCommands.content} - المحتوى التعليمي والملفات
/${arabicCommands.reminder} - تفعيل/إلغاء التذكيرات
/${arabicCommands.questions} - الأسئلة الشائعة

📝 **الاختبارات والتقييم:**
/${arabicCommands.quiz} - بدء اختبار سريع
/${arabicCommands.evaluation} - تقييم الجلسة

💡 **للمساعدة المفصلة لأي أمر:**
أرسل الأمر متبوعاً بكلمة "مساعدة"
مثال: /${arabicCommands.schedule} مساعدة`,

    admin: `👨‍💼 **أوامر المشرفين الإضافية:**

📢 **النشر والتواصل:**
/${arabicCommands.publish} - نشر رسالة في المجموعة
/${arabicCommands.broadcast} - إرسال رسالة لجميع المشتركين

📊 **الإحصائيات والتحليل:**
/${arabicCommands.stats} - عرض إحصائيات مفصلة

👥 **إدارة المستخدمين:**
/${arabicCommands.addUser} - إضافة مستخدم جديد
/${arabicCommands.removeUser} - حذف مستخدم
/${arabicCommands.warn} - إرسال تحذير
/${arabicCommands.mute} - كتم مستخدم
/${arabicCommands.unmute} - إلغاء الكتم

🛠️ **الصيانة:**
/${arabicCommands.backup} - عمل نسخة احتياطية`
  }
};

// إعدادات الجدولة
export const schedulingConfig = {
  // أوقات الإرسال التلقائي
  autoMessages: {
    dailyReminder: '0 8 * * *', // يومياً في الساعة 8 صباحاً
    sessionReminder: '0 19 * * *', // يومياً في الساعة 7 مساءً
    weeklyUpdate: '0 9 * * 0', // الأحد في الساعة 9 صباحاً
    scheduleUpdate: '0 20 * * 6' // السبت في الساعة 8 مساءً
  },
  
  // تذكيرات ما قبل الجلسة
  sessionReminders: {
    '60min': 'تذكير ساعة قبل الجلسة',
    '15min': 'تذكير ربع ساعة قبل الجلسة',
    '5min': 'تذكير 5 دقائق قبل الجلسة'
  }
};

// إعدادات الاختبارات
export const quizConfig = {
  defaultQuestions: 3,
  timeLimit: 300, // 5 دقائق
  passingScore: 70, // النسبة المطلوبة للنجاح
  maxAttempts: 3,
  
  // درجات التقدير
  grading: {
    excellent: { min: 90, message: 'ممتاز! 🏆' },
    veryGood: { min: 80, message: 'جيد جداً! 🌟' },
    good: { min: 70, message: 'جيد! 👍' },
    needsImprovement: { min: 50, message: 'يحتاج تحسين 📚' },
    failed: { min: 0, message: 'راجع المحتوى وحاول مرة أخرى 💪' }
  }
};

// التحقق من الإعدادات
if (!botConfig.token) {
  console.error('❌ خطأ: BOT_TOKEN مطلوب في ملف .env');
  process.exit(1);
}

export default {
  botConfig,
  arabicCommands,
  arabicMessages,
  schedulingConfig,
  quizConfig
};