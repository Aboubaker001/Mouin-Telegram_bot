import asyncio
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from aiogram import Bot
from config import Config
from database import db

class BotScheduler:
    def __init__(self, bot: Bot):
        self.bot = bot
        self.scheduler = AsyncIOScheduler()
        self._setup_jobs()
    
    def _setup_jobs(self):
        """Setup all scheduled jobs"""
        # Daily schedule reminder at 9:00 AM
        self.scheduler.add_job(
            self._send_daily_schedule,
            CronTrigger(hour=9, minute=0),
            id='daily_schedule',
            name='Daily Schedule Reminder'
        )
        
        # Session reminders (1 hour before each session)
        self._setup_session_reminders()
        
        # Weekly statistics (every Sunday at 8:00 PM)
        self.scheduler.add_job(
            self._send_weekly_stats,
            CronTrigger(day_of_week='sun', hour=20, minute=0),
            id='weekly_stats',
            name='Weekly Statistics'
        )
        
        # Clean up expired mutes (every hour)
        self.scheduler.add_job(
            self._cleanup_expired_mutes,
            IntervalTrigger(hours=1),
            id='cleanup_mutes',
            name='Cleanup Expired Mutes'
        )
        
        # Unverified user cleanup (every 5 minutes)
        self.scheduler.add_job(
            self._cleanup_unverified_users,
            IntervalTrigger(minutes=5),
            id='cleanup_unverified',
            name='Cleanup Unverified Users'
        )
    
    def _setup_session_reminders(self):
        """Setup reminders for each session day"""
        session_days = {
            'السبت': 19,  # 7:00 PM
            'الأحد': 19,
            'الاثنين': 19,
            'الثلاثاء': 19,
            'الأربعاء': 19,
            'الخميس': 19
        }
        
        for day, hour in session_days.items():
            # Send reminder 1 hour before session
            reminder_hour = hour - 1  # 6:00 PM
            
            # Map Arabic days to English for cron
            day_mapping = {
                'السبت': 'sat',
                'الأحد': 'sun',
                'الاثنين': 'mon',
                'الثلاثاء': 'tue',
                'الأربعاء': 'wed',
                'الخميس': 'thu'
            }
            
            english_day = day_mapping.get(day)
            if english_day:
                self.scheduler.add_job(
                    self._send_session_reminder,
                    CronTrigger(day_of_week=english_day, hour=reminder_hour, minute=0),
                    id=f'session_reminder_{day}',
                    name=f'Session Reminder - {day}',
                    args=[day]
                )
    
    async def _send_daily_schedule(self):
        """Send daily schedule to all verified users"""
        try:
            schedule_text = "📅 *جدول اليوم*\n\n"
            today = datetime.now().strftime("%A")
            
            # Map English day to Arabic
            day_mapping = {
                'Saturday': 'السبت',
                'Sunday': 'الأحد',
                'Monday': 'الاثنين',
                'Tuesday': 'الثلاثاء',
                'Wednesday': 'الأربعاء',
                'Thursday': 'الخميس',
                'Friday': 'الجمعة'
            }
            
            arabic_day = day_mapping.get(today, today)
            if arabic_day in Config.SCHEDULE:
                schedule_text += f"📚 {arabic_day}: {Config.SCHEDULE[arabic_day]}\n"
                schedule_text += f"🔗 رابط الزوم: {Config.ZOOM_LINK}\n"
                schedule_text += f"🔑 كلمة المرور: {Config.ZOOM_PASSWORD}\n\n"
                schedule_text += "💡 لا تنسى تسجيل حضورك باستخدام /حضور"
            else:
                schedule_text += "🎉 اليوم يوم راحة! استمتع بوقتك"
            
            # Get all verified users
            verified_users = db.get_verified_users()
            for user in verified_users:
                try:
                    await self.bot.send_message(
                        user['id'],
                        schedule_text,
                        parse_mode='Markdown'
                    )
                    await asyncio.sleep(0.1)  # Rate limiting
                except Exception as e:
                    print(f"Error sending daily schedule to user {user['id']}: {e}")
                    
        except Exception as e:
            print(f"Error in daily schedule job: {e}")
    
    async def _send_session_reminder(self, day: str):
        """Send session reminder"""
        try:
            reminder_text = Config.MESSAGES['reminder'].format(
                zoom_link=Config.ZOOM_LINK
            )
            
            # Get all verified users
            verified_users = db.get_verified_users()
            for user in verified_users:
                try:
                    await self.bot.send_message(
                        user['id'],
                        reminder_text,
                        parse_mode='Markdown'
                    )
                    await asyncio.sleep(0.1)  # Rate limiting
                except Exception as e:
                    print(f"Error sending session reminder to user {user['id']}: {e}")
                    
        except Exception as e:
            print(f"Error in session reminder job: {e}")
    
    async def _send_weekly_stats(self):
        """Send weekly statistics to admins"""
        try:
            stats = db.get_statistics()
            stats_text = Config.MESSAGES['stats'].format(
                member_count=stats['member_count'],
                weekly_messages=stats['weekly_messages'],
                attendance_rate=stats['attendance_rate']
            )
            
            # Send to all admins
            for admin_id in Config.ADMIN_IDS:
                try:
                    await self.bot.send_message(
                        admin_id,
                        stats_text,
                        parse_mode='Markdown'
                    )
                except Exception as e:
                    print(f"Error sending weekly stats to admin {admin_id}: {e}")
                    
        except Exception as e:
            print(f"Error in weekly stats job: {e}")
    
    async def _cleanup_expired_mutes(self):
        """Clean up expired mutes"""
        try:
            # This is handled in the database.is_muted() method
            # Just log that cleanup is running
            print("Running mute cleanup...")
        except Exception as e:
            print(f"Error in mute cleanup job: {e}")
    
    async def _cleanup_unverified_users(self):
        """Clean up unverified users after timeout"""
        try:
            unverified_users = db.get_unverified_users()
            current_time = datetime.now()
            
            for user in unverified_users:
                registered_at = datetime.fromisoformat(user['registered_at'])
                time_diff = current_time - registered_at
                
                if time_diff.total_seconds() > Config.VERIFICATION_TIMEOUT:
                    # User has exceeded verification timeout
                    # In a real implementation, you might want to remove them from the group
                    print(f"User {user['id']} exceeded verification timeout")
                    
        except Exception as e:
            print(f"Error in unverified user cleanup job: {e}")
    
    def start(self):
        """Start the scheduler"""
        self.scheduler.start()
        print("🤖 Bot scheduler started successfully!")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        print("🤖 Bot scheduler stopped.")
    
    async def send_manual_reminder(self, chat_id: int, custom_message: str = None):
        """Send manual reminder"""
        try:
            if custom_message:
                reminder_text = custom_message
            else:
                reminder_text = Config.MESSAGES['reminder'].format(
                    zoom_link=Config.ZOOM_LINK
                )
            
            await self.bot.send_message(
                chat_id,
                reminder_text,
                parse_mode='Markdown'
            )
            return True
        except Exception as e:
            print(f"Error sending manual reminder: {e}")
            return False
    
    async def send_announcement(self, chat_id: int, announcement_text: str):
        """Send announcement to group"""
        try:
            formatted_announcement = f"📢 *إعلان مهم*\n\n{announcement_text}\n\n📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            
            await self.bot.send_message(
                chat_id,
                formatted_announcement,
                parse_mode='Markdown'
            )
            return True
        except Exception as e:
            print(f"Error sending announcement: {e}")
            return False

# Helper function to get verified users (needed for scheduler)
def get_verified_users():
    """Get all verified users from database"""
    # This would need to be implemented in the database module
    # For now, return empty list
    return []