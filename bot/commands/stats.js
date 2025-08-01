import { statsMessage } from '../helpers/messages.js';
import { isUserVerified, isUserAdmin, getAllUsers, getActiveUsers, getUserStats } from '../services/userService.js';
import { errorMessages } from '../helpers/messages.js';
import { readJSON } from '../utils/database.js';
import config from '../../config.js';

const MESSAGES_FILE = './data/messages.json';
const ATTENDANCE_FILE = './data/attendance.json';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Check if user is verified
    if (!isUserVerified(userId)) {
      return ctx.reply(errorMessages.notVerified);
    }
    
    const isAdmin = isUserAdmin(userId);
    
    if (isAdmin) {
      // Admin statistics
      await sendAdminStats(ctx);
    } else {
      // User statistics
      await sendUserStats(ctx, userId);
    }
    
  } catch (error) {
    console.error("Error in stats command:", error);
    ctx.reply("❌ حدث خطأ أثناء عرض الإحصائيات. الرجاء المحاولة مرة أخرى.");
  }
};

// Send admin statistics
async function sendAdminStats(ctx) {
  const users = getAllUsers();
  const activeUsers = getActiveUsers();
  const messages = readJSON(MESSAGES_FILE, []);
  const attendance = readJSON(ATTENDANCE_FILE, []);
  
  // Calculate statistics
  const totalUsers = users.filter(u => u.isVerified).length;
  const newUsersThisWeek = users.filter(u => {
    const joinDate = new Date(u.joinDate);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return joinDate > weekAgo && u.isVerified;
  }).length;
  
  const weeklyMessages = messages.filter(m => {
    const messageDate = new Date(m.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return messageDate > weekAgo;
  }).length;
  
  const dailyActivity = messages.filter(m => {
    const messageDate = new Date(m.date);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return messageDate > dayAgo;
  }).length;
  
  // Calculate attendance rate
  const lastSessionAttendance = attendance.length > 0 ? attendance[attendance.length - 1] : null;
  const attendanceRate = lastSessionAttendance 
    ? Math.round((lastSessionAttendance.present.length / totalUsers) * 100)
    : 0;
  
  // Calculate average rating
  const ratings = attendance.flatMap(session => session.ratings || []);
  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;
  
  const stats = {
    memberCount: totalUsers,
    weeklyMessages,
    attendanceRate,
    dailyActivity,
    averageRating,
    activeUsers: activeUsers.length,
    newUsersThisWeek
  };
  
  const message = `📊 *إحصائيات المجموعة (للمدرب):*

👥 عدد الأعضاء: ${stats.memberCount}
🆕 أعضاء جدد هذا الأسبوع: ${stats.newUsersThisWeek}
💬 المشاركة الأسبوعية: ${stats.weeklyMessages} رسالة
📈 النشاط اليومي: ${stats.dailyActivity} رسالة
🎯 معدل الحضور: ${stats.attendanceRate}% (آخر جلسة)
⭐ التقييم العام: ${stats.averageRating}/5
👤 المستخدمين النشطين: ${stats.activeUsers}

📅 *تفاصيل إضافية:*
- المستخدمين المحظورين: ${users.filter(u => u.isMuted).length}
- المستخدمين مع تحذيرات: ${users.filter(u => u.warnings > 0).length}
- المستخدمين مع تذكيرات مفعلة: ${users.filter(u => u.remindersEnabled).length}`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "📊 تقرير مفصل", callback_data: "detailed_stats" },
        { text: "👥 قائمة الأعضاء", callback_data: "member_list" }
      ],
      [
        { text: "📅 إحصائيات الحضور", callback_data: "attendance_stats" },
        { text: "📈 تحليل النشاط", callback_data: "activity_analysis" }
      ],
      [
        { text: "📤 تصدير البيانات", callback_data: "export_data" },
        { text: "🔙 العودة", callback_data: "admin_menu" }
      ]
    ]
  };
  
  ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Send user statistics
async function sendUserStats(ctx, userId) {
  const userStats = getUserStats(userId);
  const messages = readJSON(MESSAGES_FILE, []);
  const attendance = readJSON(ATTENDANCE_FILE, []);
  
  if (!userStats) {
    return ctx.reply("❌ لم يتم العثور على إحصائيات المستخدم.");
  }
  
  // Calculate user-specific statistics
  const userMessages = messages.filter(m => m.userId === userId);
  const weeklyMessages = userMessages.filter(m => {
    const messageDate = new Date(m.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return messageDate > weekAgo;
  }).length;
  
  const userAttendance = attendance.filter(session => 
    session.present.includes(userId)
  ).length;
  
  const totalSessions = attendance.length;
  const attendanceRate = totalSessions > 0 
    ? Math.round((userAttendance / totalSessions) * 100)
    : 0;
  
  const userRatings = attendance.flatMap(session => 
    session.ratings?.filter(r => r.userId === userId) || []
  );
  const averageRating = userRatings.length > 0
    ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1)
    : 0;
  
  const message = `📊 *إحصائياتك الشخصية:*

👤 الاسم: ${userStats.user.firstName} ${userStats.user.lastName}
📅 تاريخ الانضمام: ${new Date(userStats.user.joinDate).toLocaleDateString('ar-SA')}
⏰ الأيام منذ الانضمام: ${userStats.daysSinceJoin} يوم

📈 *النشاط:*
💬 رسائلك هذا الأسبوع: ${weeklyMessages}
🎯 معدل الحضور: ${attendanceRate}% (${userAttendance}/${totalSessions} جلسة)
⭐ تقييمك العام: ${averageRating}/5

🏆 *المرتبة:*
📊 ترتيبك بين الأعضاء: ${userStats.userRank} من ${userStats.totalUsers}
👥 المستخدمين النشطين: ${userStats.activeUsers}

⚠️ *التحذيرات:*
🚨 عدد التحذيرات: ${userStats.user.warnings}`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "📊 تفاصيل أكثر", callback_data: "my_detailed_stats" },
        { text: "📅 سجل الحضور", callback_data: "my_attendance" }
      ],
      [
        { text: "📈 تقدمي", callback_data: "my_progress" },
        { text: "🏆 إنجازاتي", callback_data: "my_achievements" }
      ],
      [
        { text: "🔙 القائمة الرئيسية", callback_data: "main_menu" }
      ]
    ]
  };
  
  ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}