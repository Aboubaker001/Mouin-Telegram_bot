import { readJSON, writeJSON } from '../utils/database.js';

const USERS_FILE = './data/users.json';

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
  
  users.push({
    ...user,
    registeredAt: new Date().toISOString()
  });
  
  writeJSON(USERS_FILE, users);
  
  return { success: true, user };
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
