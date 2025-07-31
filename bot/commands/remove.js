import { removeAssignment, getAllAssignments } from '../services/assignmentService.js';
import { checkAdminAccess } from '../middlewares/auth.js';
import { formatDate } from '../utils/dateFormatter.js';

export default async (ctx) => {
  try {
    // Check if user is admin
    const hasAccess = await checkAdminAccess(ctx, 'أمر حذف التكليفات');
    if (!hasAccess) return;

    const args = ctx.message.text.split(' ').slice(1).join(' ');
    
    if (!args) {
      const assignments = getAllAssignments();
      
      if (assignments.length === 0) {
        return ctx.reply(
          "📝 **لا توجد تكليفات للحذف**\n\n" +
          "لا توجد تكليفات حالياً في النظام."
        );
      }
      
      let message = "🗑️ **حذف تكليف**\n\n";
      message += "الرجاء تحديد رقم التكليف المراد حذفه:\n";
      message += "`/remove [رقم_التكليف]`\n\n";
      message += "**التكليفات المتاحة:**\n\n";
      
      assignments.forEach((assignment, index) => {
        const deadline = formatDate(new Date(assignment.deadline));
        const status = assignment.status === 'active' ? '🟢 نشط' : '🔴 منتهي';
        const completedCount = assignment.completedBy.length;
        
        message += `**${index + 1}.** ${assignment.title}\n`;
        message += `   📂 النوع: ${assignment.type}\n`;
        message += `   🆔 الرقم: \`${assignment.id}\`\n`;
        message += `   ⏰ الموعد: ${deadline}\n`;
        message += `   📊 الحالة: ${status}\n`;
        message += `   ✅ مكتمل: ${completedCount} طالب\n\n`;
      });
      
      message += "**مثال:** `/remove ${assignments[0].id}`";
      
      return ctx.reply(message);
    }

    const assignmentId = args.trim();
    
    // Find the assignment
    const assignments = getAllAssignments();
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      return ctx.reply(
        "❌ **تكليف غير موجود**\n\n" +
        `لم يتم العثور على تكليف برقم: \`${assignmentId}\`\n\n` +
        "استخدم `/remove` بدون معاملات لعرض قائمة التكليفات المتاحة."
      );
    }
    
    // Show assignment details and ask for confirmation
    const deadline = formatDate(new Date(assignment.deadline));
    const completedCount = assignment.completedBy.length;
    
    const confirmationMessage = 
      "⚠️ **تأكيد الحذف**\n\n" +
      "هل أنت متأكد من حذف هذا التكليف؟\n\n" +
      `📝 **العنوان:** ${assignment.title}\n` +
      `📂 **النوع:** ${assignment.type}\n` +
      `⏰ **الموعد النهائي:** ${deadline}\n` +
      `✅ **أكمله:** ${completedCount} طالب\n` +
      `👤 **أضافه:** ${assignment.createdByName || 'مجهول'}\n\n` +
      "**⚠️ تحذير:** هذا الإجراء لا يمكن التراجع عنه!\n\n" +
      `للتأكيد، اكتب: \`/confirm_remove ${assignmentId}\`\n` +
      "للإلغاء، اكتب: `/cancel`";
    
    await ctx.reply(confirmationMessage);
    
  } catch (error) {
    console.error("Error in remove command:", error);
    ctx.reply("❌ حدث خطأ أثناء محاولة حذف التكليف. الرجاء المحاولة مرة أخرى.");
  }
};

// Confirmation command for removing assignments
export async function confirmRemove(ctx) {
  try {
    // Check if user is admin
    const hasAccess = await checkAdminAccess(ctx, 'تأكيد حذف التكليف');
    if (!hasAccess) return;

    const args = ctx.message.text.split(' ').slice(1).join(' ');
    const assignmentId = args.trim();
    
    if (!assignmentId) {
      return ctx.reply("❌ يرجى تحديد رقم التكليف للحذف.");
    }
    
    const result = removeAssignment(assignmentId, ctx.from.id);
    
    if (result.success) {
      const assignment = result.assignment;
      const completedCount = assignment.completedBy.length;
      
      const successMessage = 
        "✅ **تم حذف التكليف بنجاح**\n\n" +
        `📝 **التكليف المحذوف:** ${assignment.title}\n` +
        `📂 **النوع:** ${assignment.type}\n` +
        `✅ **كان قد أكمله:** ${completedCount} طالب\n` +
        `👤 **حذفه:** ${ctx.from.first_name || 'مدير'}\n\n` +
        "تم إزالة التكليف من النظام نهائياً.";
      
      await ctx.reply(successMessage);
      
      // Log admin action
      console.log(`🗑️ Admin ${ctx.from.id} removed assignment: ${assignment.title} (ID: ${assignmentId})`);
    } else {
      await ctx.reply(`❌ **فشل في الحذف**\n\n${result.message}`);
    }
    
  } catch (error) {
    console.error("Error in confirm remove:", error);
    ctx.reply("❌ حدث خطأ أثناء تأكيد الحذف. الرجاء المحاولة مرة أخرى.");
  }
}
