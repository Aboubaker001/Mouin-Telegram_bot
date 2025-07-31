import { getActiveAssignments } from '../services/assignmentService.js';
import { formatDate } from '../utils/dateFormatter.js';

export default async (ctx) => {
  try {
    const assignments = getActiveAssignments();
    
    if (assignments.length === 0) {
      return ctx.reply("📝 لا توجد تكليفات نشطة حاليًا.");
    }

    let message = "📋 قائمة التكليفات النشطة:\n\n";
    
    assignments.forEach((assignment, index) => {
      const deadline = formatDate(new Date(assignment.deadline));
      const isCompleted = assignment.completedBy.includes(ctx.from.id);
      const status = isCompleted ? "✅ مكتمل" : "⏳ قيد التنفيذ";
      
      message += `${index + 1}. ${assignment.title}\n` +
                 `   📂 النوع: ${assignment.type}\n` +
                 `   ⏰ الموعد النهائي: ${deadline}\n` +
                 `   🔄 الحالة: ${status}\n` +
                 `   🆔 المعرف: ${assignment.id}\n\n`;
    });
    
    message += "لتأكيد إنجاز تكليف، استخدم الأمر: /done معرف_التكليف";
    
    ctx.reply(message);
  } catch (error) {
    console.error("Error in view command:", error);
    ctx.reply("❌ حدث خطأ أثناء عرض التكليفات. الرجاء المحاولة مرة أخرى.");
  }
};
