import { addAssignment } from '../services/assignmentService.js';

export default async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1).join(' ');
    
    if (!args) {
      return ctx.reply(
        "⚠️ الرجاء إدخال معلومات التكليف بالصيغة التالية:\n" +
        "/add العنوان | النوع | الموعد النهائي\n" +
        "مثال: /add واجب الرياضيات | واجب | 2023-12-31 23:59"
      );
    }

    const parts = args.split('|').map(part => part.trim());
    
    if (parts.length < 3) {
      return ctx.reply("⚠️ الرجاء إدخال جميع المعلومات المطلوبة: العنوان | النوع | الموعد النهائي");
    }

    const [title, type, deadline] = parts;
    const deadlineDate = new Date(deadline);

    if (isNaN(deadlineDate.getTime())) {
      return ctx.reply("⚠️ تاريخ غير صالح. الرجاء استخدام الصيغة: YYYY-MM-DD HH:MM");
    }

    const assignment = {
      id: Date.now().toString(),
      title,
      type,
      deadline: deadlineDate.toISOString(),
      createdBy: ctx.from.id,
      createdAt: new Date().toISOString(),
      completedBy: []
    };

    addAssignment(assignment);
    
    ctx.reply(
      "✅ تم إضافة التكليف بنجاح!\n" +
      `📝 العنوان: ${title}\n` +
      `📂 النوع: ${type}\n` +
      `⏰ الموعد النهائي: ${deadline}`
    );
  } catch (error) {
    console.error("Error in add command:", error);
    ctx.reply("❌ حدث خطأ أثناء إضافة التكليف. الرجاء المحاولة مرة أخرى.");
  }
};
