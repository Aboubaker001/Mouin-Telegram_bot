"""
Handlers package for the Enhanced Telegram Bot
Registers all command and message handlers
"""

from aiogram import Dispatcher
from .commands import start, help, schedule


def register_handlers(dp: Dispatcher):
    """Register all handlers with the dispatcher"""
    
    # Register command routers
    dp.include_router(start.router)
    dp.include_router(help.router)
    dp.include_router(schedule.router)
    
    # Additional routers can be added here as they are created
    # dp.include_router(content.router)
    # dp.include_router(quiz.router)
    # dp.include_router(faq.router)
    # dp.include_router(stats.router)
    # dp.include_router(admin.router)