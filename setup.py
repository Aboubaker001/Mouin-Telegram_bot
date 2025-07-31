#!/usr/bin/env python3
"""
Setup script for the Telegram bot
This script helps with initial setup and configuration
"""

import os
import sys
import shutil
from pathlib import Path

def create_env_file():
    """Create .env file from template"""
    print("🔧 Creating .env file...")
    
    if os.path.exists('.env'):
        response = input("⚠️ .env file already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Skipping .env creation")
            return
    
    if not os.path.exists('.env.example'):
        print("❌ .env.example not found!")
        return False
    
    shutil.copy('.env.example', '.env')
    print("✅ .env file created from template")
    print("📝 Please edit .env file with your configuration")
    return True

def create_data_directory():
    """Create data directory"""
    print("📁 Creating data directory...")
    
    data_dir = Path('data')
    data_dir.mkdir(exist_ok=True)
    
    print("✅ Data directory created")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing dependencies...")
    
    try:
        import subprocess
        result = subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies installed successfully")
            return True
        else:
            print(f"❌ Failed to install dependencies: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def check_python_version():
    """Check Python version"""
    print("🐍 Checking Python version...")
    
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print(f"❌ Python 3.9+ required, found {version.major}.{version.minor}")
        return False
    
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def setup_bot_token():
    """Guide user through bot token setup"""
    print("\n🤖 Bot Token Setup")
    print("=" * 50)
    print("1. Open Telegram and search for @BotFather")
    print("2. Send /newbot command")
    print("3. Follow the instructions to create your bot")
    print("4. Copy the bot token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)")
    print("5. Add it to your .env file as BOT_TOKEN=your_token_here")
    print("\nFor more help: https://core.telegram.org/bots#how-do-i-create-a-bot")

def setup_admin_ids():
    """Guide user through admin ID setup"""
    print("\n👑 Admin IDs Setup")
    print("=" * 50)
    print("1. In Telegram, send a message to @userinfobot")
    print("2. It will reply with your user ID")
    print("3. Add your ID to .env file as ADMIN_IDS=your_id_here")
    print("4. For multiple admins, separate with commas: ADMIN_IDS=123,456,789")

def setup_subscription_codes():
    """Guide user through subscription codes setup"""
    print("\n🔐 Subscription Codes Setup")
    print("=" * 50)
    print("1. Decide on subscription codes for your students")
    print("2. Add them to .env file as SUBSCRIPTION_CODES=CODE1,CODE2,CODE3")
    print("3. Share these codes with your students")
    print("4. Students will use /verify command with these codes")

def main():
    """Main setup function"""
    print("🚀 Telegram Bot Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create data directory
    create_data_directory()
    
    # Create .env file
    create_env_file()
    
    # Install dependencies
    if not install_dependencies():
        print("⚠️ Failed to install dependencies. Please install manually:")
        print("pip install -r requirements.txt")
    
    # Setup instructions
    print("\n" + "=" * 50)
    print("📋 Setup Instructions")
    print("=" * 50)
    
    setup_bot_token()
    setup_admin_ids()
    setup_subscription_codes()
    
    print("\n" + "=" * 50)
    print("✅ Setup Complete!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Edit .env file with your configuration")
    print("2. Run: python test_bot.py (to test setup)")
    print("3. Run: python main.py (to start the bot)")
    print("\nFor help, check README.md")

if __name__ == "__main__":
    main()