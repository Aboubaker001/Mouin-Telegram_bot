// Check if user is admin
export function isAdmin(userId) {
  const adminIds = process.env.ADMIN_IDS ? 
    process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim())) : [];
  
  return adminIds.includes(userId);
}

// Middleware to require admin access
export function requireAdmin(ctx, next) {
  if (!isAdmin(ctx.from.id)) {
    return ctx.reply(
      "🔒 عذراً، هذا الأمر متاح للمدراء فقط.\n\n" +
      "إذا كنت مدير، تأكد من إضافة معرف المستخدم الخاص بك إلى متغير ADMIN_IDS في إعدادات البوت."
    );
  }
  return next();
}

// Check if user is admin (async version)
export async function checkAdminAccess(ctx, commandName = 'هذا الأمر') {
  if (!isAdmin(ctx.from.id)) {
    const adminMessage = 
      `🔒 **وصول مقيد**\n\n` +
      `عذراً، ${commandName} متاح للمدراء فقط.\n\n` +
      `👤 **معلوماتك:**\n` +
      `🆔 معرف المستخدم: \`${ctx.from.id}\`\n` +
      `👤 الاسم: ${ctx.from.first_name || 'غير محدد'}\n\n` +
      `📞 **للحصول على صلاحيات المدير:**\n` +
      `اتصل بمدير النظام وأعطه معرف المستخدم أعلاه.`;
    
    await ctx.reply(adminMessage);
    return false;
  }
  return true;
}

// Get admin info for display
export function getAdminInfo() {
  const adminIds = process.env.ADMIN_IDS ? 
    process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim())) : [];
  
  return {
    count: adminIds.length,
    ids: adminIds,
    hasAdmins: adminIds.length > 0
  };
}