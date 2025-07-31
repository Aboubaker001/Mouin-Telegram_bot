# 🚀 Setup Guide - Muin Al-Mujtahidin Bot

## 🔧 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 3. Required Environment Variables
```env
# Get this from @BotFather on Telegram
BOT_TOKEN=your_real_bot_token_here

# Set timezone (default: Africa/Cairo)
TIMEZONE=Africa/Cairo

# Add admin user IDs (comma separated)
ADMIN_IDS=123456789,987654321

# Bot configuration
BOT_NAME=Muin Al-Mujtahidin Bot
LOG_LEVEL=info
```

### 4. Get Admin User ID
Send any message to your bot and check the logs, or:
1. Start the bot: `npm start`
2. Send `/start` to your bot
3. Check console logs for user ID
4. Add that ID to `ADMIN_IDS` in `.env`
5. Restart the bot

### 5. Start the Bot
```bash
npm start
```

## 🔐 Security Features Implemented

### Admin-Only Commands
- ✅ `/add` - Only admins can add assignments
- ✅ `/remove` - Only admins can remove assignments  
- ✅ `/stats` - System statistics for admins
- ✅ `/admin_info` - Admin management information

### Security Checks
- ✅ Real-time admin verification
- ✅ Session state security (admin privileges checked during conversations)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (using JSON storage)
- ✅ Comprehensive error handling
- ✅ Action logging for audit trails

### Access Control
- ✅ Role-based command access
- ✅ User ID verification
- ✅ Admin privilege escalation protection
- ✅ Conversation state security

## 🌟 Enhanced Features

### 1. **Advanced Assignment Management**
```
Admin Features:
- Multi-format date support (2025-08-04, 2025-08-04 21:30, ISO format)
- Input validation (title length, date validation, type checking)
- Past date prevention
- Confirmation dialogs for deletion
- Assignment status tracking
```

### 2. **Intelligent Conversation Flow**
```
User Experience:
- Interactive assignment creation
- Smart format detection
- Context-aware responses
- Automatic state management
- Conversation timeouts (5 minutes)
```

### 3. **Comprehensive Logging**
```
Log Types:
- User actions
- Admin actions  
- Security events
- Error tracking
- System statistics
```

### 4. **Enhanced Commands**

#### For Everyone:
- `/start` - Register and get welcome message
- `/view` - View active assignments
- `/done [ID]` - Mark assignment as completed
- `/help` - Dynamic help based on user role
- `/userinfo` - User information
- `/cancel` - Exit current operation

#### For Admins Only:
- `/add` - Add new assignment (interactive or direct)
- `/remove [ID]` - Remove assignment (with confirmation)
- `/confirm_remove [ID]` - Confirm assignment deletion
- `/stats` - System statistics and metrics
- `/admin_info` - Admin management information

## 📊 Command Examples

### Adding Assignments (Admin Only)
```
Method 1 - Interactive:
User: /add
Bot: Asks for assignment details
User: واجب الرياضيات | واجب | 2025-12-31 23:59
Bot: ✅ Assignment added successfully

Method 2 - Direct:
User: /add مشاهدة درس أدب الطلب | درس | 2025-08-04 21:30
Bot: ✅ Assignment added successfully

Method 3 - Smart Detection:
User: كتابة تأمل | تأمل | 2025-08-05
Bot: Detects format and suggests using /add command
```

### Assignment Types Supported
- واجب (Assignment)
- درس (Lesson)
- تأمل (Reflection)
- بحث (Research)
- مراجعة (Review)
- اختبار (Test)
- مشروع (Project)
- قراءة (Reading)

### Date Formats Supported
- `2025-08-04 21:30` - Date with time
- `2025-08-04T21:30:00` - ISO format
- `2025-08-04` - Date only (defaults to 23:59)

## 🛡️ Security Best Practices

### 1. Admin Management
```bash
# Add multiple admins
ADMIN_IDS=123456789,987654321,555666777

# Remove admin access
# Simply remove their ID from ADMIN_IDS and restart bot
```

### 2. Log Monitoring
```bash
# Check logs
tail -f logs/bot.log

# Monitor admin actions
grep "Admin.*performed action" logs/bot.log

# Check security events
grep "Security event" logs/bot.log
```

### 3. Data Backup
```bash
# Backup user data
cp data/users.json data/users_backup_$(date +%Y%m%d).json

# Backup assignments
cp data/assignments.json data/assignments_backup_$(date +%Y%m%d).json
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "401: Unauthorized"
```
Problem: Invalid bot token
Solution: Get new token from @BotFather and update .env
```

#### 2. Admin commands not working
```
Problem: User ID not in ADMIN_IDS
Solution: 
1. Send /start to bot
2. Check logs for user ID
3. Add ID to ADMIN_IDS in .env
4. Restart bot
```

#### 3. Conversations getting stuck
```
Problem: User stuck in conversation state
Solution: User can send /cancel to exit any operation
```

#### 4. Date format errors
```
Problem: Invalid date format
Solution: Use supported formats:
- 2025-08-04 21:30
- 2025-08-04T21:30:00  
- 2025-08-04
```

## 📈 Monitoring & Analytics

### Built-in Statistics
- Total users registered
- Active assignments count
- Completion rates
- Overdue assignments
- System performance metrics

### Access via `/stats` (Admin only)
```
📊 System Statistics

👥 Users: 15
📝 Total Assignments: 23
🟢 Active: 12
🔴 Overdue: 2
✅ Total Completions: 45

📈 Completion Rate: 85%
🕐 Last Updated: [timestamp]
```

## 🔄 Automated Features

### Reminders
- **Weekly lessons**: Monday & Thursday at 20:55 Cairo time
- **Assignment deadlines**: Daily at 18:00 Cairo time
- **Automatic timezone handling**: All times in Cairo timezone

### Data Management
- **Auto-cleanup**: Old conversation states (10 minutes)
- **Data validation**: Input sanitization and validation
- **Error recovery**: Graceful error handling

## 🚀 Deployment

### Local Development
```bash
npm run dev  # Auto-reload on changes
```

### Production
```bash
npm start
```

### Cloud Deployment (Railway/Render)
1. Connect GitHub repository
2. Set environment variables in platform dashboard
3. Deploy automatically

### Required Environment Variables for Production:
```
BOT_TOKEN=your_real_telegram_bot_token
TIMEZONE=Africa/Cairo
ADMIN_IDS=comma_separated_admin_user_ids
BOT_NAME=Muin Al-Mujtahidin Bot
LOG_LEVEL=info
```

---

## ✅ Features Summary

### ✅ Security & Access Control
- Role-based command access (Admin/User)
- Real-time admin verification
- Input validation and sanitization
- Comprehensive logging and audit trails
- Session security and timeout management

### ✅ Enhanced User Experience  
- Intelligent conversation flow
- Multiple input methods for assignments
- Smart format detection
- Context-aware responses
- Arabic language support

### ✅ Advanced Assignment Management
- Multi-format date support
- Input validation and error prevention
- Assignment status tracking
- Confirmation dialogs for critical actions
- Automatic reminder system

### ✅ Monitoring & Analytics
- Real-time system statistics
- User activity tracking
- Performance monitoring
- Error tracking and logging
- Admin action auditing

### ✅ Production Ready
- Comprehensive error handling
- Graceful failure recovery
- Cloud deployment ready
- Scalable architecture
- Maintainable code structure

---

**🎯 Your bot is now a production-ready, secure, and feature-rich assignment management system!**