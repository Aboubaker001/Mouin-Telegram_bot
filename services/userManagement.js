import fs from 'fs/promises';
import { botConfig, arabicMessages } from '../config/arabic-config.js';
import { logUserAction, logAdminAction, logSecurityEvent } from '../bot/utils/logger.js';

// أنواع المستخدمين
export const UserTypes = {
  ADMIN: 'admin',
  MODERATOR: 'moderator', 
  STUDENT: 'student',
  PENDING: 'pending'
};

// حالات المستخدم
export const UserStatus = {
  ACTIVE: 'active',
  MUTED: 'muted',
  BANNED: 'banned',
  PENDING_VERIFICATION: 'pending_verification'
};

// ضمان وجود ملفات البيانات
async function ensureDataFiles() {
  try {
    const files = [
      botConfig.paths.users,
      botConfig.paths.warnings,
      botConfig.paths.courses
    ];
    
    for (const filePath of files) {
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      await fs.mkdir(dir, { recursive: true });
      
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, '[]', 'utf8');
      }
    }
  } catch (error) {
    console.error('❌ خطأ في إنشاء ملفات البيانات:', error);
  }
}

// تحميل المستخدمين
export async function loadUsers() {
  try {
    await ensureDataFiles();
    const data = await fs.readFile(botConfig.paths.users, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ خطأ في تحميل المستخدمين:', error);
    return [];
  }
}

// حفظ المستخدمين
export async function saveUsers(users) {
  try {
    await fs.writeFile(botConfig.paths.users, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حفظ المستخدمين:', error);
    return false;
  }
}

// التحقق من صحة رقم الاشتراك
function validateSubscriptionCode(code) {
  // التحقق من أن الرقم مكون من 6 أرقام
  const regex = /^\d{6}$/;
  return regex.test(code);
}

// تسجيل مستخدم جديد
export async function registerUser(userInfo, subscriptionCode = null) {
  try {
    const users = await loadUsers();
    
    // التحقق من وجود المستخدم
    const existingUser = users.find(user => user.id === userInfo.id);
    if (existingUser) {
      // تحديث آخر نشاط
      existingUser.lastSeen = new Date().toISOString();
      await saveUsers(users);
      return { 
        success: true, 
        isNew: false, 
        user: existingUser,
        message: 'returning_user' 
      };
    }
    
    // تحديد نوع المستخدم
    let userType = UserTypes.STUDENT;
    let status = UserStatus.ACTIVE;
    
    // التحقق من المشرفين
    if (botConfig.adminIds.includes(userInfo.id)) {
      userType = UserTypes.ADMIN;
    } else if (botConfig.courseSettings.requireVerification) {
      // إذا كان التحقق مطلوباً
      if (!subscriptionCode) {
        status = UserStatus.PENDING_VERIFICATION;
        userType = UserTypes.PENDING;
      } else {
        // التحقق من صحة رقم الاشتراك
        if (!validateSubscriptionCode(subscriptionCode)) {
          return {
            success: false,
            message: 'invalid_subscription_code',
            error: 'رقم الاشتراك يجب أن يكون مكوناً من 6 أرقام'
          };
        }
        
        // هنا يمكن إضافة تحقق أكثر تعقيداً من قاعدة بيانات
        if (subscriptionCode === botConfig.courseSettings.subscriptionCode) {
          userType = UserTypes.STUDENT;
          status = UserStatus.ACTIVE;
        } else {
          status = UserStatus.PENDING_VERIFICATION;
          userType = UserTypes.PENDING;
        }
      }
    }
    
    // إنشاء كائن المستخدم الجديد
    const newUser = {
      id: userInfo.id,
      username: userInfo.username || null,
      firstName: userInfo.first_name || '',
      lastName: userInfo.last_name || '',
      userType: userType,
      status: status,
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      subscriptionCode: subscriptionCode || null,
      settings: {
        remindersEnabled: true,
        language: 'ar',
        notifications: true
      },
      stats: {
        totalSessions: 0,
        completedQuizzes: 0,
        averageScore: 0,
        warnings: 0,
        lastActivity: new Date().toISOString()
      },
      warnings: [],
      muteUntil: null
    };
    
    // إضافة المستخدم
    users.push(newUser);
    const saved = await saveUsers(users);
    
    if (saved) {
      logUserAction(userInfo.id, 'user_registered', {
        userType: userType,
        status: status,
        requiresVerification: status === UserStatus.PENDING_VERIFICATION
      });
      
      return {
        success: true,
        isNew: true,
        user: newUser,
        message: status === UserStatus.PENDING_VERIFICATION ? 'pending_verification' : 'user_registered'
      };
    } else {
      return { success: false, message: 'save_error' };
    }
    
  } catch (error) {
    console.error('❌ خطأ في تسجيل المستخدم:', error);
    return { success: false, message: 'technical_error', error: error.message };
  }
}

// الحصول على مستخدم بواسطة المعرف
export async function getUserById(userId) {
  try {
    const users = await loadUsers();
    return users.find(user => user.id === userId);
  } catch (error) {
    console.error('❌ خطأ في الحصول على المستخدم:', error);
    return null;
  }
}

// التحقق من صلاحيات المستخدم
export function checkUserPermission(user, requiredType) {
  if (!user) return false;
  
  const typeHierarchy = {
    [UserTypes.ADMIN]: 3,
    [UserTypes.MODERATOR]: 2,
    [UserTypes.STUDENT]: 1,
    [UserTypes.PENDING]: 0
  };
  
  return typeHierarchy[user.userType] >= typeHierarchy[requiredType];
}

// التحقق من حالة المستخدم
export function isUserActive(user) {
  if (!user) return false;
  
  // التحقق من الكتم
  if (user.muteUntil && new Date(user.muteUntil) > new Date()) {
    return false;
  }
  
  return user.status === UserStatus.ACTIVE;
}

// إضافة تحذير للمستخدم
export async function addWarning(userId, reason, adminId) {
  try {
    const users = await loadUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: 'user_not_found' };
    }
    
    const user = users[userIndex];
    const warningId = Date.now().toString();
    
    const warning = {
      id: warningId,
      reason: reason,
      issuedBy: adminId,
      issuedAt: new Date().toISOString(),
      active: true
    };
    
    // إضافة التحذير
    user.warnings.push(warning);
    user.stats.warnings = user.warnings.filter(w => w.active).length;
    
    // التحقق من الحد الأقصى للتحذيرات
    const activeWarnings = user.warnings.filter(w => w.active).length;
    let shouldMute = false;
    
    if (activeWarnings >= botConfig.courseSettings.maxWarnings) {
      // كتم المستخدم
      const muteUntil = new Date();
      muteUntil.setMinutes(muteUntil.getMinutes() + botConfig.courseSettings.muteTime);
      
      user.muteUntil = muteUntil.toISOString();
      user.status = UserStatus.MUTED;
      shouldMute = true;
    }
    
    await saveUsers(users);
    
    logAdminAction(adminId, 'warning_issued', {
      targetUser: userId,
      reason: reason,
      warningCount: activeWarnings,
      muted: shouldMute
    });
    
    return {
      success: true,
      user: user,
      warningCount: activeWarnings,
      remainingWarnings: Math.max(0, botConfig.courseSettings.maxWarnings - activeWarnings),
      muted: shouldMute,
      muteUntil: user.muteUntil
    };
    
  } catch (error) {
    console.error('❌ خطأ في إضافة التحذير:', error);
    return { success: false, message: 'technical_error' };
  }
}

