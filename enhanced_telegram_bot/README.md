# 🤖 Enhanced Telegram Bot for Training Course Management

A modern, feature-rich Telegram bot for managing training course groups with full Arabic language support, built with **aiogram 3.x** and **Python 3.9+**.

## ✨ Features

### 🔐 User Management & Access Control
- **User Verification**: Subscription code verification for enrollment
- **Permission System**: Admin vs Student access levels
- **Warning & Muting System**: Automated behavior management
- **Activity Tracking**: User engagement monitoring

### 📚 Course Management
- **Arabic Commands**: Full Arabic language support for all commands
- **Schedule Display**: Weekly course schedule with countdown timers
- **Content Sharing**: Organized content delivery (PDFs, videos, links)
- **Live Session Integration**: Zoom link sharing with reminders

### 🤖 Automation & Scheduling
- **Automated Reminders**: Class reminders 1 hour before sessions
- **Daily Motivation**: Inspirational messages to keep students engaged
- **Weekly Statistics**: Automated progress reports
- **Custom Scheduling**: Admin-configurable reminder system

### 💬 Interactive Features
- **Smart FAQ System**: Automated responses to common questions
- **Quiz System**: 3-question quizzes with immediate feedback
- **Feedback Collection**: Session rating and feedback system
- **Inline Keyboards**: Modern, button-based interactions

### 📊 Analytics & Monitoring
- **User Statistics**: Member count and engagement tracking
- **Performance Metrics**: Attendance and participation rates
- **Admin Dashboard**: Comprehensive control interface

## 🏗️ Architecture

```
enhanced_telegram_bot/
├── main.py                 # Entry point
├── config/
│   ├── __init__.py
│   └── settings.py         # Configuration management
├── database/
│   ├── __init__.py
│   └── database.py         # SQLite database operations
├── handlers/
│   ├── __init__.py
│   └── commands/           # Command handlers
│       ├── start.py        # Welcome & verification
│       ├── help.py         # Help documentation
│       ├── schedule.py     # Course schedule
│       ├── content.py      # Content management
│       ├── quiz.py         # Quiz system
│       ├── faq.py          # FAQ system
│       ├── stats.py        # Statistics
│       └── admin.py        # Admin commands
├── middlewares/
│   ├── __init__.py
│   ├── auth.py             # Authentication & permissions
│   └── logging.py          # Request logging
├── scheduler/
│   ├── __init__.py
│   └── scheduler.py        # Automated scheduling
├── utils/
│   ├── __init__.py
│   ├── logger.py           # Logging configuration
│   └── helpers.py          # Utility functions
├── data/                   # Database and content storage
├── content/                # Course materials
├── uploads/                # User uploads
├── credentials/            # API credentials
├── requirements.txt        # Dependencies
├── .env.example           # Environment template
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.9 or higher
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Basic knowledge of Telegram bot administration

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/enhanced-telegram-bot.git
cd enhanced-telegram-bot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p data content uploads credentials
```

