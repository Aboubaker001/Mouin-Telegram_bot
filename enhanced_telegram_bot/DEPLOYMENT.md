# 🚀 Deployment Guide - Enhanced Telegram Bot

This guide covers different deployment options for the Enhanced Telegram Bot.

## 📋 Prerequisites

- Python 3.9+
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- Server or hosting platform
- Basic knowledge of command line

## 🏠 Local Development

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd enhanced_telegram_bot

# Run setup script
python setup.py

# Edit configuration
nano .env

# Start the bot
python main.py
```

### Manual Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p data content uploads credentials logs

# Copy and edit configuration
cp .env.example .env
# Edit .env with your settings

# Run the bot
python main.py
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  telegram-bot:
    build: .
    container_name: enhanced-telegram-bot
    restart: unless-stopped
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - ADMIN_IDS=${ADMIN_IDS}
      - COURSE_NAME=${COURSE_NAME}
      - ZOOM_LINK=${ZOOM_LINK}
    env_file:
      - .env
    volumes:
      - ./data:/app/data
      - ./content:/app/content
      - ./uploads:/app/uploads
      - ./logs:/app/logs
      - ./credentials:/app/credentials
    networks:
      - bot-network

networks:
  bot-network:
    driver: bridge
```

2. Deploy:
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker directly
```bash
# Build image
docker build -t enhanced-telegram-bot .

# Run container
docker run -d \
  --name telegram-bot \
  --restart unless-stopped \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/content:/app/content \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/logs:/app/logs \
  --env-file .env \
  enhanced-telegram-bot
```

## ☁️ Cloud Deployment

### Heroku

1. Create `Procfile`:
```
worker: python main.py
```

2. Create `runtime.txt`:
```
python-3.9.18
```

3. Deploy:
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-bot-name

# Set environment variables
heroku config:set BOT_TOKEN=your_token
heroku config:set ADMIN_IDS=your_admin_ids
heroku config:set COURSE_NAME="اسم الدورة"

# Deploy
git push heroku main

# Scale worker
heroku ps:scale worker=1

# View logs
heroku logs --tail
```

### DigitalOcean Droplet

1. Create a droplet (Ubuntu 20.04 LTS)

2. Connect via SSH:
```bash
ssh root@your_droplet_ip
```

3. Setup environment:
```bash
# Update system
apt update && apt upgrade -y

# Install Python 3.9
apt install python3.9 python3.9-venv python3-pip git -y

# Create user for bot
adduser botuser
usermod -aG sudo botuser
su - botuser

# Clone repository
git clone <repository-url>
cd enhanced_telegram_bot

# Setup bot
python3.9 setup.py
```

4. Create systemd service:
```bash
sudo nano /etc/systemd/system/telegram-bot.service
```

```ini
[Unit]
Description=Enhanced Telegram Bot
After=network.target

[Service]
Type=simple
User=botuser
WorkingDirectory=/home/botuser/enhanced_telegram_bot
ExecStart=/home/botuser/enhanced_telegram_bot/venv/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

5. Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable telegram-bot.service
sudo systemctl start telegram-bot.service

# Check status
sudo systemctl status telegram-bot.service

# View logs
sudo journalctl -u telegram-bot.service -f
```

### AWS EC2

1. Launch EC2 instance (Amazon Linux 2)

2. Connect and setup:
```bash
# Update system
sudo yum update -y

# Install Python 3.9
sudo yum install python3 python3-pip git -y

# Clone and setup
git clone <repository-url>
cd enhanced_telegram_bot
python3 setup.py
```

3. Use screen for persistent session:
```bash
# Install screen
sudo yum install screen -y

# Start screen session
screen -S telegram-bot

# Run bot
python3 main.py

# Detach: Ctrl+A, D
# Reattach: screen -r telegram-bot
```

### Google Cloud Platform

1. Create VM instance

2. Setup using startup script:
```bash
#!/bin/bash
apt-get update
apt-get install -y python3.9 python3.9-venv python3-pip git

# Create service user
useradd -m -s /bin/bash botuser

