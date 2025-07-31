#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupBot() {
  console.log('🤖 Muin Al-Mujtahidin Course Management Bot Setup');
  console.log('================================================\n');

  try {
    // Check if .env exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env file...');
      
      const botToken = await question('Enter your Telegram Bot Token (from @BotFather): ');
      const timezone = await question('Enter your timezone (default: Africa/Cairo): ') || 'Africa/Cairo';
      
      const envContent = `BOT_TOKEN=${botToken}
TIMEZONE=${timezone}
NODE_ENV=production
`;
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created successfully!\n');
    } else {
      console.log('✅ .env file already exists\n');
    }

    // Check if config.js exists
    const configPath = path.join(__dirname, 'config.js');
    if (!fs.existsSync(configPath)) {
      console.log('📝 Creating config.js file...');
      
      const courseName = await question('Enter course name (default: أساسيات البرمجة): ') || 'أساسيات البرمجة';
      const courseDescription = await question('Enter course description: ') || 'دورة تعليمية شاملة في أساسيات البرمجة للمبتدئين';
      const instructor = await question('Enter instructor name: ') || 'أستاذ البرمجة';
      const subscriptionCode = await question('Enter subscription code for students (default: COURSE2024): ') || 'COURSE2024';
      const zoomLink = await question('Enter Zoom meeting link: ') || 'https://zoom.us/j/123456789?pwd=123456';
      
      const adminId = await question('Enter admin Telegram user ID (optional): ');
      const groupId = await question('Enter main group ID (optional): ');
      
      const configContent = `// Course Management Bot Configuration
export const config = {
  // Course Information
  course: {
    name: "${courseName}",
    description: "${courseDescription}",
    instructor: "${instructor}",
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
    fullLink: "${zoomLink}"
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
    subscriptionCode: "${subscriptionCode}"
  },

  // Admin Configuration
  admin: {
    userIds: [${adminId ? adminId : ''}], // Add admin user IDs here
    groupId: "${groupId || ''}", // Main group ID
    supportChannel: "@course_support"
  },

  // Messages and Templates
  messages: {
    welcome: {
      title: "🎉 مرحبًا بك في دورة {courseName}! 🚀",
      body: "أنت الآن جزء من مجتمع التعلم\\n📅 الجلسة القادمة: {nextSession}\\n🔗 رابط الزوم: {zoomLink}\\n📌 تحقق من التعليمات المثبتة وابدأ رحلتك! 💪"
    },
    reminder: {
      title: "⏰ تذكير: جلسة اليوم تبدأ في {time}! 💻",
      body: "🔗 رابط الزوم: {zoomLink}\\n📝 لا تنسى دفتر الملاحظات! 😎"
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
`;
      
      fs.writeFileSync(configPath, configContent);
      console.log('✅ config.js file created successfully!\n');
    } else {
      console.log('✅ config.js file already exists\n');
    }

    // Create data directory
    const dataPath = path.join(__dirname, 'data');
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
      console.log('✅ Data directory created successfully!\n');
    } else {
      console.log('✅ Data directory already exists\n');
    }

    // Check dependencies
    console.log('📦 Checking dependencies...');
    const packagePath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packagePath)) {
      console.log('✅ package.json found');
      
      const installDeps = await question('Do you want to install dependencies? (y/n): ');
      if (installDeps.toLowerCase() === 'y' || installDeps.toLowerCase() === 'yes') {
        console.log('📦 Installing dependencies...');
        const { execSync } = await import('child_process');
        try {
          execSync('npm install', { stdio: 'inherit' });
          console.log('✅ Dependencies installed successfully!\n');
        } catch (error) {
          console.log('❌ Error installing dependencies. Please run "npm install" manually.\n');
        }
      }
    }

    console.log('🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Review and customize config.js with your course details');
    console.log('2. Add admin user IDs to config.js');
    console.log('3. Update Zoom links and content materials');
    console.log('4. Start the bot with: npm start');
    console.log('5. Test the bot with /ابدأ command');
    
    console.log('\n📚 For more information, check the README.md file');
    console.log('🆘 For support, visit: https://github.com/Aboubaker001/Mouin-Telegram_bot');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setupBot();