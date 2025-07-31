import sqlite3
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from config import Config

class Database:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or Config.DATABASE_PATH
        self._ensure_data_directory()
        self._create_tables()
    
    def _ensure_data_directory(self):
        """Ensure the data directory exists"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
    
    def _create_tables(self):
        """Create all necessary database tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    username TEXT,
                    first_name TEXT,
                    last_name TEXT,
                    is_verified BOOLEAN DEFAULT FALSE,
                    is_admin BOOLEAN DEFAULT FALSE,
                    warnings INTEGER DEFAULT 0,
                    is_muted BOOLEAN DEFAULT FALSE,
                    mute_until TIMESTAMP,
                    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Statistics table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS statistics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATE,
                    member_count INTEGER,
                    messages_count INTEGER,
                    commands_used INTEGER,
                    attendance_count INTEGER
                )
            ''')
            
            # Messages table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    message_text TEXT,
                    message_type TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Attendance table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    session_date DATE,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Quiz results table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS quiz_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    quiz_id TEXT,
                    score INTEGER,
                    total_questions INTEGER,
                    answers TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Feedback table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    session_date DATE,
                    rating INTEGER,
                    comment TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # FAQ table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS faq (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    question TEXT UNIQUE,
                    answer TEXT,
                    category TEXT DEFAULT 'general'
                )
            ''')
            
            # Initialize FAQ with default questions
            self._initialize_faq()
            
            conn.commit()
    
    def _initialize_faq(self):
        """Initialize FAQ table with default questions"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Check if FAQ table is empty
            cursor.execute("SELECT COUNT(*) FROM faq")
            if cursor.fetchone()[0] == 0:
                # Insert default FAQ questions
                default_faq = [
                    ("متى الجلسة القادمة؟", "الجلسة القادمة يوم الثلاثاء الساعة 8:00 مساءً. رابط الزوم: " + Config.ZOOM_LINK, "schedule"),
                    ("أين أجد المحتوى؟", "استخدم الأمر /المحتوى للوصول إلى جميع المواد التعليمية", "content"),
                    ("كيف أسجل حضوري؟", "استخدم الأمر /حضور لتسجيل حضورك في الجلسة", "attendance"),
                    ("متى تبدأ الدورة؟", "الدورة بدأت بالفعل! يمكنك الانضمام في أي وقت", "general"),
                    ("كيف أحصل على المساعدة؟", "استخدم الأمر /مساعدة لعرض جميع الأوامر المتاحة", "help")
                ]
                
                cursor.executemany(
                    "INSERT OR IGNORE INTO faq (question, answer, category) VALUES (?, ?, ?)",
                    default_faq
                )
                conn.commit()
    
    def register_user(self, user_data: Dict) -> bool:
        """Register a new user or update existing user"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check if user already exists
                cursor.execute("SELECT id FROM users WHERE id = ?", (user_data['id'],))
                if cursor.fetchone():
                    # Update existing user
                    cursor.execute('''
                        UPDATE users 
                        SET username = ?, first_name = ?, last_name = ?, last_activity = CURRENT_TIMESTAMP
                        WHERE id = ?
                    ''', (user_data['username'], user_data['first_name'], user_data['last_name'], user_data['id']))
                    return False  # User already existed
                else:
                    # Insert new user
                    cursor.execute('''
                        INSERT INTO users (id, username, first_name, last_name, is_admin)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        user_data['id'], 
                        user_data['username'], 
                        user_data['first_name'], 
                        user_data['last_name'],
                        user_data['id'] in Config.ADMIN_IDS
                    ))
                    return True  # New user registered
        except Exception as e:
            print(f"Error registering user: {e}")
            return False
    
    def verify_user(self, user_id: int, subscription_code: str) -> bool:
        """Verify user with subscription code"""
        if subscription_code in Config.SUBSCRIPTION_CODES:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE users SET is_verified = TRUE WHERE id = ?",
                    (user_id,)
                )
                conn.commit()
                return True
        return False
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        """Get user information"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            
            if row:
                columns = [description[0] for description in cursor.description]
                return dict(zip(columns, row))
            return None
    
    def is_admin(self, user_id: int) -> bool:
        """Check if user is admin"""
        user = self.get_user(user_id)
        return user and user['is_admin']
    
    def is_verified(self, user_id: int) -> bool:
        """Check if user is verified"""
        user = self.get_user(user_id)
        return user and user['is_verified']
    
    def add_warning(self, user_id: int) -> int:
        """Add warning to user and return current warning count"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET warnings = warnings + 1 WHERE id = ?",
                (user_id,)
            )
            cursor.execute("SELECT warnings FROM users WHERE id = ?", (user_id,))
            warnings = cursor.fetchone()[0]
            
            # Auto-mute if max warnings reached
            if warnings >= Config.MAX_WARNINGS:
                mute_until = datetime.now() + timedelta(seconds=Config.MUTE_DURATION)
                cursor.execute(
                    "UPDATE users SET is_muted = TRUE, mute_until = ? WHERE id = ?",
                    (mute_until, user_id)
                )
            
            conn.commit()
            return warnings
    
    def mute_user(self, user_id: int, duration_seconds: int = None) -> bool:
        """Mute user for specified duration"""
        duration = duration_seconds or Config.MUTE_DURATION
        mute_until = datetime.now() + timedelta(seconds=duration)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET is_muted = TRUE, mute_until = ? WHERE id = ?",
                (mute_until, user_id)
            )
            conn.commit()
            return True
    
    def unmute_user(self, user_id: int) -> bool:
        """Unmute user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET is_muted = FALSE, mute_until = NULL WHERE id = ?",
                (user_id,)
            )
            conn.commit()
            return True
    
    def is_muted(self, user_id: int) -> bool:
        """Check if user is currently muted"""
        user = self.get_user(user_id)
        if not user or not user['is_muted']:
            return False
        
        # Check if mute has expired
        if user['mute_until']:
            mute_until = datetime.fromisoformat(user['mute_until'])
            if datetime.now() > mute_until:
                self.unmute_user(user_id)
                return False
        
        return True
    
    def log_message(self, user_id: int, message_text: str, message_type: str = "text"):
        """Log user message for statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO messages (user_id, message_text, message_type)
                VALUES (?, ?, ?)
            ''', (user_id, message_text, message_type))
            conn.commit()
    
    def get_statistics(self) -> Dict:
        """Get group statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Total members
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_verified = TRUE")
            member_count = cursor.fetchone()[0]
            
            # Weekly messages
            week_ago = datetime.now() - timedelta(days=7)
            cursor.execute(
                "SELECT COUNT(*) FROM messages WHERE timestamp > ?",
                (week_ago,)
            )
            weekly_messages = cursor.fetchone()[0]
            
            # Attendance rate (last session)
            today = datetime.now().date()
            cursor.execute(
                "SELECT COUNT(*) FROM attendance WHERE session_date = ?",
                (today,)
            )
            today_attendance = cursor.fetchone()[0]
            
            attendance_rate = round((today_attendance / max(member_count, 1)) * 100, 1)
            
            return {
                'member_count': member_count,
                'weekly_messages': weekly_messages,
                'attendance_rate': attendance_rate
            }
    
    def record_attendance(self, user_id: int, session_date: str = None) -> bool:
        """Record user attendance"""
        if not session_date:
            session_date = datetime.now().date()
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR IGNORE INTO attendance (user_id, session_date)
                    VALUES (?, ?)
                ''', (user_id, session_date))
                conn.commit()
                return True
        except Exception as e:
            print(f"Error recording attendance: {e}")
            return False
    
    def get_faq(self, question: str = None) -> List[Dict]:
        """Get FAQ entries"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            if question:
                cursor.execute(
                    "SELECT question, answer FROM faq WHERE question LIKE ?",
                    (f"%{question}%",)
                )
            else:
                cursor.execute("SELECT question, answer FROM faq ORDER BY category, id")
            
            rows = cursor.fetchall()
            return [{'question': row[0], 'answer': row[1]} for row in rows]
    
    def add_faq(self, question: str, answer: str, category: str = "general") -> bool:
        """Add new FAQ entry"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT OR REPLACE INTO faq (question, answer, category) VALUES (?, ?, ?)",
                    (question, answer, category)
                )
                conn.commit()
                return True
        except Exception as e:
            print(f"Error adding FAQ: {e}")
            return False
    
    def save_quiz_result(self, user_id: int, quiz_id: str, score: int, 
                        total_questions: int, answers: str) -> bool:
        """Save quiz result"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, answers)
                    VALUES (?, ?, ?, ?, ?)
                ''', (user_id, quiz_id, score, total_questions, answers))
                conn.commit()
                return True
        except Exception as e:
            print(f"Error saving quiz result: {e}")
            return False
    
    def save_feedback(self, user_id: int, rating: int, comment: str = None) -> bool:
        """Save user feedback"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO feedback (user_id, session_date, rating, comment)
                    VALUES (?, ?, ?, ?)
                ''', (user_id, datetime.now().date(), rating, comment))
                conn.commit()
                return True
        except Exception as e:
            print(f"Error saving feedback: {e}")
            return False
    
    def get_unverified_users(self) -> List[Dict]:
        """Get list of unverified users"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, first_name, last_name, registered_at 
                FROM users 
                WHERE is_verified = FALSE
            ''')
            rows = cursor.fetchall()
            return [
                {
                    'id': row[0],
                    'username': row[1],
                    'first_name': row[2],
                    'last_name': row[3],
                    'registered_at': row[4]
                }
                for row in rows
            ]
    
    def get_verified_users(self) -> List[Dict]:
        """Get list of verified users"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, first_name, last_name 
                FROM users 
                WHERE is_verified = TRUE
            ''')
            rows = cursor.fetchall()
            return [
                {
                    'id': row[0],
                    'username': row[1],
                    'first_name': row[2],
                    'last_name': row[3]
                }
                for row in rows
            ]

# Global database instance
db = Database()