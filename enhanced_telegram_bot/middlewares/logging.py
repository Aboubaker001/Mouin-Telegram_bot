"""
Logging middleware for the Enhanced Telegram Bot
Tracks user interactions and system events
"""

import logging
from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery, Update

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseMiddleware):
    """Middleware for logging user interactions"""
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        user = event.from_user
        
        if isinstance(event, Message):
            if event.text:
                # Log command usage
                if event.text.startswith('/'):
                    command = event.text.split()[0]
                    logger.info(f"👤 User {user.id} ({user.first_name}) used command: {command}")
                else:
                    logger.debug(f"📝 User {user.id} sent message: {event.text[:50]}...")
            elif event.document:
                logger.info(f"📎 User {user.id} sent document: {event.document.file_name}")
            elif event.photo:
                logger.info(f"🖼️ User {user.id} sent photo")
                
        elif isinstance(event, CallbackQuery):
            logger.info(f"🔘 User {user.id} clicked button: {event.data}")
        
        try:
            result = await handler(event, data)
            return result
        except Exception as e:
            logger.error(f"❌ Error handling update from user {user.id}: {e}")
            raise