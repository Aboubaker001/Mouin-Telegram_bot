import cron from 'node-cron';
import { format, addMinutes, isToday, getDay } from 'date-fns';
import ar from 'date-fns/locale/ar/index.js'
import { getUsersWithReminders, getAllUsers, updateUserActivity } from '../services/userService.js';
import { sessionReminder } from '../helpers/messages.js';
import { readJSON, writeJSON } from '../utils/database.js';
import config from '../../config.js';

const MESSAGES_FILE = './data/messages.json';
const ATTENDANCE_FILE = './data/attendance.json';

// Initialize scheduler
export function startReminderScheduler(bot) {
  console.log('⏰ Starting reminder scheduler...');
  
  // Schedule session reminders
  scheduleSessionReminders(bot);
  
  // Schedule weekly statistics
  scheduleWeeklyStats(bot);
  
  // Schedule daily cleanup
  scheduleDailyCleanup(bot);
  
  // Schedule welcome messages for new users
  scheduleWelcomeMessages(bot);
  
  console.log('✅ Reminder scheduler started successfully');
}

// Schedule session reminders
function scheduleSessionReminders(bot) {
  config.schedule.sessions.forEach(session => {
    // Convert Arabic day names to cron day numbers
    const dayNumber = getDayNumber(session.day);
    const [hours, minutes] = session.time.split(':');
    
    // Calculate reminder time (before session)
    const reminderMinutes = parseInt(config.schedule.reminderTime);
    const reminderTime = addMinutes(new Date().setHours(hours, minutes, 0, 0), -reminderMinutes);
    const reminderHours = reminderTime.getHours();
    const reminderMins = reminderTime.getMinutes();
    
    // Schedule reminder
    const cronExpression = `${reminderMins} ${reminderHours} * * ${dayNumber}`;
    
    cron.schedule(cronExpression, async () => {
      try {
        console.log(`🔔 Sending session reminder for ${session.day} ${session.time}`);
        await sendSessionReminder(bot, session);
      } catch (error) {
        console.error('Error sending session reminder:', error);
      }
    }, {
      timezone: config.schedule.timezone
    });
    
    console.log(`📅 Scheduled reminder for ${session.day} ${session.time} (${cronExpression})`);
  });
}

// Schedule weekly statistics
function scheduleWeeklyStats(bot) {
  // Send weekly stats every Sunday at 9 AM
  cron.schedule('0 9 * * 0', async () => {
    try {
      console.log('📊 Sending weekly statistics...');
      await sendWeeklyStats(bot);
    } catch (error) {
      console.error('Error sending weekly stats:', error);
    }
  }, {
    timezone: config.schedule.timezone
  });
  
  console.log('📊 Scheduled weekly statistics (Sundays at 9 AM)');
}

// Schedule daily cleanup
function scheduleDailyCleanup(bot) {
  // Run cleanup every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🧹 Running daily cleanup...');
      await performDailyCleanup(bot);
    } catch (error) {
      console.error('Error during daily cleanup:', error);
    }
  }, {
    timezone: config.schedule.timezone
  });
  
  console.log('🧹 Scheduled daily cleanup (2 AM daily)');
}

// Schedule welcome messages
function scheduleWelcomeMessages(bot) {
  // Check for new users every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('👋 Checking for new users...');
      await checkNewUsers(bot);
    } catch (error) {
      console.error('Error checking new users:', error);
    }
  });
  
  console.log('👋 Scheduled new user check (hourly)');
}

// Send session reminder
async function sendSessionReminder(bot, session) {
  const users = getUsersWithReminders();
  
  if (users.length === 0) {
    console.log('No users with reminders enabled');
    return;
  }
  
  const message = sessionReminder(session.time, config.zoom.fullLink);
  
  let sentCount = 0;
  let failedCount = 0;
  
  for (const user of users) {
    try {
      await bot.telegram.sendMessage(user.id, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔗 رابط الزوم", callback_data: "zoom_link" },
              { text: "📅 عرض الجدول", callback_data: "schedule_show" }
            ],
            [
              { text: "🔕 إلغاء التذكيرات", callback_data: "disable_reminders" }
            ]
          ]
        }
      });
      sentCount++;
      
      // Update user activity
      updateUserActivity(user.id);
      
    } catch (error) {
      console.error(`Failed to send reminder to user ${user.id}:`, error);
      failedCount++;
    }
  }
  
  console.log(`📢 Session reminder sent: ${sentCount} successful, ${failedCount} failed`);
  
  // Log message for statistics
  logMessage('system', 'session_reminder', {
    session: session.day,
    time: session.time,
    sentCount,
    failedCount
  });
}

