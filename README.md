# 🤖 Muin Al-Mujtahidin Telegram Bot

A modern, comprehensive Telegram bot for managing educational course groups with full Arabic language support. Built with Python and aiogram 3.x.

## 🌟 Features

### 🎯 Core Features
- **Full Arabic Language Support** - All commands, messages, and interfaces in Arabic
- **User Verification System** - Subscription code verification for new members
- **Admin Control Panel** - Comprehensive admin tools and statistics
- **Automated Scheduling** - Daily reminders and session notifications
- **Interactive Quizzes** - Multiple-choice quizzes with automatic scoring
- **Feedback Collection** - Session feedback with rating system
- **Content Management** - Easy access to course materials and resources

### 🔧 Admin Features
- **User Management** - Verify, mute, and manage users
- **Announcements** - Send custom announcements to the group
- **Statistics Dashboard** - View group engagement and attendance rates
- **Quiz Management** - Create and send interactive quizzes
- **Feedback Analysis** - Collect and analyze session feedback
- **Warning System** - Automatic warnings for rule violations

### 📚 Student Features
- **Course Schedule** - View weekly course schedule
- **Content Access** - Easy access to course materials
- **Attendance Tracking** - Mark attendance for sessions
- **FAQ System** - Quick answers to common questions
- **Session Reminders** - Automatic reminders before sessions

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- Telegram Bot Token (from @BotFather)
- Admin Telegram User IDs

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aboubaker001/Mouin-Telegram_bot.git
   cd Mouin-Telegram_bot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up your bot token and admin IDs**
   ```bash
   # In .env file:
   BOT_TOKEN=your_bot_token_here
   ADMIN_IDS=123456789,987654321
   ```

5. **Run the bot**
   ```bash
   python main.py
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Your Telegram bot token | Yes |
| `ADMIN_IDS` | Comma-separated list of admin user IDs | Yes |
| `ZOOM_LINK` | Zoom meeting link for sessions | Yes |
| `ZOOM_PASSWORD` | Zoom meeting password | Yes |
| `SUBSCRIPTION_CODES` | Comma-separated list of valid subscription codes | Yes |
| `QUIZ_SHEET_ID` | Google Sheets ID for quiz results (optional) | No |
| `FEEDBACK_SHEET_ID` | Google Sheets ID for feedback (optional) | No |

### Customization

Edit `config.py` to customize:
- Course name and description
- Weekly schedule
- Content links
- FAQ questions
- Quiz questions
- Message templates

## 📋 Commands

### 🎯 Basic Commands
- `/start` - Start the bot and register
- `/help` - Show available commands
- `/schedule` - View weekly course schedule
- `/content` - Access course materials
- `/faq` - View frequently asked questions
- `/attendance` - Mark attendance for current session

### 🔧 Admin Commands
- `/admin` - Access admin control panel
- `/publish` - Send announcement to group
- `/reminder` - Send manual session reminder
- `/stats` - View group statistics
- `/quiz` - Send interactive quiz
- `/feedback` - Collect session feedback

## 🏗️ Project Structure

```
├── main.py              # Main bot file
├── config.py            # Configuration settings
├── database.py          # Database operations
├── commands.py          # Command handlers
├── middleware.py        # Middleware for security and logging
├── scheduler.py         # Automated scheduling
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
├── README.md           # This file
└── data/               # Database and logs directory
    ├── bot_database.db # SQLite database
    └── bot.log         # Bot logs
```

## 🔒 Security Features

- **User Verification** - Subscription code verification
- **Admin Authentication** - Admin-only command access
- **Message Filtering** - Automatic spam and inappropriate content detection
- **Rate Limiting** - Prevent message flooding
- **Warning System** - Progressive warnings with automatic muting
- **Secure Configuration** - Environment variable-based configuration

## 📊 Database Schema

The bot uses SQLite with the following tables:
- `users` - User information and verification status
- `messages` - Message logging for statistics
- `attendance` - Session attendance records
- `quiz_results` - Quiz responses and scores
- `feedback` - Session feedback and ratings
- `faq` - Frequently asked questions
- `statistics` - Group statistics tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the FAQ section in the bot (`/faq`)

## 🔄 Updates

### Version 2.0 (Current)
- Complete rewrite in Python with aiogram 3.x
- Full Arabic language support
- Advanced admin features
- Interactive quizzes and feedback
- Automated scheduling
- Comprehensive security features

### Future Plans
- Web dashboard for admins
- Integration with Google Sheets API
- Multi-language support
- Advanced analytics
- Mobile app companion

## 🙏 Acknowledgments

- Built with [aiogram](https://github.com/aiogram/aiogram) framework
- Inspired by educational technology needs
- Developed for Arabic-speaking communities

---

**Made with ❤️ for educational excellence**
