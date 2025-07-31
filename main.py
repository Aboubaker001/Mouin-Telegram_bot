import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.enums import ParseMode
from config import Config
from database import db
from commands import router as commands_router
from verification import router as verification_router
from middleware import (
    UserVerificationMiddleware,
    AdminCheckMiddleware,
    MessageFilterMiddleware,
    RateLimitMiddleware,
    LoggingMiddleware,
    ErrorHandlingMiddleware
)
from scheduler import BotScheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class CourseBot:
    def __init__(self):
        self.bot = Bot(token=Config.BOT_TOKEN, parse_mode=ParseMode.MARKDOWN)
        self.dp = Dispatcher(storage=MemoryStorage())
        self.scheduler = BotScheduler(self.bot)
        
        # Setup middleware
        self._setup_middleware()
        
        # Setup routers
        self._setup_routers()
        
        # Setup handlers
        self._setup_handlers()
    
    def _setup_middleware(self):
        """Setup all middleware"""
        # Order matters - middleware are executed in reverse order
        self.dp.message.middleware(ErrorHandlingMiddleware())
        self.dp.callback_query.middleware(ErrorHandlingMiddleware())
        
        self.dp.message.middleware(LoggingMiddleware())
        self.dp.callback_query.middleware(LoggingMiddleware())
        
        self.dp.message.middleware(RateLimitMiddleware(max_messages_per_minute=10))
        
        self.dp.message.middleware(MessageFilterMiddleware())
        
        self.dp.message.middleware(AdminCheckMiddleware())
        
        self.dp.message.middleware(UserVerificationMiddleware())
        self.dp.callback_query.middleware(UserVerificationMiddleware())
    
    def _setup_routers(self):
        """Setup command routers"""
        self.dp.include_router(commands_router)
        self.dp.include_router(verification_router)
    
    def _setup_handlers(self):
        """Setup additional handlers"""
        
        @self.dp.message()
        async def handle_unknown_commands(message):
            """Handle unknown commands and messages"""
            if message.text and message.text.startswith('/'):
                await message.reply(Config.MESSAGES['error'])
            else:
                # Handle regular messages (already handled by commands router)
                pass
        
        @self.dp.startup()
        async def on_startup():
            """Actions to perform on bot startup"""
            logger.info("🤖 Bot starting up...")
            
            # Start scheduler
            self.scheduler.start()
            
            # Send startup notification to admins
            for admin_id in Config.ADMIN_IDS:
                try:
                    await self.bot.send_message(
                        admin_id,
                        "🚀 البوت يعمل الآن!\n\n📊 يمكنك استخدام /admin للوصول إلى لوحة التحكم."
                    )
                except Exception as e:
                    logger.error(f"Failed to send startup notification to admin {admin_id}: {e}")
            
            logger.info("✅ Bot started successfully!")
        
        @self.dp.shutdown()
        async def on_shutdown():
            """Actions to perform on bot shutdown"""
            logger.info("🛑 Bot shutting down...")
            
            # Stop scheduler
            self.scheduler.stop()
            
            # Send shutdown notification to admins
            for admin_id in Config.ADMIN_IDS:
                try:
                    await self.bot.send_message(
                        admin_id,
                        "🛑 البوت متوقف الآن."
                    )
                except Exception as e:
                    logger.error(f"Failed to send shutdown notification to admin {admin_id}: {e}")
            
            logger.info("✅ Bot stopped successfully!")
    
    async def start(self):
        """Start the bot"""
        try:
            logger.info("Starting bot...")
            await self.dp.start_polling(self.bot)
        except Exception as e:
            logger.error(f"Error starting bot: {e}")
            raise
    
    async def stop(self):
        """Stop the bot"""
        try:
            logger.info("Stopping bot...")
            await self.bot.session.close()
        except Exception as e:
            logger.error(f"Error stopping bot: {e}")

async def main():
    """Main function"""
    bot = CourseBot()
    
    try:
        await bot.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        await bot.stop()

if __name__ == "__main__":
    # Check if bot token is configured
    if not Config.BOT_TOKEN:
        logger.error("❌ BOT_TOKEN not found in environment variables!")
        logger.error("Please set BOT_TOKEN in your .env file")
        exit(1)
    
    # Check if admin IDs are configured
    if not Config.ADMIN_IDS:
        logger.warning("⚠️ No admin IDs configured. Admin features will not work.")
    
    # Run the bot
    asyncio.run(main())