// Send weekly statistics
async function sendWeeklyStats(bot) {
  const users = getAllUsers().filter(u => u.isVerified);
  const messages = readJSON(MESSAGES_FILE, []);
  const attendance = readJSON(ATTENDANCE_FILE, []);
  
  // Calculate weekly statistics
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const newUsers = users.filter(u => new Date(u.joinDate) > weekAgo).length;
  const weeklyMessages = messages.filter(m => new Date(m.date) > weekAgo).length;
  const activeUsers = users.filter(u => new Date(u.lastActivity) > weekAgo).length;
  
  const statsMessage = `📊 *التقرير الأسبوعي*

📅 الفترة: ${format(weekAgo, 'dd/MM/yyyy', { locale: ar })} - ${format(new Date(), 'dd/MM/yyyy', { locale: ar })}

👥 *إحصائيات الأعضاء:*
- إجمالي الأعضاء: ${users.length}
- أعضاء جدد: ${newUsers}
- أعضاء نشطين: ${activeUsers}

💬 *النشاط:*
- الرسائل الأسبوعية: ${weeklyMessages}
- معدل النشاط: ${Math.round((activeUsers / users.length) * 100)}%

📈 *التوصيات:*
${getWeeklyRecommendations(newUsers, weeklyMessages, activeUsers, users.length)}`;
  
  // Send to admins
  const admins = users.filter(u => u.isAdmin || config.admin.userIds.includes(u.id));
  
  for (const admin of admins) {
    try {
      await bot.telegram.sendMessage(admin.id, statsMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📊 تقرير مفصل", callback_data: "detailed_stats" },
              { text: "📤 تصدير البيانات", callback_data: "export_data" }
            ]
          ]
        }
      });
    } catch (error) {
      console.error(`Failed to send weekly stats to admin ${admin.id}:`, error);
    }
  }
  
  console.log(`📊 Weekly stats sent to ${admins.length} admins`);
}

// Perform daily cleanup
async function performDailyCleanup(bot) {
  try {
    // Clean up expired verifications
    const { cleanupExpiredVerifications } = await import('../services/userService.js');
    const cleanedVerifications = cleanupExpiredVerifications();
    
    // Clean up old messages (keep last 30 days)
    const messages = readJSON(MESSAGES_FILE, []);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filteredMessages = messages.filter(m => new Date(m.date) > thirtyDaysAgo);
    
    if (filteredMessages.length !== messages.length) {
      writeJSON(MESSAGES_FILE, filteredMessages);
      console.log(`🧹 Cleaned up ${messages.length - filteredMessages.length} old messages`);
    }
    
    // Update user activity for inactive users
    const users = getAllUsers();
    const inactiveUsers = users.filter(u => {
      const lastActivity = new Date(u.lastActivity);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActivity < weekAgo;
    });
    
    console.log(`🧹 Found ${inactiveUsers.length} inactive users`);
    
    // Log cleanup statistics
    logMessage('system', 'daily_cleanup', {
      cleanedVerifications,
      cleanedMessages: messages.length - filteredMessages.length,
      inactiveUsers: inactiveUsers.length
    });
    
  } catch (error) {
    console.error('Error during daily cleanup:', error);
  }
}

// Check for new users and send welcome messages
async function checkNewUsers(bot) {
  try {
    const users = getAllUsers();
    const newUsers = users.filter(u => {
      const joinDate = new Date(u.joinDate);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return joinDate > hourAgo && !u.welcomeSent;
    });
    
    for (const user of newUsers) {
      try {
        const welcomeMessage = `🎉 مرحبًا بك في دورة ${config.course.name}! 🚀

أنت الآن جزء من مجتمع التعلم
📅 الجلسة القادمة: ${getNextSession()}
🔗 رابط الزوم: ${config.zoom.fullLink}

📌 استخدم هذه الأوامر:
/المحتوى - عرض المواد التعليمية
/الجدول - عرض الجدول الزمني
/تذكير - تفعيل تذكيرات الجلسات
/أسئلة - الأسئلة الشائعة

🚀 ابدأ رحلتك التعليمية! 💻`;
        
        await bot.telegram.sendMessage(user.id, welcomeMessage, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🔔 تفعيل التذكيرات", callback_data: "enable_reminders" },
                { text: "📅 عرض الجدول", callback_data: "schedule_show" }
              ],
              [
                { text: "📚 عرض المحتوى", callback_data: "content_all" },
                { text: "❓ الأسئلة الشائعة", callback_data: "faq_help" }
              ]
            ]
          }
        });
        
        // Mark welcome as sent
        user.welcomeSent = true;
        
      } catch (error) {
        console.error(`Failed to send welcome message to user ${user.id}:`, error);
      }
    }
    
    if (newUsers.length > 0) {
      console.log(`👋 Sent welcome messages to ${newUsers.length} new users`);
    }
    
  } catch (error) {
    console.error('Error checking new users:', error);
  }
}

// Helper functions
function getDayNumber(arabicDay) {
  const dayMap = {
    'الأحد': 0,
    'الاثنين': 1,
    'الثلاثاء': 2,
    'الأربعاء': 3,
    'الخميس': 4,
    'الجمعة': 5,
    'السبت': 6
  };
  return dayMap[arabicDay] || 0;
}

function getNextSession() {
  const nextSession = config.schedule.sessions[0];
  return `${nextSession.day} - ${nextSession.time}`;
}

function getWeeklyRecommendations(newUsers, weeklyMessages, activeUsers, totalUsers) {
  const recommendations = [];
  
  if (newUsers === 0) {
    recommendations.push("• تشجيع التسجيل الجديد عبر الإعلانات");
  }
  
  if (weeklyMessages < totalUsers * 0.5) {
    recommendations.push("• زيادة التفاعل عبر الأنشطة والاختبارات");
  }
  
  if (activeUsers < totalUsers * 0.7) {
    recommendations.push("• إرسال تذكيرات للمستخدمين غير النشطين");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("• استمرار النشاط الحالي - الأداء ممتاز!");
  }
  
  return recommendations.join('\n');
}

function logMessage(userId, type, data) {
  const messages = readJSON(MESSAGES_FILE, []);
  messages.push({
    userId,
    type,
    data,
    date: new Date().toISOString()
  });
  writeJSON(MESSAGES_FILE, messages);
}