// كتم مستخدم
export async function muteUser(userId, duration, reason, adminId) {
  try {
    const users = await loadUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: 'user_not_found' };
    }
    
    const muteUntil = new Date();
    muteUntil.setMinutes(muteUntil.getMinutes() + duration);
    
    users[userIndex].muteUntil = muteUntil.toISOString();
    users[userIndex].status = UserStatus.MUTED;
    
    await saveUsers(users);
    
    logAdminAction(adminId, 'user_muted', {
      targetUser: userId,
      duration: duration,
      reason: reason,
      muteUntil: muteUntil.toISOString()
    });
    
    return {
      success: true,
      user: users[userIndex],
      muteUntil: muteUntil.toISOString()
    };
    
  } catch (error) {
    console.error('❌ خطأ في كتم المستخدم:', error);
    return { success: false, message: 'technical_error' };
  }
}

// إلغاء كتم مستخدم
export async function unmuteUser(userId, adminId) {
  try {
    const users = await loadUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: 'user_not_found' };
    }
    
    users[userIndex].muteUntil = null;
    users[userIndex].status = UserStatus.ACTIVE;
    
    await saveUsers(users);
    
    logAdminAction(adminId, 'user_unmuted', {
      targetUser: userId
    });
    
    return {
      success: true,
      user: users[userIndex]
    };
    
  } catch (error) {
    console.error('❌ خطأ في إلغاء كتم المستخدم:', error);
    return { success: false, message: 'technical_error' };
  }
}

