"""
Database management for the Enhanced Telegram Bot
SQLite database with async support using aiosqlite
"""

import aiosqlite
import logging
from datetime import datetime
from typing import List, Dict, Optional, Any
from pathlib import Path

from config.settings import settings

logger = logging.getLogger(__name__)

# Database file path
DB_PATH = Path("data/bot_database.db")


async def init_database():
    """Initialize the database and create tables"""
    # Ensure data directory exists
    DB_PATH.parent.mkdir(exist_ok=True)
    
    async with aiosqlite.connect(DB_PATH) as db:
        # Users table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                is_admin BOOLEAN DEFAULT FALSE,
                verification_code TEXT,
                warnings INTEGER DEFAULT 0,
                is_muted BOOLEAN DEFAULT FALSE,
                mute_until TIMESTAMP,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # FAQ table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS faq (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT UNIQUE NOT NULL,
                answer TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Quiz questions table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS quiz_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                explanation TEXT,
                difficulty TEXT DEFAULT 'متوسط',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Quiz results table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS quiz_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                question_id INTEGER,
                user_answer TEXT,
                is_correct BOOLEAN,
                answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                FOREIGN KEY (question_id) REFERENCES quiz_questions (id)
            )
        """)
        
        # Feedback table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                session_date TEXT,
                rating TEXT,
                comment TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        """)
        
        # Statistics table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value INTEGER,
                date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Content table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                content_type TEXT NOT NULL,
                file_path TEXT,
                url TEXT,
                category TEXT DEFAULT 'عام',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await db.commit()
        logger.info("✅ تم إنشاء قاعدة البيانات وجداولها بنجاح")
        
        # Insert default FAQ if table is empty
        await insert_default_faq(db)
        
        # Insert sample quiz questions if table is empty
        await insert_sample_quiz_questions(db)


async def insert_default_faq(db: aiosqlite.Connection):
    """Insert default FAQ entries"""
    cursor = await db.execute("SELECT COUNT(*) FROM faq")
    count = (await cursor.fetchone())[0]
    
    if count == 0:
        for question, answer in settings.DEFAULT_FAQ.items():
            await db.execute(
                "INSERT INTO faq (question, answer) VALUES (?, ?)",
                (question, answer)
            )
        await db.commit()
        logger.info("✅ تم إدراج الأسئلة الشائعة الافتراضية")


async def insert_sample_quiz_questions(db: aiosqlite.Connection):
    """Insert sample quiz questions"""
    cursor = await db.execute("SELECT COUNT(*) FROM quiz_questions")
    count = (await cursor.fetchone())[0]
    
    if count == 0:
        sample_questions = [
            {
                "question": "ما هو المتغير في البرمجة؟",
                "option_a": "مكان لتخزين البيانات",
                "option_b": "نوع من الدوال",
                "option_c": "لغة برمجة",
                "correct_answer": "A",
                "explanation": "المتغير هو مكان في الذاكرة يستخدم لتخزين البيانات"
            },
            {
                "question": "أي من التالي يعتبر لغة برمجة؟",
                "option_a": "HTML",
                "option_b": "Python",
                "option_c": "CSS",
                "correct_answer": "B",
                "explanation": "Python هي لغة برمجة، بينما HTML و CSS هما لغات توصيف"
            },
            {
                "question": "ما هو الغرض من التعليقات في الكود؟",
                "option_a": "تشغيل البرنامج",
                "option_b": "توضيح الكود للمطورين",
                "option_c": "إنشاء المتغيرات",
                "correct_answer": "B",
                "explanation": "التعليقات تستخدم لتوضيح الكود وشرحه للمطورين"
            }
        ]
        
        for q in sample_questions:
            await db.execute("""
                INSERT INTO quiz_questions 
                (question, option_a, option_b, option_c, correct_answer, explanation)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (q["question"], q["option_a"], q["option_b"], q["option_c"], 
                  q["correct_answer"], q["explanation"]))
        
        await db.commit()
        logger.info("✅ تم إدراج أسئلة الاختبار التجريبية")


# User management functions
async def get_user(user_id: int) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM users WHERE user_id = ?", (user_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None


async def create_user(user_id: int, username: str, first_name: str, last_name: str = "") -> bool:
    """Create a new user"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                INSERT INTO users (user_id, username, first_name, last_name)
                VALUES (?, ?, ?, ?)
            """, (user_id, username, first_name, last_name))
            await db.commit()
            return True
    except aiosqlite.IntegrityError:
        return False  # User already exists


async def verify_user(user_id: int, verification_code: str) -> bool:
    """Verify user with subscription code"""
    if verification_code in settings.SUBSCRIPTION_CODES:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                UPDATE users SET is_verified = TRUE, verification_code = ?
                WHERE user_id = ?
            """, (verification_code, user_id))
            await db.commit()
            return True
    return False


