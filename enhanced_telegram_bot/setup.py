#!/usr/bin/env python3
"""
Setup script for Enhanced Telegram Bot
Automates the initial setup process
"""

import os
import sys
import subprocess
from pathlib import Path


def create_directories():
    """Create necessary directories"""
    directories = ['data', 'content', 'uploads', 'credentials', 'logs']
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")


def create_env_file():
    """Create .env file from template if it doesn't exist"""
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_file.exists() and env_example.exists():
        import shutil
        shutil.copy(env_example, env_file)
        print("✅ Created .env file from template")
        print("⚠️  Please edit .env file with your actual configuration")
    elif env_file.exists():
        print("ℹ️  .env file already exists")
    else:
        print("❌ .env.example not found")


def install_dependencies():
    """Install Python dependencies"""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✅ Installed dependencies successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False
    return True


def main():
    """Main setup function"""
    print("🤖 Enhanced Telegram Bot Setup")
    print("=" * 40)
    
    # Check Python version
    if sys.version_info < (3, 9):
        print("❌ Python 3.9 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Create directories
    print("\n📁 Creating directories...")
    create_directories()
    
    # Create .env file
    print("\n⚙️  Setting up configuration...")
    create_env_file()
    
    # Install dependencies
    print("\n📦 Installing dependencies...")
    if not install_dependencies():
        sys.exit(1)
    
    print("\n" + "=" * 40)
    print("🎉 Setup completed successfully!")
    print("\n📝 Next steps:")
    print("1. Edit .env file with your bot token and configuration")
    print("2. Run: python main.py")
    print("\n📚 For detailed instructions, see README.md")


if __name__ == "__main__":
    main()