// الحصول على جميع المستخدمين النشطين
export async function getActiveUsers() {
  try {
    const users = await loadUsers();
    return users.filter(user => isUserActive(user));
  } catch (error) {
    console.error('❌ خطأ في الحصول على المستخدمين النشطين:', error);
    return [];
  }
}

// الحصول على إحصائيات المستخدمين
export async function getUserStatistics() {
  try {
    const users = await loadUsers();
    
    const stats = {
      total: users.length,
      active: users.filter(user => user.status === UserStatus.ACTIVE).length,
      muted: users.filter(user => user.status === UserStatus.MUTED).length,
      pending: users.filter(user => user.status === UserStatus.PENDING_VERIFICATION).length,
      admins: users.filter(user => user.userType === UserTypes.ADMIN).length,
      students: users.filter(user => user.userType === UserTypes.STUDENT).length,
      totalWarnings: users.reduce((sum, user) => sum + user.stats.warnings, 0),
      avgQuizScore: users.reduce((sum, user) => sum + user.stats.averageScore, 0) / users.length || 0
    };
    
    return stats;
  } catch (error) {
    console.error('❌ خطأ في الحصول على إحصائيات المستخدمين:', error);
    return {};
  }
}

// تحديث آخر نشاط للمستخدم
export async function updateUserActivity(userId) {
  try {
    const users = await loadUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].lastSeen = new Date().toISOString();
      users[userIndex].stats.lastActivity = new Date().toISOString();
      await saveUsers(users);
    }
  } catch (error) {
    console.error('❌ خطأ في تحديث نشاط المستخدم:', error);
  }
}

// التحقق التلقائي من انتهاء الكتم
export async function checkMuteExpirations() {
  try {
    const users = await loadUsers();
    let updated = false;
    
    for (const user of users) {
      if (user.muteUntil && new Date(user.muteUntil) <= new Date()) {
        user.muteUntil = null;
        user.status = UserStatus.ACTIVE;
        updated = true;
        
        console.log(`🔊 انتهى كتم المستخدم: ${user.firstName} (${user.id})`);
      }
    }
    
    if (updated) {
      await saveUsers(users);
    }
  } catch (error) {
    console.error('❌ خطأ في فحص انتهاء الكتم:', error);
  }
}

export default {
  UserTypes,
  UserStatus,
  registerUser,
  getUserById,
  checkUserPermission,
  isUserActive,
  addWarning,
  muteUser,
  unmuteUser,
  getActiveUsers,
  getUserStatistics,
  updateUserActivity,
  checkMuteExpirations
};