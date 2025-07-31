import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { setupBot } from './bot/config/index.js';
import { startReminderScheduler } from './bot/scheduler/reminderScheduler.js';
import { ensureDataDirectoryExists } from './bot/utils/database.js';

// Load environment variables
dotenv.config();

// Initialize bot with token from environment variables
const bot = new Telegraf(process.env.BOT_TOKEN);

// Ensure data directory exists
ensureDataDirectoryExists();

// Setup bot commands and handlers
setupBot(bot);

// Start the reminder scheduler
startReminderScheduler(bot);

// Launch the bot
bot.launch();
console.log("🤖 Muin Al-Mujtahidin Bot is running...");

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
