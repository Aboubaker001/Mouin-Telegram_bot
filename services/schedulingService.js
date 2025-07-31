import cron from 'node-cron';
import fs from 'fs/promises';
import { botConfig, arabicMessages, schedulingConfig } from '../config/arabic-config.js';
import { getActiveUsers } from './userManagement.js';
import { logInfo, logError } from '../bot/utils/logger.js';

// بيانات الجدول الافتراضية
const defaultSchedule = {
  weeklySchedule: {
    sunday: {
      sessions: [
        {
          time: '20:00',
          topic: 'مقدمة في البرمجة',
          type: 'درس',
          zoomLink: 'https://zoom.us/j/example',
          duration: 120 // بالدقائق
        }
      ]
    },
    tuesday: {
      sessions: [
        {
          time: '20:00',
          topic: 'أساسيات JavaScript',
          type: 'درس تطبيقي',
          zoomLink: 'https://zoom.us/j/example',
          duration: 120
        }
      ]
    },
    thursday: {
      sessions: [
        {
          time: '20:00',
          topic: 'حل المشاكل البرمجية',
          type: 'ورشة عمل',
          zoomLink: 'https://zoom.us/j/example',
          duration: 90
        }
      ]
    }
  },
  
  specialEvents: [
    {
      date: '2025-08-15',
      time: '19:00',
      topic: 'مراجعة شاملة',
      type: 'مراجعة',
      zoomLink: 'https://zoom.us/j/review',
      duration: 180
    }
  ]
};

// تحميل الجدول
export async function loadSchedule() {
  try {
    const data = await fs.readFile('./data/schedule.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // إذا لم يوجد الملف، إنشاء جدول افتراضي
    await saveSchedule(defaultSchedule);
    return defaultSchedule;
  }
}

// حفظ الجدول
export async function saveSchedule(schedule) {
  try {
    await fs.writeFile('./data/schedule.json', JSON.stringify(schedule, null, 2), 'utf8');
    return true;
  } catch (error) {
    logError('خطأ في حفظ الجدول:', error);
    return false;
  }
}

// تنسيق عرض الجدول اليومي
export function formatDailySchedule(dayName, sessions) {
  if (!sessions || sessions.length === 0) {
    return `📅 **${getDayNameInArabic(dayName)}**: لا توجد جلسات`;
  }
  
  let schedule = `📅 **${getDayNameInArabic(dayName)}**:\n`;
  
  sessions.forEach((session, index) => {
    schedule += `\n${index + 1}. 🕐 **${session.time}** - ${session.topic}\n`;
    schedule += `   📚 **النوع:** ${session.type}\n`;
    schedule += `   ⏱️ **المدة:** ${session.duration} دقيقة\n`;
    if (session.zoomLink) {
      schedule += `   🔗 **الرابط:** ${session.zoomLink}\n`;
    }
  });
  
  return schedule;
}

// تنسيق الجدول الأسبوعي
export function formatWeeklySchedule(weeklySchedule) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  let schedule = `📅 **الجدول الأسبوعي**\n\n`;
  
  days.forEach(day => {
    if (weeklySchedule[day] && weeklySchedule[day].sessions.length > 0) {
      schedule += formatDailySchedule(day, weeklySchedule[day].sessions) + '\n\n';
    }
  });
  
  return schedule;
}

// الحصول على جدول اليوم
export async function getTodaySchedule() {
  try {
    const schedule = await loadSchedule();
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const todaySessions = schedule.weeklySchedule[dayName]?.sessions || [];
    
    // التحقق من الأحداث الخاصة لهذا اليوم
    const todayDate = today.toISOString().split('T')[0];
    const specialEvents = schedule.specialEvents?.filter(event => event.date === todayDate) || [];
    
    return {
      regular: todaySessions,
      special: specialEvents,
      dayName: getDayNameInArabic(dayName)
    };
  } catch (error) {
    logError('خطأ في الحصول على جدول اليوم:', error);
    return { regular: [], special: [], dayName: 'اليوم' };
  }
}

// إرسال تذكير للجلسة
export async function sendSessionReminder(bot, session, minutesBefore) {
  try {
    const users = await getActiveUsers();
    
    if (users.length === 0) {
      logInfo('لا توجد مستخدمين نشطين للتذكير');
      return;
    }
    
    const reminderMessage = arabicMessages.reminders.sessionSoon
      .replace('{time}', session.time)
      .replace('{zoomLink}', session.zoomLink || 'سيتم إرسال الرابط قريباً')
      .replace('{topic}', session.topic);
    
    let successCount = 0;
    
    for (const user of users) {
      try {
        if (user.settings.remindersEnabled) {
          await bot.telegram.sendMessage(user.id, reminderMessage);
          successCount++;
        }
      } catch (error) {
        logError(`فشل إرسال التذكير للمستخدم ${user.id}:`, error);
      }
    }
    
    logInfo(`تم إرسال تذكير الجلسة لـ ${successCount} مستخدم (${minutesBefore} دقيقة قبل الجلسة)`);
  } catch (error) {
    logError('خطأ في إرسال تذكير الجلسة:', error);
  }
}