# Clone repository as service user
sudo -u botuser git clone <repository-url> /home/botuser/enhanced_telegram_bot

# Setup environment
cd /home/botuser/enhanced_telegram_bot
sudo -u botuser python3.9 setup.py

# Create systemd service
cat > /etc/systemd/system/telegram-bot.service << EOF
[Unit]
Description=Enhanced Telegram Bot
After=network.target

[Service]
Type=simple
User=botuser
WorkingDirectory=/home/botuser/enhanced_telegram_bot
ExecStart=/home/botuser/enhanced_telegram_bot/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable telegram-bot.service
systemctl start telegram-bot.service
```

## 🔧 Production Configuration

### Environment Variables

Essential variables for production:
```env
# Bot Configuration
BOT_TOKEN=your_real_bot_token
ADMIN_IDS=123456789,987654321

# Course Configuration
COURSE_NAME=اسم الدورة الفعلي
INSTRUCTOR_NAME=اسم المدرب
ZOOM_LINK=https://zoom.us/j/real-meeting-id

# Security
VERIFICATION_REQUIRED=true
SUBSCRIPTION_CODES=CODE1,CODE2,CODE3

# Performance
MAX_WARNINGS=3
SPAM_THRESHOLD=5
```

### Security Checklist

- [ ] Never commit `.env` file to version control
- [ ] Use strong, unique subscription codes
- [ ] Regularly rotate bot token if compromised
- [ ] Enable firewall on server
- [ ] Use HTTPS for webhook (if implemented)
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

### Monitoring

1. **Log Monitoring**:
```bash
# View live logs
tail -f logs/bot_$(date +%Y-%m-%d).log

# Search for errors
grep -i error logs/bot_*.log

# Monitor specific user activity
grep "User 123456789" logs/bot_*.log
```

2. **System Monitoring**:
```bash
# Check bot process
ps aux | grep python

# Monitor resource usage
htop

# Check disk space
df -h

# Monitor network
netstat -tuln
```

3. **Database Monitoring**:
```bash
# Check database size
ls -lh data/bot_database.db

# Simple backup
cp data/bot_database.db data/backup_$(date +%Y%m%d).db
```

## 🔄 Updates and Maintenance

### Updating the Bot

1. **Backup current state**:
```bash
# Backup database
cp data/bot_database.db data/backup_$(date +%Y%m%d_%H%M%S).db

# Backup configuration
cp .env .env.backup
```

2. **Update code**:
```bash
# Stop bot (if using systemd)
sudo systemctl stop telegram-bot.service

# Pull updates
git pull origin main

# Update dependencies
pip install -r requirements.txt

# Restart bot
sudo systemctl start telegram-bot.service
```

3. **Verify update**:
```bash
# Check logs
sudo journalctl -u telegram-bot.service -f

# Test bot functionality
# Send /start command to your bot
```

### Regular Maintenance

1. **Daily**:
   - Check bot responsiveness
   - Monitor error logs
   - Verify scheduled messages

2. **Weekly**:
   - Review user activity
   - Check database size
   - Update subscription codes if needed

3. **Monthly**:
   - System updates
   - Dependency updates
   - Security audit
   - Performance review

## 🆘 Troubleshooting

### Common Issues

1. **Bot not responding**:
```bash
# Check if process is running
ps aux | grep python

# Check logs for errors
tail -20 logs/error_$(date +%Y-%m-%d).log

# Restart service
sudo systemctl restart telegram-bot.service
```

2. **Database issues**:
```bash
# Check database file permissions
ls -la data/bot_database.db

# Test database connection
python3 -c "import sqlite3; sqlite3.connect('data/bot_database.db').execute('SELECT 1')"
```

3. **Memory issues**:
```bash
# Check memory usage
free -h

# Monitor process memory
ps aux --sort=-%mem | head

# Clear logs if needed
find logs/ -name "*.log" -mtime +7 -delete
```

### Support

- Check logs first: `logs/error_*.log`
- Review configuration: `.env` file
- Test with `/start` command
- Verify bot token with BotFather
- Check server resources and connectivity

---

**📝 Remember to adapt these instructions to your specific hosting environment and requirements.**