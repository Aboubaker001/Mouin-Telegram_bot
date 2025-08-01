import config from '../../config.js';

// Welcome Messages
export const welcomeMessage = (username, courseName, nextSession, zoomLink) => {
  return `${config.messages.welcome.title.replace('{courseName}', courseName)}

${config.messages.welcome.body
  .replace('{nextSession}', nextSession)
  .replace('{zoomLink}', zoomLink)}

📌 استخدم هذه الأوامر:
/المحتوى - عرض المواد التعليمية
/الجدول - عرض الجدول الزمني
/تذكير - تفعيل تذكيرات الجلسات
/أسئلة - الأسئلة الشائعة

🚀 ابدأ رحلتك التعليمية! 💻`;
};

// Reminder Messages
export const sessionReminder = (time, zoomLink) => {
  return `${config.messages.reminder.title.replace('{time}', time)}

${config.messages.reminder.body
  .replace('{zoomLink}', zoomLink)}`;
};

// Error Messages
export const errorMessages = {
  invalidCommand: config.messages.error.invalidCommand,
  unauthorized: config.messages.error.unauthorized,
  notVerified: config.messages.error.notVerified,
  userNotFound: "❌ المستخدم غير موجود في النظام.",
  contentNotFound: "❌ المحتوى المطلوب غير متوفر.",
  alreadyRegistered: "📌 أنت مسجل بالفعل في النظام.",
  verificationFailed: "❌ رمز التحقق غير صحيح. حاول مرة أخرى."
};

// Help Messages
export const helpMessage = `
📚 *قائمة الأوامر المتاحة*

👋 *أوامر أساسية:*
/ابدأ - بدء استخدام البوت والتسجيل
/مساعدة - عرض هذه القائمة
/معلوماتي - عرض معلومات المستخدم

📅 *أوامر الجدول والتذكيرات:*
/الجدول - عرض جدول الجلسات الأسبوعي
/تذكير - تفعيل/إلغاء تذكيرات الجلسات
/الجلسة_القادمة - معلومات الجلسة القادمة

📚 *أوامر المحتوى التعليمي:*
/المحتوى - عرض جميع المواد التعليمية
/ملفات - عرض الملفات والكتب
/فيديوهات - عرض الفيديوهات التعليمية

❓ *أوامر المساعدة:*
/أسئلة - الأسئلة الشائعة
/اختبار - بدء اختبار قصير
/تقييم - تقييم الجلسة

📊 *أوامر الإحصائيات (للطلاب):*
/إحصائياتي - إحصائياتك الشخصية

🔧 *أوامر الإدارة (للمدربين):*
/نشر - نشر إعلان جديد
/إحصائيات - إحصائيات المجموعة
/حظر - حظر مستخدم
/إلغاء_حظر - إلغاء حظر مستخدم
`;

// Schedule Messages
export const scheduleMessage = (schedule) => {
  let message = "📅 *جدول الجلسات الأسبوعي:*\n\n";
  
  schedule.sessions.forEach((session, index) => {
    message += `${index + 1}. *${session.day}* - ${session.time}\n`;
    message += `   نوع الجلسة: ${session.type}\n`;
    message += `   المدة: ${session.duration}\n\n`;
  });
  
  message += `🔗 رابط الزوم: ${config.zoom.fullLink}\n`;
  message += `⏰ التذكير قبل: ${schedule.reminderTime} دقيقة`;
  
  return message;
};

// Content Messages
export const contentMessage = (materials) => {
  let message = "📚 *المواد التعليمية:*\n\n";
  
  materials.forEach((material, index) => {
    const emoji = getContentEmoji(material.type);
    message += `${index + 1}. ${emoji} *${material.title}*\n`;
    message += `   ${material.description}\n`;
    message += `   ${material.url}\n\n`;
  });
  
  return message;
};

// Quiz Messages
export const quizMessage = (question, options) => {
  let message = `❓ *السؤال ${question.id}:*\n\n`;
  message += `${question.question}\n\n`;
  
  options.forEach((option, index) => {
    message += `${index + 1}. ${option}\n`;
  });
  
  return message;
};

// Statistics Messages
export const statsMessage = (stats) => {
  return `📊 *إحصائيات المجموعة:*

👥 عدد الأعضاء: ${stats.memberCount}
💬 المشاركة الأسبوعية: ${stats.weeklyMessages} رسالة
🎯 معدل الحضور: ${stats.attendanceRate}% (آخر جلسة)
📈 النشاط اليومي: ${stats.dailyActivity} رسالة
⭐ التقييم العام: ${stats.averageRating}/5`;
};

// FAQ Messages
export const faqMessage = (faqs) => {
  let message = "❓ *الأسئلة الشائعة:*\n\n";
  
  faqs.forEach((faq, index) => {
    message += `${index + 1}. *${faq.question}*\n`;
    message += `   ${faq.answer}\n\n`;
  });
  
  return message;
};

// Admin Messages
export const adminMessage = `
🔧 *لوحة تحكم المدرب:*

📢 *إدارة المحتوى:*
[📅 جدولة منشور] [📊 عرض الإحصائيات] [🚫 حظر مستخدم]

📚 *إدارة الدورة:*
[📝 إضافة محتوى] [❓ إضافة سؤال] [📋 قائمة الحضور]

⚙️ *الإعدادات:*
[🔗 تحديث رابط الزوم] [⏰ تعديل الجدول] [📢 إرسال إعلان]
`;

// Verification Messages
export const verificationMessage = `
🔐 *التحقق من الهوية*

مرحبًا! للانضمام إلى دورة ${config.course.name}، يرجى إدخال رمز الاشتراك المقدم لك.

⏰ لديك ${config.users.verificationTimeout / 60} دقائق لإكمال التحقق.

استخدم الأمر: /تحقق [رمز_الاشتراك]
`;

// Success Messages
export const successMessages = {
  userVerified: "✅ تم التحقق من هويتك بنجاح! مرحبًا بك في الدورة.",
  reminderEnabled: "🔔 تم تفعيل التذكيرات بنجاح! ستتلقى تذكيرات قبل كل جلسة.",
  reminderDisabled: "🔕 تم إلغاء التذكيرات بنجاح!",
  contentAdded: "✅ تم إضافة المحتوى بنجاح!",
  announcementPosted: "📢 تم نشر الإعلان بنجاح!",
  userBanned: "🚫 تم حظر المستخدم بنجاح!",
  userUnbanned: "✅ تم إلغاء حظر المستخدم بنجاح!"
};

// Helper function to get emoji for content type
function getContentEmoji(type) {
  const emojis = {
    pdf: "📄",
    video: "🎥",
    link: "🔗",
    image: "🖼️"
  };
  return emojis[type] || "📄";
}

// Reminder templates (keeping original for backward compatibility)
export const reminderTemplates = {
  weeklyClass: "🔔 تذكير: لدينا درس اليوم في تمام الساعة 21:00 بتوقيت القاهرة",
  assignment: "📝 تذكير بالتكليف: {title}\n⏰ الموعد النهائي: {deadline}"
};
