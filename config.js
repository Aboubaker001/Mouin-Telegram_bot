// Course Management Bot Configuration
export const config = {
  // Course Information
  course: {
    name: "أساسيات البرمجة",
    description: "دورة تعليمية شاملة في أساسيات البرمجة للمبتدئين",
    instructor: "أستاذ البرمجة",
    duration: "12 أسبوع",
    level: "مبتدئ"
  },

  // Schedule Configuration
  schedule: {
    sessions: [
      {
        day: "الثلاثاء",
        time: "20:00",
        timezone: "Africa/Cairo",
        duration: "90 دقيقة",
        type: "محاضرة"
      },
      {
        day: "الخميس", 
        time: "20:00",
        timezone: "Africa/Cairo",
        duration: "90 دقيقة",
        type: "تدريب عملي"
      }
    ],
    reminderTime: "60", // minutes before session
    timezone: "Africa/Cairo"
  },

  // Zoom Configuration
  zoom: {
    baseUrl: "https://zoom.us/j/",
    meetingId: "123456789",
    password: "123456",
    fullLink: "https://zoom.us/j/123456789?pwd=123456"
  },

  // Content Management
  content: {
    materials: [
      {
        title: "مقدمة في البرمجة",
        type: "pdf",
        url: "https://drive.google.com/file/d/example1",
        description: "شرح شامل لمفاهيم البرمجة الأساسية"
      },
      {
        title: "متغيرات وأنواع البيانات",
        type: "video",
        url: "https://youtube.com/watch?v=example1",
        description: "فيديو تعليمي عن المتغيرات"
      },
      {
        title: "التحكم في التدفق",
        type: "pdf",
        url: "https://drive.google.com/file/d/example2",
        description: "شرح الجمل الشرطية والحلقات"
      }
    ],
    categories: ["pdf", "video", "link", "image"]
  },

  // User Management
  users: {
    verificationTimeout: 300, // 5 minutes in seconds
    maxWarnings: 3,
    muteDuration: 3600, // 1 hour in seconds
    subscriptionCode: "OUMA_1447"
  },

  // Admin Configuration
  admin: {
    userIds: [7782407251, 7778008989], // Add admin user IDs here
    groupId: "-1002733159355", // Main group ID
    supportChannel: "@deenwatine"
  },

  // Messages and Templates
  messages: {
    welcome: {
      title: "🎉 مرحبًا بك في دورة {courseName}! 🚀",
      body: "أنت الآن جزء من مجتمع التعلم\n📅 الجلسة القادمة: {nextSession}\n🔗 رابط الزوم: {zoomLink}\n📌 تحقق من التعليمات المثبتة وابدأ رحلتك! 💪"
    },
    reminder: {
      title: "⏰ تذكير: جلسة اليوم تبدأ في {time}! 💻",
      body: "🔗 رابط الزوم: {zoomLink}\n📝 لا تنسى دفتر الملاحظات! 😎"
    },
    error: {
      invalidCommand: "❗ عذرًا، هذا الأمر غير صحيح. جرب /مساعدة للأوامر المتاحة! 😊",
      unauthorized: "🚫 عذرًا، ليس لديك صلاحية لاستخدام هذا الأمر.",
      notVerified: "⚠️ يجب عليك التحقق من هويتك أولاً. استخدم رمز الاشتراك المقدم لك."
    }
  },

  // Quiz Configuration
  quiz: {
    questions: [
      {
        id: 1,
        question: "ما هو المتغير في البرمجة؟",
        options: [
          "مخزن للبيانات",
          "نوع من الحلقات",
          "دالة برمجية",
          "خطأ في الكود"
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        question: "أي من التالي ليس نوع بيانات أساسي؟",
        options: [
          "String",
          "Integer", 
          "Boolean",
          "Function"
        ],
        correctAnswer: 3
      },
      {
        id: 3,
        question: "ما هو الغرض من الحلقات في البرمجة؟",
        options: [
          "تخزين البيانات",
          "تكرار العمليات",
          "طباعة النصوص",
          "حفظ الملفات"
        ],
        correctAnswer: 1
      }
    ]
  },

  // FAQ Configuration
  faq: [
    {
      question: "متى تبدأ الجلسة القادمة؟",
      answer: "الجلسة القادمة يوم {nextDay} في تمام الساعة {nextTime}. رابط الزوم: {zoomLink}"
    },
    {
      question: "كيف يمكنني الوصول للمحتوى التعليمي؟",
      answer: "استخدم الأمر /المحتوى لعرض جميع المواد التعليمية المتاحة."
    },
    {
      question: "ماذا أفعل إذا فاتتني جلسة؟",
      answer: "يمكنك مشاهدة التسجيل أو التواصل مع المدرب عبر {supportChannel}"
    },
    {
      question: "كيف يمكنني الحصول على المساعدة؟",
      answer: "استخدم الأمر /مساعدة لعرض الأوامر المتاحة، أو تواصل مع الدعم عبر {supportChannel}"
    }
  ],

  // Statistics Configuration
  stats: {
    trackEngagement: true,
    trackAttendance: true,
    weeklyReport: true
  },

  // Security Configuration
  security: {
    allowedDomains: ["zoom.us", "youtube.com", "drive.google.com"],
    spamThreshold: 5, // messages per minute
    linkFilter: true
  }
};

export default config;