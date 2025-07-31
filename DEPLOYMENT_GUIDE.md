# 🚀 Deployment Guide - Enhanced Telegram Bot

This guide will help you deploy the enhanced Muin Al-Mujtahidin Telegram Bot with all its advanced features.

## 📋 Prerequisites

- Python 3.9 or higher
- Telegram account
- Basic knowledge of command line operations
- Server/VPS (for production deployment)

## 🛠️ Quick Setup

### 1. Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/Aboubaker001/Mouin-Telegram_bot.git
cd Mouin-Telegram_bot

# Run the automated setup script
python setup.py
```

The setup script will:
- ✅ Check Python version compatibility
- ✅ Create necessary directories
- ✅ Install dependencies
- ✅ Create .env file from template
- ✅ Provide step-by-step configuration instructions

### 2. Manual Setup

If you prefer manual setup:

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## 🔧 Configuration

### Essential Configuration

1. **Bot Token**
   ```bash
   # Get from @BotFather on Telegram
   BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

2. **Admin IDs**
   ```bash
   # Get your ID from @userinfobot
   ADMIN_IDS=123456789,987654321
   ```

3. **Zoom Configuration**
   ```bash
   ZOOM_LINK=https://zoom.us/j/your-meeting-id
   ZOOM_PASSWORD=your-password
   ```

4. **Subscription Codes**
   ```bash
   # Codes for student verification
   SUBSCRIPTION_CODES=CODE123,CODE456,STUDENT2024
   ```

### Advanced Configuration

Edit `config.py` to customize:
- Course name and description
- Weekly schedule
- Content links
- FAQ questions
- Quiz questions
- Message templates

## 🧪 Testing

Before running the bot in production:

```bash
# Run comprehensive tests
python test_bot.py
```

This will test:
- ✅ Environment configuration
- ✅ Module imports
- ✅ Database functionality
- ✅ Configuration loading

## 🚀 Running the Bot

### Development Mode

```bash
# Start the bot
python main.py
```

### Production Mode

For production deployment, use a process manager like `systemd` or `supervisor`.

#### Using systemd

1. Create service file:
```bash
sudo nano /etc/systemd/system/telegram-bot.service
```

2. Add configuration:
```ini
[Unit]
Description=Telegram Bot Service
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/bot
Environment=PATH=/path/to/venv/bin
ExecStart=/path/to/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. Enable and start:
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
```

#### Using Docker

1. Create Dockerfile:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "main.py"]
```

2. Build and run:
```bash
docker build -t telegram-bot .
docker run -d --name bot --env-file .env telegram-bot
```

## 📊 Admin Dashboard

Access the admin dashboard for management tasks:

```bash
python admin_dashboard.py
```

Features:
- 📊 View bot statistics
- 👥 Manage users
- ❓ Manage FAQ entries
- ℹ️ System information

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` file to version control
- Use strong, unique subscription codes
- Regularly rotate bot tokens

### Access Control
- Limit admin access to trusted users only
- Monitor bot logs for suspicious activity
- Regularly review user permissions

### Data Protection
- Database is stored locally by default
- Consider encryption for sensitive data
- Regular backups of database file

## 📈 Monitoring

### Logs
- Bot logs are saved to `bot.log`
- Monitor for errors and warnings
- Set up log rotation for production

### Health Checks
```bash
# Check bot status
python test_bot.py

# View recent logs
tail -f bot.log

# Check database
python admin_dashboard.py
```

## 🔄 Updates

### Updating the Bot
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
pip install -r requirements.txt

# Test the update
python test_bot.py

# Restart the bot
sudo systemctl restart telegram-bot  # if using systemd
```

### Database Migrations
The bot automatically handles database schema updates. No manual migration needed.

## 🆘 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check bot token in .env
   - Verify bot is not blocked
   - Check logs for errors

2. **Database errors**
   - Ensure data directory exists
   - Check file permissions
   - Verify SQLite is available

3. **Import errors**
   - Install missing dependencies
   - Check Python version (3.9+)
   - Verify virtual environment

4. **Permission denied**
   - Check file permissions
   - Ensure user has write access to data directory

### Getting Help

1. Check the logs: `tail -f bot.log`
2. Run tests: `python test_bot.py`
3. Check configuration: `python admin_dashboard.py`
4. Create issue on GitHub with logs and error details

## 📚 Additional Resources

- [aiogram Documentation](https://docs.aiogram.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Python Documentation](https://docs.python.org/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## 🎯 Production Checklist

Before going live:

- [ ] Bot token configured
- [ ] Admin IDs set
- [ ] Subscription codes defined
- [ ] Zoom links configured
- [ ] Course schedule updated
- [ ] FAQ entries added
- [ ] Quiz questions prepared
- [ ] Content links verified
- [ ] Tests passing
- [ ] Logs monitored
- [ ] Backup strategy in place
- [ ] Process manager configured
- [ ] Security measures implemented

## 🏆 Success Metrics

Monitor these metrics for success:
- User registration rate
- Verification completion rate
- Attendance tracking usage
- Quiz participation
- Feedback response rate
- Message engagement
- Error rate in logs

---

**Happy Botting! 🤖✨**