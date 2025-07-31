#!/usr/bin/env python3
"""
Enhanced Telegram Bot for Training Course Management
Main entry point for the bot application
"""

import asyncio
import logging
import sys
from pathlib import Path

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config.settings import settings
from database.database import init_database
from handlers import register_handlers
from middlewares.auth import AuthMiddleware
from middlewares.logging import LoggingMiddleware
from scheduler.scheduler import start_scheduler
from utils.logger import setup_logger


async def main():
    """Main function to start the bot"""
    # Setup logging
    setup_logger()
    logger = logging.getLogger(__name__)
    
    # Initialize bot with default properties
    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    
    # Initialize dispatcher
    dp = Dispatcher()
    
    # Setup middlewares
    dp.message.middleware(LoggingMiddleware())
    dp.callback_query.middleware(LoggingMiddleware())
    dp.message.middleware(AuthMiddleware())
    dp.callback_query.middleware(AuthMiddleware())
    
    # Register handlers
    register_handlers(dp)
    
    # Initialize database
    await init_database()
    
    # Start scheduler
    start_scheduler(bot)
    
    logger.info("🤖 بوت إدارة دورة البرمجة يبدأ التشغيل...")
    logger.info(f"📚 اسم الدورة: {settings.COURSE_NAME}")
    
    try:
        # Start polling
        await dp.start_polling(bot)
    except Exception as e:
        logger.error(f"❌ خطأ في تشغيل البوت: {e}")
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("👋 تم إيقاف البوت بنجاح")
        sys.exit(0)