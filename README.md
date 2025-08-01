# 🤖 Muin Al-Mujtahidin Course Management Bot

A modern, comprehensive Telegram bot for managing educational courses with full Arabic language support. This bot provides an engaging and efficient platform for course administration, student engagement, and automated course management.

## ✨ Features

### 🎓 Course Management
- **User Verification System**: Secure enrollment with subscription codes
- **Interactive Schedule**: Weekly session schedules with Zoom integration
- **Content Management**: Organized educational materials (PDFs, videos, links)
- **Automated Reminders**: Smart session reminders and notifications

### 👥 User Management
- **Role-based Access**: Admin and student permissions
- **Warning System**: Automated behavior monitoring and moderation
- **User Statistics**: Personal and group engagement tracking
- **Activity Monitoring**: Real-time user activity and engagement metrics

### 📚 Educational Features
- **Interactive Quizzes**: Multiple-choice questions with instant feedback
- **FAQ System**: Dynamic frequently asked questions with smart responses
- **Content Categories**: Organized materials by type (PDF, video, link, image)
- **Progress Tracking**: Individual and group learning progress

### 🔧 Admin Tools
- **Announcement System**: Rich announcement publishing with pinning
- **Statistics Dashboard**: Comprehensive analytics and reporting
- **User Management**: Ban/unban, warnings, and user monitoring
- **Automated Reports**: Weekly statistics and engagement reports

### 🎨 User Experience
- **Arabic Language Support**: Full Arabic interface and commands
- **Interactive Buttons**: Inline keyboards for easy navigation
- **Visual Design**: Emojis and formatted messages for better UX
- **Responsive Interface**: Adaptive design for different screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Basic knowledge of Telegram bot setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aboubaker001/Mouin-Telegram_bot.git
   cd Mouin-Telegram_bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   TIMEZONE=Africa/Cairo
   ```

4. **Customize configuration**
   Edit `config.js` to match your course settings:
   - Course information
   - Schedule and session times
   - Zoom meeting details
   - Admin user IDs
   - Content materials

5. **Start the bot**
   ```bash
   npm start
   ```

## 📋 Configuration

### Course Settings (`config.js`)

```javascript
export const config = {
  course: {
    name: "أساسيات البرمجة",
    description: "دورة تعليمية شاملة في أساسيات البرمجة للمبتدئين",
    instructor: "أستاذ البرمجة",
    duration: "12 أسبوع",
    level: "مبتدئ"
  },
  
  schedule: {
    sessions: [
      {
        day: "الثلاثاء",
        time: "20:00",
        timezone: "Africa/Cairo",
        duration: "90 دقيقة",
        type: "محاضرة"
      }
    ],
    reminderTime: "60", // minutes before session
    timezone: "Africa/Cairo"
  },
  
  zoom: {
    fullLink: "https://zoom.us/j/123456789?pwd=123456"
  }
};
```

### Admin Setup

1. **Add admin users** in `config.js`:
   ```javascript
   admin: {
     userIds: [123456789, 987654321], // Add admin Telegram user IDs
     groupId: "-1001234567890", // Main group ID
     supportChannel: "@course_support"
   }
   ```

2. **Set subscription code**:
   ```javascript
   users: {
     subscriptionCode: "COURSE2024" // Students need this to join
   }
   ```

## 📖 Commands Reference

### 👋 Basic Commands
- `/ابدأ` - Start bot and register
- `/تحقق [رمز]` - Verify identity with subscription code
- `/مساعدة` - Show help menu
- `/معلوماتي` - Display user information

### 📅 Schedule & Reminders
- `/الجدول` - Show weekly schedule
- `/تذكير` - Manage session reminders
- `/الجلسة_القادمة` - Next session information

### 📚 Content Management
- `/المحتوى` - Access course materials
- `/ملفات` - View PDF files
- `/فيديوهات` - Watch educational videos

### ❓ Help & Support
- `/أسئلة` - Frequently asked questions
- `/اختبار` - Take interactive quiz
- `/تقييم` - Session feedback

### 📊 Statistics (Students)
- `/إحصائياتي` - Personal statistics
- `/نشاطي` - Activity history

### 🔧 Admin Commands
- `/نشر` - Publish announcements
- `/إحصائيات` - Group statistics
- `/حظر` - Ban user
- `/إلغاء_حظر` - Unban user

## 🏗️ Architecture

```
bot/
├── commands/          # Command handlers
│   ├── start.js      # User registration
│   ├── verify.js     # Identity verification
│   ├── schedule.js   # Schedule management
│   ├── content.js    # Content delivery
│   ├── quiz.js       # Interactive quizzes
│   ├── stats.js      # Statistics and analytics
│   ├── publish.js    # Admin announcements
│   └── reminder.js   # Reminder management
├── handlers/          # Event handlers
│   ├── messageHandler.js    # Message processing
│   └── callbackHandler.js   # Button interactions
├── services/          # Business logic
│   ├── userService.js       # User management
│   └── assignmentService.js # Assignment handling
├── scheduler/         # Automated tasks
│   └── reminderScheduler.js # Session reminders
├── utils/             # Utilities
│   ├── database.js    # Data persistence
│   └── dateFormatter.js # Date utilities
└── helpers/           # Helper functions
    └── messages.js    # Message templates
```

## 🔐 Security Features

- **User Verification**: Subscription code requirement
- **Role-based Access**: Admin and student permissions
- **Content Filtering**: Spam and inappropriate content detection
- **Rate Limiting**: Protection against abuse
- **Secure Storage**: Environment variable protection

## 📊 Analytics & Reporting

### Weekly Reports
- Member growth statistics
- Engagement metrics
- Attendance tracking
- Content usage analytics

### Real-time Monitoring
- Active user tracking
- Message activity
- Quiz performance
- User behavior patterns

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

1. **Using PM2**:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "course-bot"
   pm2 startup
   pm2 save
   ```

2. **Using Docker**:
   ```bash
   docker build -t course-bot .
   docker run -d --name course-bot course-bot
   ```

3. **Using Heroku**:
   ```bash
   heroku create your-course-bot
   heroku config:set BOT_TOKEN=your_token
   git push heroku main
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/Aboubaker001/Mouin-Telegram_bot/wiki)
- **Issues**: [GitHub Issues](https://github.com/Aboubaker001/Mouin-Telegram_bot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Aboubaker001/Mouin-Telegram_bot/discussions)
- **Email**: support@course-bot.com

## 🙏 Acknowledgments

- [Telegraf](https://telegraf.js.org/) - Modern Telegram Bot API framework
- [date-fns](https://date-fns.org/) - Date utility library
- [node-cron](https://github.com/node-cron/node-cron) - Cron job scheduling
- Telegram Bot API for providing the platform

## 📈 Roadmap

- [ ] Google Sheets integration for data export
- [ ] Multi-language support (English/French)
- [ ] Advanced analytics dashboard
- [ ] Mobile app companion
- [ ] Integration with LMS platforms
- [ ] AI-powered content recommendations
- [ ] Video conferencing integration
- [ ] Payment processing for premium features

---

**Made with ❤️ for Arabic-speaking educational communities**