// إرسال الجدول اليومي
export async function sendDailySchedule(bot) {
  try {
    const users = await getActiveUsers();
    const todaySchedule = await getTodaySchedule();
    
    if (todaySchedule.regular.length === 0 && todaySchedule.special.length === 0) {
      logInfo('لا توجد جلسات اليوم للتذكير بها');
      return;
    }
    
    const today = new Date().toLocaleDateString('ar-EG', {
      timeZone: botConfig.timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let scheduleMessage = arabicMessages.reminders.dailySchedule
      .replace('{date}', today);
    
    let schedule = '';
    
    // الجلسات العادية
    if (todaySchedule.regular.length > 0) {
      schedule += '📚 **الجلسات العادية:**\n';
      todaySchedule.regular.forEach((session, index) => {
        schedule += `${index + 1}. 🕐 ${session.time} - ${session.topic}\n`;
      });
      schedule += '\n';
    }
    
    // الأحداث الخاصة
    if (todaySchedule.special.length > 0) {
      schedule += '⭐ **أحداث خاصة:**\n';
      todaySchedule.special.forEach((event, index) => {
        schedule += `${index + 1}. 🕐 ${event.time} - ${event.topic}\n`;
      });
    }
    
    scheduleMessage = scheduleMessage.replace('{schedule}', schedule);
    
    let successCount = 0;
    
    for (const user of users) {
      try {
        if (user.settings.remindersEnabled) {
          await bot.telegram.sendMessage(user.id, scheduleMessage);
          successCount++;
        }
      } catch (error) {
        logError(`فشل إرسال الجدول اليومي للمستخدم ${user.id}:`, error);
      }
    }
    
    logInfo(`تم إرسال الجدول اليومي لـ ${successCount} مستخدم`);
  } catch (error) {
    logError('خطأ في إرسال الجدول اليومي:', error);
  }
}

// بدء خدمة الجدولة
export function startSchedulingService(bot) {
  logInfo('🗓️ بدء خدمة الجدولة والتذكيرات...');
  
  // تذكير يومي بالجدول (8:00 صباحاً)
  cron.schedule(schedulingConfig.autoMessages.dailyReminder, async () => {
    logInfo('إرسال التذكير اليومي...');
    await sendDailySchedule(bot);
  }, {
    scheduled: true,
    timezone: botConfig.timezone
  });
  
  // فحص التذكيرات قبل الجلسات (كل دقيقة)
  cron.schedule('* * * * *', async () => {
    await checkUpcomingSessions(bot);
  }, {
    scheduled: true,
    timezone: botConfig.timezone
  });
  
  // تحديث أسبوعي للجدول (الأحد 9:00 صباحاً)
  cron.schedule(schedulingConfig.autoMessages.weeklyUpdate, async () => {
    logInfo('إرسال التحديث الأسبوعي...');
    await sendWeeklyUpdate(bot);
  }, {
    scheduled: true,
    timezone: botConfig.timezone
  });
  
  logInfo('✅ تم تشغيل خدمة الجدولة بنجاح');
}

// فحص الجلسات القادمة وإرسال التذكيرات
async function checkUpcomingSessions(bot) {
  try {
    const now = new Date();
    const todaySchedule = await getTodaySchedule();
    const allSessions = [...todaySchedule.regular, ...todaySchedule.special];
    
    for (const session of allSessions) {
      const sessionTime = new Date();
      const [hours, minutes] = session.time.split(':');
      sessionTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const timeDiff = sessionTime.getTime() - now.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      // تذكيرات في أوقات محددة
      if ([60, 15, 5].includes(minutesDiff)) {
        await sendSessionReminder(bot, session, minutesDiff);
      }
    }
  } catch (error) {
    logError('خطأ في فحص الجلسات القادمة:', error);
  }
}

// إرسال التحديث الأسبوعي
async function sendWeeklyUpdate(bot) {
  try {
    const users = await getActiveUsers();
    const schedule = await loadSchedule();
    
    const weekNumber = getWeekNumber(new Date());
    const weeklySchedule = formatWeeklySchedule(schedule.weeklySchedule);
    
    const updateMessage = arabicMessages.reminders.weeklyUpdate
      .replace('{weekNumber}', weekNumber)
      .replace('{weeklySchedule}', weeklySchedule)
      .replace('{achievements}', 'مراجعة الأسبوع الماضي')
      .replace('{goals}', 'التركيز على التطبيق العملي');
    
    let successCount = 0;
    
    for (const user of users) {
      try {
        if (user.settings.remindersEnabled) {
          await bot.telegram.sendMessage(user.id, updateMessage);
          successCount++;
        }
      } catch (error) {
        logError(`فشل إرسال التحديث الأسبوعي للمستخدم ${user.id}:`, error);
      }
    }
    
    logInfo(`تم إرسال التحديث الأسبوعي لـ ${successCount} مستخدم`);
  } catch (error) {
    logError('خطأ في إرسال التحديث الأسبوعي:', error);
  }
}

// تحويل اسم اليوم إلى العربية
function getDayNameInArabic(dayName) {
  const days = {
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت'
  };
  
  return days[dayName] || dayName;
}

// الحصول على رقم الأسبوع
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default {
  loadSchedule,
  saveSchedule,
  formatDailySchedule,
  formatWeeklySchedule,
  getTodaySchedule,
  sendSessionReminder,
  sendDailySchedule,
  startSchedulingService
};