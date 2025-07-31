"""
Authentication middleware for the Enhanced Telegram Bot
Handles user verification and permission checking
"""

import logging
from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery
from aiogram.exceptions import TelegramBadRequest

from config.settings import settings
from database.database import get_user, create_user, is_user_muted, update_user_activity

logger = logging.getLogger(__name__)


class AuthMiddleware(BaseMiddleware):
    """Middleware for handling user authentication and permissions"""
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        user = event.from_user
        
        if not user:
            return await handler(event, data)
        
        # Update user activity
        await update_user_activity(user.id)
        
        # Check if user is muted
        if await is_user_muted(user.id):
            if isinstance(event, Message):
                try:
                    await event.delete()
                    return  # Don't process the message
                except TelegramBadRequest:
                    pass  # Can't delete message, continue processing
        
        # Get user from database
        db_user = await get_user(user.id)
        
        # Create user if doesn't exist
        if not db_user:
            username = user.username or "مستخدم جديد"
            first_name = user.first_name or ""
            last_name = user.last_name or ""
            
            await create_user(user.id, username, first_name, last_name)
            db_user = await get_user(user.id)
        
        # Add user info to handler data
        data['db_user'] = db_user
        data['is_admin'] = user.id in settings.ADMIN_IDS or (db_user and db_user.get('is_admin', False))
        data['is_verified'] = db_user and db_user.get('is_verified', False)
        
        # Check if verification is required for this command
        if isinstance(event, Message) and event.text:
            command = event.text.split()[0].lower()
            
            # Commands that don't require verification
            public_commands = ['/start', '/ابدأ', '/verify', '/تحقق']
            
            if (settings.VERIFICATION_REQUIRED and 
                not data['is_verified'] and 
                not data['is_admin'] and
                command not in public_commands):
                
                await event.answer(
                    "🔐 يجب التحقق من اشتراكك أولاً!\n"
                    "استخدم الأمر /start لبدء عملية التحقق.",
                    show_alert=True if isinstance(event, CallbackQuery) else False
                )
                return
        
        return await handler(event, data)


async def admin_required(message: Message | CallbackQuery, db_user: dict, is_admin: bool) -> bool:
    """Check if user has admin permissions"""
    if not is_admin:
        text = settings.UNAUTHORIZED_MESSAGE
        if isinstance(message, CallbackQuery):
            await message.answer(text, show_alert=True)
        else:
            await message.answer(text)
        return False
    return True


async def verified_required(message: Message | CallbackQuery, is_verified: bool) -> bool:
    """Check if user is verified"""
    if not is_verified:
        text = "🔐 يجب التحقق من اشتراكك أولاً! استخدم /start"
        if isinstance(message, CallbackQuery):
            await message.answer(text, show_alert=True)
        else:
            await message.answer(text)
        return False
    return True