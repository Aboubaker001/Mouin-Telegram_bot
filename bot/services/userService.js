import { readJSON, writeJSON } from '../utils/database.js';
import config from '../../config.js';

const USERS_FILE = './data/users.json';
const VERIFICATION_FILE = './data/verification.json';
const WARNINGS_FILE = './data/warnings.json';

// Get all registered users
export function getAllUsers() {
  return readJSON(USERS_FILE, []);
}

// Get user by ID
export function getUserInfo(userId) {
  const users = getAllUsers();
  return users.find(user => user.id === userId);
}

// Register a new user
export function registerUser(user) {
  const users = getAllUsers();
  const existingUser = users.find(u => u.id === user.id);
  
  if (existingUser) {
    return { success: false, message: "المستخدم مسجل بالفعل" };
  }
  
  const newUser = {
    ...user,
    registeredAt: new Date().toISOString(),
    isVerified: false,
    isAdmin: false,
    warnings: 0,
    isMuted: false,
    muteExpiry: null,
    remindersEnabled: true,
    lastActivity: new Date().toISOString(),
    joinDate: new Date().toISOString()
  };
  
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  
  return { success: true, user: newUser };
}

// Verify user with subscription code
export function verifyUser(userId, subscriptionCode) {
  if (subscriptionCode !== config.users.subscriptionCode) {
    return { success: false, message: "رمز الاشتراك غير صحيح" };
  }
  
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  users[userIndex].isVerified = true;
  users[userIndex].verifiedAt = new Date().toISOString();
  writeJSON(USERS_FILE, users);
  
  return { success: true, user: users[userIndex] };
}

// Check if user is verified
export function isUserVerified(userId) {
  const user = getUserInfo(userId);
  return user ? user.isVerified : false;
}

// Check if user is admin
export function isUserAdmin(userId) {
  const user = getUserInfo(userId);
  return user ? user.isAdmin || config.admin.userIds.includes(userId) : false;
}

// Add admin user
export function addAdminUser(userId) {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  users[userIndex].isAdmin = true;
  users[userIndex].adminAddedAt = new Date().toISOString();
  writeJSON(USERS_FILE, users);
  
  return { success: true, user: users[userIndex] };
}

// Remove admin user
export function removeAdminUser(userId) {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  users[userIndex].isAdmin = false;
  writeJSON(USERS_FILE, users);
  
  return { success: true, user: users[userIndex] };
}

// Warning system
export function addWarning(userId, reason = "انتهاك قواعد المجموعة") {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  users[userIndex].warnings += 1;
  users[userIndex].lastWarning = {
    reason,
    date: new Date().toISOString()
  };
  
  // Auto-mute if max warnings reached
  if (users[userIndex].warnings >= config.users.maxWarnings) {
    users[userIndex].isMuted = true;
    users[userIndex].muteExpiry = new Date(Date.now() + config.users.muteDuration * 1000).toISOString();
  }
  
  writeJSON(USERS_FILE, users);
  
  return { 
    success: true, 
    warnings: users[userIndex].warnings,
    isMuted: users[userIndex].isMuted,
    user: users[userIndex]
  };
}

// Remove warning
export function removeWarning(userId) {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  if (users[userIndex].warnings > 0) {
    users[userIndex].warnings -= 1;
  }
  
  writeJSON(USERS_FILE, users);
  
  return { 
    success: true, 
    warnings: users[userIndex].warnings,
    user: users[userIndex]
  };
}

// Mute user
export function muteUser(userId, duration = config.users.muteDuration) {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  users[userIndex].isMuted = true;
  users[userIndex].muteExpiry = new Date(Date.now() + duration * 1000).toISOString();
  writeJSON(USERS_FILE, users);
  
  return { success: true, user: users[userIndex] };
}

// Unmute user
export function unmuteUser(userId) {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  users[userIndex].isMuted = false;
  users[userIndex].muteExpiry = null;
  writeJSON(USERS_FILE, users);
  
  return { success: true, user: users[userIndex] };
}

// Check if user is muted
export function isUserMuted(userId) {
  const user = getUserInfo(userId);
  if (!user || !user.isMuted) return false;
  
  // Check if mute has expired
  if (user.muteExpiry && new Date() > new Date(user.muteExpiry)) {
    unmuteUser(userId);
    return false;
  }
  
  return true;
}

// Toggle reminders for user
export function toggleReminders(userId) {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  users[userIndex].remindersEnabled = !users[userIndex].remindersEnabled;
  writeJSON(USERS_FILE, users);
  
  return { 
    success: true, 
    remindersEnabled: users[userIndex].remindersEnabled,
    user: users[userIndex]
  };
}

// Update user activity
export function updateUserActivity(userId) {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].lastActivity = new Date().toISOString();
    writeJSON(USERS_FILE, users);
  }
}

// Get users with reminders enabled
export function getUsersWithReminders() {
  const users = getAllUsers();
  return users.filter(user => user.isVerified && user.remindersEnabled);
}

// Get active users (active in last 7 days)
export function getActiveUsers() {
  const users = getAllUsers();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return users.filter(user => 
    user.isVerified && 
    new Date(user.lastActivity) > sevenDaysAgo
  );
}

// Get user statistics
export function getUserStats(userId) {
  const user = getUserInfo(userId);
  if (!user) return null;
  
  const users = getAllUsers();
  const totalUsers = users.filter(u => u.isVerified).length;
  const activeUsers = getActiveUsers().length;
  
  return {
    user,
    totalUsers,
    activeUsers,
    userRank: users.filter(u => u.isVerified).findIndex(u => u.id === userId) + 1,
    daysSinceJoin: Math.floor((new Date() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24))
  };
}

// Update user information
export function updateUser(userId, updates) {
  const users = getAllUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index === -1) {
    return { success: false, message: "المستخدم غير موجود" };
  }
  
  users[index] = { ...users[index], ...updates };
  writeJSON(USERS_FILE, users);
  
  return { success: true, user: users[index] };
}

// Clean up expired verifications
export function cleanupExpiredVerifications() {
  const verifications = readJSON(VERIFICATION_FILE, []);
  const now = new Date();
  const validVerifications = verifications.filter(v => 
    new Date(v.expiresAt) > now
  );
  
  writeJSON(VERIFICATION_FILE, validVerifications);
  return validVerifications.length;
}
