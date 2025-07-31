#!/usr/bin/env python3
"""
Test script for the Telegram bot
This script tests the basic functionality without actually running the bot
"""

import os
import sys
from dotenv import load_dotenv

def test_environment():
    """Test environment configuration"""
    print("🔍 Testing environment configuration...")
    
    # Load environment variables
    load_dotenv()
    
    # Check required environment variables
    required_vars = ['BOT_TOKEN', 'ADMIN_IDS']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file")
        return False
    
    print("✅ Environment configuration is valid")
    return True

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing module imports...")
    
    try:
        import config
        print("✅ Config module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import config module: {e}")
        return False
    
    try:
        import database
        print("✅ Database module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import database module: {e}")
        return False
    
    try:
        import commands
        print("✅ Commands module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import commands module: {e}")
        return False
    
    try:
        import middleware
        print("✅ Middleware module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import middleware module: {e}")
        return False
    
    try:
        import scheduler
        print("✅ Scheduler module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import scheduler module: {e}")
        return False
    
    try:
        import verification
        print("✅ Verification module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import verification module: {e}")
        return False
    
    return True

def test_database():
    """Test database initialization"""
    print("🔍 Testing database initialization...")
    
    try:
        from database import db
        
        # Test database connection
        test_user = {
            'id': 999999,
            'username': 'test_user',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        # Register test user
        result = db.register_user(test_user)
        print(f"✅ Test user registration: {'New user' if result else 'Existing user'}")
        
        # Test user retrieval
        user = db.get_user(999999)
        if user:
            print("✅ User retrieval successful")
        else:
            print("❌ User retrieval failed")
            return False
        
        # Test verification
        db.verify_user(999999, 'CODE123')
        if db.is_verified(999999):
            print("✅ User verification successful")
        else:
            print("❌ User verification failed")
            return False
        
        # Test statistics
        stats = db.get_statistics()
        print(f"✅ Statistics retrieval successful: {stats}")
        
        print("✅ Database tests passed")
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_config():
    """Test configuration loading"""
    print("🔍 Testing configuration...")
    
    try:
        from config import Config
        
        # Test basic config values
        assert Config.COURSE_NAME, "Course name not set"
        assert Config.ZOOM_LINK, "Zoom link not set"
        assert Config.SCHEDULE, "Schedule not set"
        assert Config.FAQ, "FAQ not set"
        assert Config.QUIZ_QUESTIONS, "Quiz questions not set"
        assert Config.MESSAGES, "Messages not set"
        
        print("✅ Configuration tests passed")
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🤖 Starting Telegram Bot Tests...\n")
    
    tests = [
        ("Environment Configuration", test_environment),
        ("Module Imports", test_imports),
        ("Configuration", test_config),
        ("Database", test_database),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"Running: {test_name}")
        print('='*50)
        
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} FAILED with exception: {e}")
    
    print(f"\n{'='*50}")
    print(f"Test Results: {passed}/{total} tests passed")
    print('='*50)
    
    if passed == total:
        print("🎉 All tests passed! The bot is ready to run.")
        print("\nTo start the bot, run:")
        print("python main.py")
    else:
        print("⚠️ Some tests failed. Please fix the issues before running the bot.")
        sys.exit(1)

if __name__ == "__main__":
    main()