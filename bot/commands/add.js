import { addAssignment } from '../services/assignmentService.js';
import { setUserState, getUserState, clearUserState } from '../utils/helpers.js';

export default async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1).join(' ');
    
    if (!args) {
      // Set user state to expect assignment data
      setUserState(ctx.from.id, 'awaiting_assignment');
      
      return ctx.reply(
        "⚠️ الرجاء إدخال معلومات التكليف بالصيغة التالية:\n" +
        "العنوان | النوع | الموعد النهائي\n" +
        "مثال: واجب الرياضيات | واجب | 2025-12-31 23:59\n\n" +
        "أو يمكنك كتابة الأمر كاملاً في رسالة واحدة:\n" +
        "/add واجب الرياضيات | واجب | 2025-12-31 23:59"
      );
    }

    // Process the assignment data
    await processAssignmentData(ctx, args);
    
  } catch (error) {
    console.error("Error in add command:", error);
    ctx.reply("❌ حدث خطأ أثناء إضافة التكليف. الرجاء المحاولة مرة أخرى.");
  }
};

export async function processAssignmentData(ctx, data) {
  try {
    const parts = data.split('|').map(part => part.trim());
    
    if (parts.length < 3) {
      return ctx.reply("⚠️ الرجاء إدخال جميع المعلومات المطلوبة: العنوان | النوع | الموعد النهائي");
    }

    const [title, type, deadline] = parts;
    
    // Handle different deadline formats
    let deadlineDate;
    if (deadline.includes('T')) {
      // ISO format: 2025-08-04T21:30:00
      deadlineDate = new Date(deadline);
    } else if (deadline.includes(' ')) {
      // Format: 2025-08-04 21:30
      deadlineDate = new Date(deadline.replace(' ', 'T') + ':00');
    } else {
      // Date only: 2025-08-04 (default to 23:59)
      deadlineDate = new Date(deadline + 'T23:59:00');
    }

    if (isNaN(deadlineDate.getTime())) {
      return ctx.reply(
        "⚠️ تاريخ غير صالح. الرجاء استخدام إحدى الصيغ التالية:\n" +
        "• 2025-08-04 21:30\n" +
        "• 2025-08-04T21:30:00\n" +
        "• 2025-08-04 (سيتم تعيين الوقت إلى 23:59)"
      );
    }

    const assignment = {
      id: Date.now().toString(),
      title,
      type,
      deadline: deadlineDate.toISOString(),
      createdBy: ctx.from.id,
      createdByName: ctx.from.first_name || ctx.from.username || 'مجهول',
      createdAt: new Date().toISOString(),
      completedBy: [],
      status: 'active'
    };

    const success = await addAssignment(assignment);
    
    if (success) {
      // Clear user state
      clearUserState(ctx.from.id);
      
      // Format deadline for display
      const deadlineFormatted = deadlineDate.toLocaleString('ar-EG', {
        timeZone: 'Africa/Cairo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      ctx.reply(
        "✅ تم إضافة التكليف بنجاح!\n\n" +
        `📝 العنوان: ${title}\n` +
        `📂 النوع: ${type}\n` +
        `⏰ الموعد النهائي: ${deadlineFormatted}\n` +
        `🆔 رقم التكليف: ${assignment.id}`
      );
    } else {
      ctx.reply("❌ حدث خطأ أثناء حفظ التكليف. الرجاء المحاولة مرة أخرى.");
    }
  } catch (error) {
    console.error("Error processing assignment data:", error);
    ctx.reply("❌ حدث خطأ أثناء معالجة البيانات. الرجاء التحقق من الصيغة والمحاولة مرة أخرى.");
  }
}