async def update_user_activity(user_id: int):
    """Update user's last activity timestamp"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            UPDATE users SET last_activity = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """, (user_id,))
        await db.commit()


async def add_user_warning(user_id: int) -> int:
    """Add warning to user and return new warning count"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            UPDATE users SET warnings = warnings + 1
            WHERE user_id = ?
        """, (user_id,))
        
        cursor = await db.execute(
            "SELECT warnings FROM users WHERE user_id = ?", (user_id,)
        )
        warnings = (await cursor.fetchone())[0]
        await db.commit()
        return warnings


async def mute_user(user_id: int, duration_seconds: int):
    """Mute user for specified duration"""
    mute_until = datetime.now().timestamp() + duration_seconds
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            UPDATE users SET is_muted = TRUE, mute_until = ?
            WHERE user_id = ?
        """, (mute_until, user_id))
        await db.commit()


async def unmute_user(user_id: int):
    """Unmute user"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            UPDATE users SET is_muted = FALSE, mute_until = NULL
            WHERE user_id = ?
        """, (user_id,))
        await db.commit()


async def is_user_muted(user_id: int) -> bool:
    """Check if user is currently muted"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("""
            SELECT is_muted, mute_until FROM users WHERE user_id = ?
        """, (user_id,))
        row = await cursor.fetchone()
        
        if not row or not row[0]:  # Not muted
            return False
            
        if row[1] and datetime.now().timestamp() > row[1]:  # Mute expired
            await unmute_user(user_id)
            return False
            
        return True


# FAQ functions
async def get_faq_answer(question: str) -> Optional[str]:
    """Get FAQ answer by question"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("""
            SELECT answer FROM faq 
            WHERE question LIKE ? OR answer LIKE ?
        """, (f"%{question}%", f"%{question}%"))
        row = await cursor.fetchone()
        return row[0] if row else None


async def get_all_faq() -> List[Dict[str, Any]]:
    """Get all FAQ entries"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM faq ORDER BY question")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def add_faq(question: str, answer: str) -> bool:
    """Add new FAQ entry"""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                INSERT INTO faq (question, answer) VALUES (?, ?)
            """, (question, answer))
            await db.commit()
            return True
    except aiosqlite.IntegrityError:
        return False


# Quiz functions
async def get_random_quiz_questions(count: int = 3) -> List[Dict[str, Any]]:
    """Get random quiz questions"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT * FROM quiz_questions ORDER BY RANDOM() LIMIT ?
        """, (count,))
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def save_quiz_result(user_id: int, question_id: int, user_answer: str, is_correct: bool):
    """Save quiz result"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO quiz_results (user_id, question_id, user_answer, is_correct)
            VALUES (?, ?, ?, ?)
        """, (user_id, question_id, user_answer, is_correct))
        await db.commit()


# Statistics functions
async def get_user_count() -> int:
    """Get total verified user count"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM users WHERE is_verified = TRUE")
        return (await cursor.fetchone())[0]


async def get_weekly_engagement() -> int:
    """Get weekly message engagement (placeholder - would need message tracking)"""
    # This would require message tracking implementation
    return 0


async def save_feedback(user_id: int, session_date: str, rating: str, comment: str = ""):
    """Save session feedback"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO feedback (user_id, session_date, rating, comment)
            VALUES (?, ?, ?, ?)
        """, (user_id, session_date, rating, comment))
        await db.commit()


# Content management functions
async def add_content(title: str, description: str, content_type: str, 
                     file_path: str = None, url: str = None, category: str = "عام") -> int:
    """Add new content"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("""
            INSERT INTO content (title, description, content_type, file_path, url, category)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (title, description, content_type, file_path, url, category))
        await db.commit()
        return cursor.lastrowid


async def get_content_by_category(category: str = None) -> List[Dict[str, Any]]:
    """Get content by category"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        if category:
            cursor = await db.execute("""
                SELECT * FROM content WHERE category = ? AND is_active = TRUE
                ORDER BY created_at DESC
            """, (category,))
        else:
            cursor = await db.execute("""
                SELECT * FROM content WHERE is_active = TRUE
                ORDER BY category, created_at DESC
            """)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]