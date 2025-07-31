from typing import Any, Awaitable, Callable, Dict
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery
from database import db
from config import Config
import re

class UserVerificationMiddleware(BaseMiddleware):
    """Middleware to check user verification status"""
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        # Get user ID from event
        user_id = event.from_user.id if event.from_user else None
        
        if user_id:
            # Check if user is muted
            if db.is_muted(user_id):
                if isinstance(event, Message):
                    await event.reply("🔇 أنت محظور مؤقتاً من إرسال الرسائل.")
                elif isinstance(event, CallbackQuery):
                    await event.answer("🔇 أنت محظور مؤقتاً من استخدام البوت.", show_alert=True)
                return
            
            # Log message for statistics
            if isinstance(event, Message) and event.text:
                db.log_message(user_id, event.text, "text")
        
        return await handler(event, data)

class AdminCheckMiddleware(BaseMiddleware):
    """Middleware to check admin permissions"""
    
    def __init__(self, admin_commands: list = None):
        super().__init__()
        self.admin_commands = admin_commands or [
            'publish', 'reminder', 'stats', 'quiz', 'admin'
        ]
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        if isinstance(event, Message) and event.text:
            # Check if command requires admin privileges
            for command in self.admin_commands:
                if event.text.startswith(f'/{command}'):
                    if not db.is_admin(event.from_user.id):
                        await event.reply("❌ هذا الأمر متاح للمشرفين فقط.")
                        return
                    break
        
        return await handler(event, data)

class MessageFilterMiddleware(BaseMiddleware):
    """Middleware to filter inappropriate messages"""
    
    def __init__(self):
        super().__init__()
        # Patterns to detect spam or inappropriate content
        self.spam_patterns = [
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',
            r'@\w+',  # Username mentions
            r'#\w+',  # Hashtags
            r'(?i)(buy|sell|money|cash|earn|profit|investment|bitcoin|crypto)',
            r'(?i)(porn|sex|adult|xxx)',
            r'(?i)(hack|crack|free|download|torrent)',
        ]
        
        # Compile patterns for efficiency
        self.compiled_patterns = [re.compile(pattern) for pattern in self.spam_patterns]
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        if isinstance(event, Message) and event.text:
            # Skip commands
            if event.text.startswith('/'):
                return await handler(event, data)
            
            # Check for spam patterns
            for pattern in self.compiled_patterns:
                if pattern.search(event.text):
                    user_id = event.from_user.id
                    warnings = db.add_warning(user_id)
                    
                    warning_message = f"⚠️ تحذير {warnings}/{Config.MAX_WARNINGS}: لا يُسمح بإرسال هذا النوع من المحتوى."
                    
                    if warnings >= Config.MAX_WARNINGS:
                        warning_message += "\n🔇 تم حظرك مؤقتاً من المجموعة."
                    
                    await event.reply(warning_message)
                    
                    # Delete the inappropriate message if possible
                    try:
                        await event.delete()
                    except:
                        pass  # Can't delete message in some cases
                    
                    return
        
        return await handler(event, data)

class RateLimitMiddleware(BaseMiddleware):
    """Middleware to implement rate limiting"""
    
    def __init__(self, max_messages_per_minute: int = 10):
        super().__init__()
        self.max_messages_per_minute = max_messages_per_minute
        self.user_message_counts = {}
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        if isinstance(event, Message) and event.from_user:
            user_id = event.from_user.id
            current_time = event.date.timestamp()
            
            # Initialize user message tracking
            if user_id not in self.user_message_counts:
                self.user_message_counts[user_id] = []
            
            # Remove old messages (older than 1 minute)
            self.user_message_counts[user_id] = [
                timestamp for timestamp in self.user_message_counts[user_id]
                if current_time - timestamp < 60
            ]
            
            # Check rate limit
            if len(self.user_message_counts[user_id]) >= self.max_messages_per_minute:
                await event.reply("⚠️ أنت ترسل رسائل كثيرة جداً. الرجاء الانتظار قليلاً.")
                return
            
            # Add current message timestamp
            self.user_message_counts[user_id].append(current_time)
        
        return await handler(event, data)

class LoggingMiddleware(BaseMiddleware):
    """Middleware for logging bot activities"""
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        # Log the event
        if isinstance(event, Message):
            user_info = f"User {event.from_user.id} (@{event.from_user.username})"
            if event.text:
                print(f"📝 {user_info}: {event.text[:50]}...")
            elif event.photo:
                print(f"📷 {user_info}: sent photo")
            elif event.document:
                print(f"📄 {user_info}: sent document")
        elif isinstance(event, CallbackQuery):
            user_info = f"User {event.from_user.id} (@{event.from_user.username})"
            print(f"🔘 {user_info}: callback {event.data}")
        
        # Execute handler
        result = await handler(event, data)
        
        # Log success
        print(f"✅ Handler executed successfully for {type(event).__name__}")
        
        return result

class ErrorHandlingMiddleware(BaseMiddleware):
    """Middleware for handling errors gracefully"""
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        try:
            return await handler(event, data)
        except Exception as e:
            print(f"❌ Error in handler: {e}")
            
            # Send user-friendly error message
            if isinstance(event, Message):
                await event.reply("❌ حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى لاحقاً.")
            elif isinstance(event, CallbackQuery):
                await event.answer("❌ حدث خطأ غير متوقع.", show_alert=True)
            
            return None