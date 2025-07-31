import { markAssignmentAsDone } from '../services/assignmentService.js';

export default async (ctx) => {
  try {
    const assignmentId = ctx.message.text.split(' ')[1];
    
    if (!assignmentId) {
      return ctx.reply("⚠️ الرجاء تحديد معرف التكليف. مثال: /done 123456789");
    }

    const result = markAssignmentAsDone(assignmentId, ctx.from.id);
    
    if (result.success) {
      ctx.reply(`✅ تم تأكيد إنجاز التكليف: ${result.assignment.title}`);
    } else {
      ctx.reply(`❌ ${result.message}`);
    }
  } catch (error) {
    console.error("Error in done command:", error);
    ctx.reply("❌ حدث خطأ أثناء تأكيد إنجاز التكليف. الرجاء المحاولة مرة أخرى.");
  }
};
