import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Format date in Cairo timezone
export function formatDate(date) {
  try {
    const timezone = process.env.TIMEZONE || 'Africa/Cairo';
    return formatInTimeZone(date, timezone, 'yyyy-MM-dd HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toISOString();
  }
}

// Get current date in Cairo timezone
export function getCurrentDate() {
  try {
    const timezone = process.env.TIMEZONE || 'Africa/Cairo';
    const now = new Date();
    return formatInTimeZone(now, timezone, 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error('Error getting current date:', error);
    return new Date().toISOString();
  }
}
