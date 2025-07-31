import cron from 'node-cron';
import { getActiveAssignments } from '../services/assignmentService.js';
import { getAllUsers } from '../services/userService.js';
import { reminderTemplates } from '../helpers/messages.js';
import { formatDate } from '../utils/dateFormatter.js';

export function startReminderScheduler(bot) {
  // Schedule weekly class reminders (Monday and Thursday at 20:55 Cairo time)
  scheduleWeeklyReminders(bot);
  
  // Schedule daily assignment reminders
  scheduleAssignmentReminders(bot);
  
  console.log("📆 Reminder scheduler started");
}

function scheduleWeeklyReminders(bot) {
  const timezone = process.env.TIMEZONE || 'Africa/Cairo';
  
  // Monday and Thursday at 20:55 Cairo time
  // Cron format: minute hour day-of-month month day-of-week
  // day-of-week: 1=Monday, 4=Thursday
  cron.schedule('55 20 * * 1,4', async () => {
    try {
      console.log('📅 Sending weekly class reminders...');
      await sendReminderToAllUsers(bot, reminderTemplates.weeklyClass);
    } catch (error) {
      console.error('❌ Error sending weekly reminders:', error);
    }
  }, {
    scheduled: true,
    timezone: timezone
  });
  
  console.log("📅 Weekly class reminders scheduled for Monday and Thursday at 20:55 Cairo time");
}

function scheduleAssignmentReminders(bot) {
  const timezone = process.env.TIMEZONE || 'Africa/Cairo';
  
  // Daily at 18:00 Cairo time
  cron.schedule('0 18 * * *', async () => {
    try {
      console.log('📝 Checking for assignment reminders...');
      const assignments = getActiveAssignments();
      const users = getAllUsers();
      
      if (assignments.length === 0 || users.length === 0) {
        console.log('No assignments or users to remind');
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
          console.log(`📝 Assignment reminder sent to user ${user.id}`);
        } catch (error) {
          console.error(`❌ Failed to send assignment reminder to user ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in assignment reminder scheduler:', error);
    }
  }, {
    scheduled: true,
    timezone: timezone
  });
  
  console.log("📝 Daily assignment reminders scheduled for 18:00 Cairo time");
}

async function sendReminderToAllUsers(bot, message) {
  const users = getAllUsers();
  
  for (const user of users) {
    try {
      await bot.telegram.sendMessage(user.id, message);
      console.log(`📅 Weekly reminder sent to user ${user.id}`);
    } catch (error) {
      console.error(`❌ Failed to send reminder to user ${user.id}:`, error);
    }
  }
}
