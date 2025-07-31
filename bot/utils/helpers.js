// Simple in-memory state management for user conversations
const userStates = new Map();

export function formatDate(date) {
  return new Date(date).toLocaleString();
}

// State management functions
export function setUserState(userId, state) {
  userStates.set(userId, {
    state,
    timestamp: Date.now()
  });
}

export function getUserState(userId) {
  const userState = userStates.get(userId);
  
  // Clear state if it's older than 5 minutes
  if (userState && Date.now() - userState.timestamp > 5 * 60 * 1000) {
    userStates.delete(userId);
    return null;
  }
  
  return userState?.state || null;
}

export function clearUserState(userId) {
  userStates.delete(userId);
}

// Clean up old states periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [userId, state] of userStates.entries()) {
    if (now - state.timestamp > 10 * 60 * 1000) {
      userStates.delete(userId);
    }
  }
}, 10 * 60 * 1000);

// Date formatting for Arabic locale
export function formatArabicDate(date) {
  return new Date(date).toLocaleString('ar-EG', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Check if text contains assignment data format
export function isAssignmentFormat(text) {
  const parts = text.split('|');
  return parts.length >= 3;
}
