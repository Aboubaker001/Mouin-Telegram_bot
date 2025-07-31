import { addAssignment } from '../services/assignmentService.js';
import { setUserState, getUserState, clearUserState } from '../utils/helpers.js';
import { checkAdminAccess } from '../middlewares/auth.js';

export default async (ctx) => {
  try {
    // Check if user is admin
    const hasAccess = await checkAdminAccess(ctx, 'أمر إضافة التكليفات');
    if (!hasAccess) return;

    const args = ctx.message.text.split(' ').slice(1).join(' ');
    
    if (!args) {
      // Set user state to expect assignment data
      setUserState(ctx.from.id, 'awaiting_assignment');
      
      return ctx.reply(
        "⚠️ **إضافة تكليف جديد**\n\n" +
        "الرجاء إدخال معلومات التكليف بالصيغة التالية:\n" +
        "`العنوان | النوع | الموعد النهائي`\n\n" +
        "**أمثلة:**\n" +
        "• `واجب الرياضيات | واجب | 2025-12-31 23:59`\n" +
        "• `مشاهدة درس أدب الطلب | درس | 2025-08-04 21:30`\n" +
        "• `كتابة تأمل | تأمل | 2025-08-05`\n\n" +
        "**صيغ التاريخ المقبولة:**\n" +
        "• `2025-08-04 21:30` - تاريخ ووقت\n" +
        "• `2025-08-04T21:30:00` - صيغة ISO\n" +
        "• `2025-08-04` - تاريخ فقط (سيتم تعيين الوقت إلى 23:59)\n\n" +
        "أو يمكنك كتابة الأمر كاملاً في رسالة واحدة:\n" +
        "`/add واجب الرياضيات | واجب | 2025-12-31 23:59`\n\n" +
        "اكتب `/cancel` للإلغاء"
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
    // Validate input format
    const parts = data.split('|').map(part => part.trim());
    
    if (parts.length < 3) {
      return ctx.reply(
        "⚠️ **صيغة غير مكتملة**\n\n" +
        "الرجاء إدخال جميع المعلومات المطلوبة:\n" +
        "`العنوان | النوع | الموعد النهائي`\n\n" +
        "**مثال صحيح:**\n" +
        "`واجب الرياضيات | واجب | 2025-12-31 23:59`"
      );
    }

    const [title, type, deadline] = parts;
    
    // Validate title
    if (title.length < 3) {
      return ctx.reply("⚠️ عنوان التكليف يجب أن يكون 3 أحرف على الأقل");
    }
    
    if (title.length > 100) {
      return ctx.reply("⚠️ عنوان التكليف طويل جداً (الحد الأقصى 100 حرف)");
    }
    
    // Validate type
    const validTypes = ['واجب', 'درس', 'تأمل', 'بحث', 'مراجعة', 'اختبار', 'مشروع', 'قراءة'];
    if (!validTypes.includes(type)) {
      return ctx.reply(
        "⚠️ **نوع التكليف غير صحيح**\n\n" +
        "الأنواع المقبولة:\n" +
        validTypes.map(t => `• ${t}`).join('\n') + "\n\n" +
        "أو يمكنك استخدام أي نوع آخر مناسب"
      );
    }
    
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

    // Validate deadline
    if (isNaN(deadlineDate.getTime())) {
      return ctx.reply(
        "⚠️ **تاريخ غير صالح**\n\n" +
        "الرجاء استخدام إحدى الصيغ التالية:\n" +
        "• `2025-08-04 21:30` - تاريخ ووقت\n" +
        "• `2025-08-04T21:30:00` - صيغة ISO\n" +
        "• `2025-08-04` - تاريخ فقط (سيتم تعيين الوقت إلى 23:59)\n\n" +
        "**مثال صحيح:** `2025-08-04 21:30`"
      );
    }
    
    // Check if deadline is in the past
    if (deadlineDate < new Date()) {
      return ctx.reply(
        "⚠️ **الموعد النهائي في الماضي**\n\n" +
        "الرجاء تحديد موعد نهائي في المستقبل.\n" +
        `التاريخ الحالي: ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`
      );
    }

    const assignment = {
      id: Date.now().toString(),
      title,
      type,
      deadline: deadlineDate.toISOString(),
      createdBy: ctx.from.id,
      createdByName: ctx.from.first_name || ctx.from.username || 'مدير',
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
      
      const successMessage = 
        "✅ **تم إضافة التكليف بنجاح!**\n\n" +
        `📝 **العنوان:** ${title}\n` +
        `📂 **النوع:** ${type}\n` +
        `⏰ **الموعد النهائي:** ${deadlineFormatted}\n` +
        `🆔 **رقم التكليف:** ${assignment.id}\n` +
        `👤 **أضافه:** ${assignment.createdByName}\n\n` +
        "سيتم إرسال تذكيرات تلقائية للطلاب قبل الموعد النهائي.";
      
      await ctx.reply(successMessage);
      
      // Log admin action
      console.log(`✅ Admin ${ctx.from.id} added assignment: ${title}`);
    } else {
      ctx.reply("❌ حدث خطأ أثناء حفظ التكليف. الرجاء المحاولة مرة أخرى.");
    }
  } catch (error) {
    console.error("Error processing assignment data:", error);
    ctx.reply("❌ حدث خطأ أثناء معالجة البيانات. الرجاء التحقق من الصيغة والمحاولة مرة أخرى.");
  }
}
