#!/usr/bin/env python3
"""
Simple Admin Dashboard for the Telegram Bot
This script provides a command-line interface for admin tasks
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from database import db
from config import Config

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    """Print dashboard header"""
    clear_screen()
    print("🔧 Telegram Bot Admin Dashboard")
    print("=" * 50)
    print(f"Course: {Config.COURSE_NAME}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

def show_statistics():
    """Show bot statistics"""
    print_header()
    print("📊 Bot Statistics")
    print("-" * 30)
    
    stats = db.get_statistics()
    print(f"👥 Total Members: {stats['member_count']}")
    print(f"💬 Weekly Messages: {stats['weekly_messages']}")
    print(f"🎯 Attendance Rate: {stats['attendance_rate']}%")
    
    # Get unverified users
    unverified = db.get_unverified_users()
    print(f"⚠️ Unverified Users: {len(unverified)}")
    
    input("\nPress Enter to continue...")

def show_users():
    """Show user management options"""
    while True:
        print_header()
        print("👥 User Management")
        print("-" * 30)
        print("1. View all users")
        print("2. View unverified users")
        print("3. View verified users")
        print("4. Back to main menu")
        
        choice = input("\nSelect option: ")
        
        if choice == "1":
            show_all_users()
        elif choice == "2":
            show_unverified_users()
        elif choice == "3":
            show_verified_users()
        elif choice == "4":
            break
        else:
            print("Invalid option!")

def show_all_users():
    """Show all users"""
    print_header()
    print("👥 All Users")
    print("-" * 30)
    
    # This would need to be implemented in the database module
    print("Feature not yet implemented")
    input("\nPress Enter to continue...")

def show_unverified_users():
    """Show unverified users"""
    print_header()
    print("⚠️ Unverified Users")
    print("-" * 30)
    
    unverified = db.get_unverified_users()
    
    if not unverified:
        print("No unverified users found.")
    else:
        for i, user in enumerate(unverified, 1):
            print(f"{i}. {user['first_name']} {user['last_name']} (@{user['username']})")
            print(f"   ID: {user['id']} | Registered: {user['registered_at'][:10]}")
            print()
    
    input("\nPress Enter to continue...")

def show_verified_users():
    """Show verified users"""
    print_header()
    print("✅ Verified Users")
    print("-" * 30)
    
    verified = db.get_verified_users()
    
    if not verified:
        print("No verified users found.")
    else:
        for i, user in enumerate(verified, 1):
            print(f"{i}. {user['first_name']} {user['last_name']} (@{user['username']})")
            print(f"   ID: {user['id']}")
            print()
    
    input("\nPress Enter to continue...")

def manage_faq():
    """Manage FAQ entries"""
    while True:
        print_header()
        print("❓ FAQ Management")
        print("-" * 30)
        print("1. View all FAQ entries")
        print("2. Add new FAQ entry")
        print("3. Back to main menu")
        
        choice = input("\nSelect option: ")
        
        if choice == "1":
            show_faq_entries()
        elif choice == "2":
            add_faq_entry()
        elif choice == "3":
            break
        else:
            print("Invalid option!")

def show_faq_entries():
    """Show all FAQ entries"""
    print_header()
    print("❓ FAQ Entries")
    print("-" * 30)
    
    faq_entries = db.get_faq()
    
    if not faq_entries:
        print("No FAQ entries found.")
    else:
        for i, entry in enumerate(faq_entries, 1):
            print(f"{i}. Q: {entry['question']}")
            print(f"   A: {entry['answer'][:100]}...")
            print()
    
    input("\nPress Enter to continue...")

def add_faq_entry():
    """Add new FAQ entry"""
    print_header()
    print("➕ Add New FAQ Entry")
    print("-" * 30)
    
    question = input("Question: ")
    answer = input("Answer: ")
    category = input("Category (optional, press Enter for 'general'): ") or "general"
    
    if question and answer:
        if db.add_faq(question, answer, category):
            print("✅ FAQ entry added successfully!")
        else:
            print("❌ Failed to add FAQ entry")
    else:
        print("❌ Question and answer are required!")
    
    input("\nPress Enter to continue...")

def system_info():
    """Show system information"""
    print_header()
    print("ℹ️ System Information")
    print("-" * 30)
    
    print(f"Course Name: {Config.COURSE_NAME}")
    print(f"Database Path: {Config.DATABASE_PATH}")
    print(f"Zoom Link: {Config.ZOOM_LINK}")
    print(f"Max Warnings: {Config.MAX_WARNINGS}")
    print(f"Mute Duration: {Config.MUTE_DURATION} seconds")
    print(f"Verification Timeout: {Config.VERIFICATION_TIMEOUT} seconds")
    
    # Check if database file exists
    if os.path.exists(Config.DATABASE_PATH):
        db_size = os.path.getsize(Config.DATABASE_PATH)
        print(f"Database Size: {db_size} bytes")
    else:
        print("Database: Not created yet")
    
    input("\nPress Enter to continue...")

def main():
    """Main dashboard function"""
    # Load environment variables
    load_dotenv()
    
    # Check if admin IDs are configured
    if not Config.ADMIN_IDS:
        print("❌ No admin IDs configured!")
        print("Please set ADMIN_IDS in your .env file")
        sys.exit(1)
    
    while True:
        print_header()
        print("Main Menu")
        print("-" * 30)
        print("1. 📊 View Statistics")
        print("2. 👥 Manage Users")
        print("3. ❓ Manage FAQ")
        print("4. ℹ️ System Information")
        print("5. 🚪 Exit")
        
        choice = input("\nSelect option: ")
        
        if choice == "1":
            show_statistics()
        elif choice == "2":
            show_users()
        elif choice == "3":
            manage_faq()
        elif choice == "4":
            system_info()
        elif choice == "5":
            print("👋 Goodbye!")
            break
        else:
            print("Invalid option!")

if __name__ == "__main__":
    main()