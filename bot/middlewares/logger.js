export default async (ctx, next) => {
  const start = new Date();
  const userId = ctx.from?.id;
  const username = ctx.from?.username || "unknown";
  const messageText = ctx.message?.text || "[non-text message]";
  
  console.log(`🔄 Request from ${username} (${userId}): ${messageText}`);
  
  await next();
  
  const ms = new Date() - start;
  console.log(`✅ Response time: ${ms}ms`);
};
