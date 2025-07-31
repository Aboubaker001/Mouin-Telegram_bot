import { removeAssignment } from '../services/assignmentService.js';

export default async (ctx) => {
  try {
    const assignmentId = ctx.message.text.split(' ')[1];
    
    if (!assignmentId) {
      return ctx.reply("⚠️ الرجاء تحديد معرف التكليف. مثال: /remove 123456789");
    }

    const result = removeAssignment(assignmentId, ctx.from.id);
    
    if (result.success) {
      ctx.reply(`✅ تم حذف التكليف: ${result.assignment.title}`);
    } else {
      ctx.reply(`❌ ${result.message}`);
    }
  } catch (error) {
    console.error("Error in remove command:", error);
    ctx.reply("❌ حدث خطأ أثناء حذف التكليف. الرجاء المحاولة مرة أخرى.");
  }
};
