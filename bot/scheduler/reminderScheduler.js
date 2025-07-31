import schedule from 'node-schedule';
import { getActiveAssignments } from '../services/assignmentService.js';
import { getAllUsers } from '../services/userService.js';
import { reminderTemplates } from '../helpers/messages.js';
import { formatDate } from '../utils/dateFormatter.js';
import { zonedTimeToUtc } from 'date-fns-tz';

export function startReminderScheduler(bot) {
  // Schedule weekly class reminders (Monday and Thursday at 20:55 Cairo time)
  scheduleWeeklyReminders(bot);
  
  // Schedule daily assignment reminders
  scheduleAssignmentReminders(bot);
  
  console.log("📆 Reminder scheduler started");
}

function scheduleWeeklyReminders(bot) {
  // Monday at 20:55 Cairo time
  const mondayRule = new schedule.RecurrenceRule();
  mondayRule.dayOfWeek = 1; // Monday
  mondayRule.hour = 20;
  mondayRule.minute = 55;
  mondayRule.tz = process.env.TIMEZONE || 'Africa/Cairo';
  
  schedule.scheduleJob(mondayRule, async () => {
    sendReminderToAllUsers(bot, reminderTemplates.weeklyClass);
  });
  
  // Thursday at 20:55 Cairo time
  const thursdayRule = new schedule.RecurrenceRule();
  thursdayRule.dayOfWeek = 4; // Thursday
  thursdayRule.hour = 20;
  thursdayRule.minute = 55;
  thursdayRule.tz = process.env.TIMEZONE || 'Africa/Cairo';
  
  schedule.scheduleJob(thursdayRule, async () => {
    sendReminderToAllUsers(bot, reminderTemplates.weeklyClass);
  });
  
  console.log("📅 Weekly class reminders scheduled for Monday and Thursday at 20:55 Cairo time");
}

function scheduleAssignmentReminders(bot) {
  // Daily at 18:00 Cairo time
  const dailyRule = new schedule.RecurrenceRule();
  dailyRule.hour = 18;
  dailyRule.minute = 0;
  dailyRule.tz = process.env.TIMEZONE || 'Africa/Cairo';
  
  schedule.scheduleJob(dailyRule, async () => {
    const assignments = getActiveAssignments();
    const users = getAllUsers();
    
    if (assignments.length === 0 || users.length === 0) {
      return;
    }
    
    for (const user of users) {
      try {
        const userAssignments = assignments.filter(
          assignment => !assignment.completedBy.includes(user.id)
        );
        
        if (userAssignments.length === 0) {
          continue;
        }
        
        let message = "📝 تذكير بالتكليفات المستحقة:\n\n";
        
        userAssignments.forEach((assignment, index) => {
          const deadline = formatDate(new Date(assignment.deadline));
          message += `${index + 1}. ${assignment.title}\n` +
                     `   📂 النوع: ${assignment.type}\n` +
                     `   ⏰ الموعد النهائي: ${deadline}\n` +
                     `   🆔 المعرف: ${assignment.id}\n\n`;
        });
        
        message += "لتأكيد إنجاز تكليف، استخدم الأمر: /done معرف_التكليف";
        
        await bot.telegram.sendMessage(user.id, message);
      } catch (error) {
        console.error(`❌ Failed to send assignment reminder to user ${user.id}:`, error);
      }
    }
  });
  
  console.log("📝 Daily assignment reminders scheduled for 18:00 Cairo time");
}

async function sendReminderToAllUsers(bot, message) {
  const users = getAllUsers();
  
  for (const user of users) {
    try {
      await bot.telegram.sendMessage(user.id, message);
    } catch (error) {
      console.error(`❌ Failed to send reminder to user ${user.id}:`, error);
    }
  }
}