### 3. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env  # Or use your preferred editor
```

**Required Configuration:**
```env
BOT_TOKEN=your_telegram_bot_token_here
ADMIN_IDS=your_telegram_user_id
COURSE_NAME=أساسيات البرمجة
ZOOM_LINK=https://zoom.us/j/your-meeting-id
```

### 4. Launch

```bash
# Start the bot
python main.py
```

## 📋 Available Commands (Arabic)

### 🔰 Basic Commands
- `/ابدأ` `/start` - Welcome message and verification
- `/مساعدة` `/help` - Display help and command list

### 📚 Content & Learning
- `/المحتوى` - View course materials (PDFs, videos, links)
- `/الجدول` - Display weekly course schedule
- `/تذكير` - Enable/disable session reminders

### ❓ Support & Interaction
- `/أسئلة` - FAQ system with smart responses
- `/تقييم` - Session feedback and rating
- `/اختبار` - Quick 3-question quiz

### 📊 Statistics
- `/إحصائيات` - Group statistics and metrics

### 👨‍💼 Admin Commands
- `/نشر` - Post announcements to the group
- `/كتم` - Mute users for specified duration
- `/تحذير` - Issue warnings to users

## ⚙️ Configuration

### Course Schedule
Edit `config/settings.py` to customize the class schedule:

```python
CLASS_SCHEDULE = {
    "الاثنين": {
        "time": "20:00",
        "duration": 120,  # minutes
        "enabled": True
    },
    "الخميس": {
        "time": "20:00", 
        "duration": 120,
        "enabled": True
    }
}
```

### Verification Codes
Customize subscription codes in `.env`:
```env
SUBSCRIPTION_CODES=STUDENT2024,COURSE123,PROG101
```

### Reminder Schedule
Configure automated reminders:
```env
REMINDER_BEFORE_CLASS=60      # Minutes before class
DAILY_REMINDER_TIME=18:00     # Daily motivation time
TIMEZONE=Africa/Cairo         # Your timezone
```

## 🗄️ Database Schema

The bot uses SQLite with the following tables:
- **users**: User profiles and verification status
- **faq**: Frequently asked questions
- **quiz_questions**: Quiz question bank
- **quiz_results**: User quiz results
- **feedback**: Session feedback
- **statistics**: Usage metrics
- **content**: Course materials

## 🔧 Advanced Features

### Google Sheets Integration
For quiz results and feedback storage:

1. Create Google Sheets API credentials
2. Enable Google Sheets API in Google Cloud Console
3. Configure in `.env`:
```env
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEETS_ID=your_sheets_id
GOOGLE_CREDENTIALS_FILE=./credentials/google_credentials.json
```

### Custom Content Management
Add course materials to the `content/` directory and use the admin interface to register them in the database.

### Automated Scheduling
The bot includes sophisticated scheduling:
- **Class Reminders**: 1 hour before each session
- **Daily Motivation**: Configurable time
- **Weekly Stats**: Every Sunday at 6 PM
- **Custom Reminders**: Admin-scheduled messages

## 🛡️ Security Features

- **Token Protection**: Environment variable storage
- **File Type Validation**: Restricted upload types
- **Size Limits**: Configurable file size restrictions
- **Spam Protection**: Automatic warning system
- **User Verification**: Subscription code validation

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

## 📈 Monitoring & Logs

The bot includes comprehensive logging:
- **User Activity**: Command usage tracking
- **Error Handling**: Detailed error logs
- **Performance Metrics**: Response time monitoring
- **Security Events**: Authentication attempts

## 🚀 Deployment

### Local Development
```bash
python main.py
```

### Production Deployment

#### Using systemd (Linux)
1. Create service file: `/etc/systemd/system/telegram-bot.service`
```ini
[Unit]
Description=Enhanced Telegram Bot
After=network.target

[Service]
Type=simple
User=botuser
WorkingDirectory=/path/to/enhanced_telegram_bot
ExecStart=/path/to/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Enable and start:
```bash
sudo systemctl enable telegram-bot.service
sudo systemctl start telegram-bot.service
```

#### Using Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "main.py"]
```

#### Using Heroku
1. Create `Procfile`:
```
worker: python main.py
```

2. Deploy:
```bash
heroku create your-bot-name
git push heroku main
heroku ps:scale worker=1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Telegram support group
- **Email**: Contact the maintainers directly

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- Initial release with full Arabic support
- User verification system
- Automated scheduling
- Quiz and feedback systems
- Admin control interface
- SQLite database integration

## 🙏 Acknowledgments

- **aiogram**: Modern Telegram Bot framework
- **APScheduler**: Reliable task scheduling
- **Original Project**: Based on Mouin-Telegram_bot by @Aboubaker001

---

**⭐ Star this repository if you find it helpful!**

**🔧 Need customization? Open an issue or contact the maintainers.**