import fs from 'fs';
import path from 'path';

const LOG_DIR = './logs';
const LOG_FILE = path.join(LOG_DIR, 'bot.log');

// Ensure logs directory exists
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// Format log message
function formatLogMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logData = data ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.padEnd(5)}] ${message}${logData}`;
}

// Write to log file
function writeToFile(logMessage) {
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, logMessage + '\n', 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Log levels
export function logInfo(message, data = null) {
  const logMessage = formatLogMessage('INFO', message, data);
  console.log(`ℹ️  ${logMessage}`);
  writeToFile(logMessage);
}

export function logError(message, error = null) {
  const errorData = error ? {
    message: error.message,
    stack: error.stack,
    code: error.code
  } : null;
  
  const logMessage = formatLogMessage('ERROR', message, errorData);
  console.error(`❌ ${logMessage}`);
  writeToFile(logMessage);
}

export function logWarn(message, data = null) {
  const logMessage = formatLogMessage('WARN', message, data);
  console.warn(`⚠️  ${logMessage}`);
  writeToFile(logMessage);
}

export function logDebug(message, data = null) {
  if (process.env.LOG_LEVEL === 'debug') {
    const logMessage = formatLogMessage('DEBUG', message, data);
    console.log(`🐛 ${logMessage}`);
    writeToFile(logMessage);
  }
}

// Log user actions
export function logUserAction(userId, action, details = null) {
  const message = `User ${userId} performed action: ${action}`;
  logInfo(message, details);
}

// Log admin actions
export function logAdminAction(adminId, action, details = null) {
  const message = `Admin ${adminId} performed action: ${action}`;
  logInfo(message, { admin: true, ...details });
}

// Log security events
export function logSecurityEvent(userId, event, details = null) {
  const message = `Security event: ${event} (User: ${userId})`;
  logWarn(message, details);
}

// Get log stats
export function getLogStats() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return { exists: false, size: 0, lines: 0 };
    }
    
    const stats = fs.statSync(LOG_FILE);
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.split('\n').length - 1;
    
    return {
      exists: true,
      size: stats.size,
      sizeFormatted: (stats.size / 1024).toFixed(2) + ' KB',
      lines,
      lastModified: stats.mtime
    };
  } catch (error) {
    logError('Error getting log stats:', error);
    return { exists: false, error: error.message };
  }
}