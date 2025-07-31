import { quizMessage } from '../helpers/messages.js';
import { isUserVerified } from '../services/userService.js';
import { errorMessages } from '../helpers/messages.js';
import { readJSON, writeJSON } from '../utils/database.js';
import config from '../../config.js';

const QUIZ_RESPONSES_FILE = './data/quiz_responses.json';

export default async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Check if user is verified
    if (!isUserVerified(userId)) {
      return ctx.reply(errorMessages.notVerified);
    }
    
    // Check if user has already taken the quiz today
    const responses = readJSON(QUIZ_RESPONSES_FILE, []);
    const today = new Date().toDateString();
    const userTodayResponse = responses.find(r => 
      r.userId === userId && new Date(r.date).toDateString() === today
    );
    
    if (userTodayResponse) {
      return ctx.reply("📝 لقد أجريت الاختبار اليوم بالفعل. يمكنك إعادة الاختبار غدًا!");
    }
    
    // Get first question
    const question = config.quiz.questions[0];
    const message = quizMessage(question, question.options);
    
    // Create inline keyboard for quiz options
    const keyboard = {
      inline_keyboard: question.options.map((option, index) => [
        { 
          text: `${index + 1}. ${option}`, 
          callback_data: `quiz_answer_${question.id}_${index}` 
        }
      ])
    };
    
    ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    
  } catch (error) {
    console.error("Error in quiz command:", error);
    ctx.reply("❌ حدث خطأ أثناء بدء الاختبار. الرجاء المحاولة مرة أخرى.");
  }
};

// Function to handle quiz answers
export async function handleQuizAnswer(ctx, questionId, answerIndex) {
  try {
    const userId = ctx.from.id;
    const question = config.quiz.questions.find(q => q.id === parseInt(questionId));
    
    if (!question) {
      return ctx.reply("❌ السؤال غير موجود.");
    }
    
    const isCorrect = answerIndex === question.correctAnswer;
    const correctAnswer = question.options[question.correctAnswer];
    
    // Save response
    const responses = readJSON(QUIZ_RESPONSES_FILE, []);
    responses.push({
      userId,
      questionId: parseInt(questionId),
      answerIndex: parseInt(answerIndex),
      isCorrect,
      date: new Date().toISOString()
    });
    writeJSON(QUIZ_RESPONSES_FILE, responses);
    
    // Send result message
    let resultMessage = isCorrect 
      ? "✅ إجابة صحيحة! أحسنت! 🎉"
      : `❌ إجابة خاطئة. الإجابة الصحيحة هي: ${correctAnswer}`;
    
    resultMessage += `\n\n📊 إحصائيات الاختبار:\n`;
    resultMessage += `- إجابات صحيحة: ${responses.filter(r => r.userId === userId && r.isCorrect).length}\n`;
    resultMessage += `- إجابات خاطئة: ${responses.filter(r => r.userId === userId && !r.isCorrect).length}\n`;
    
    // Check if there are more questions
    const currentQuestionIndex = config.quiz.questions.findIndex(q => q.id === parseInt(questionId));
    const nextQuestion = config.quiz.questions[currentQuestionIndex + 1];
    
    if (nextQuestion) {
      resultMessage += `\n📝 السؤال التالي:`;
      
      const keyboard = {
        inline_keyboard: nextQuestion.options.map((option, index) => [
          { 
            text: `${index + 1}. ${option}`, 
            callback_data: `quiz_answer_${nextQuestion.id}_${index}` 
          }
        ])
      };
      
      ctx.reply(resultMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } else {
      // Quiz completed
      const userResponses = responses.filter(r => r.userId === userId);
      const correctAnswers = userResponses.filter(r => r.isCorrect).length;
      const totalQuestions = config.quiz.questions.length;
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      
      resultMessage += `\n🎯 *الاختبار مكتمل!*\n`;
      resultMessage += `النتيجة: ${correctAnswers}/${totalQuestions} (${percentage}%)\n\n`;
      
      if (percentage >= 80) {
        resultMessage += `🌟 ممتاز! أداء رائع!`;
      } else if (percentage >= 60) {
        resultMessage += `👍 جيد! واصل التعلم!`;
      } else {
        resultMessage += `📚 راجع المواد التعليمية وحاول مرة أخرى!`;
      }
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: "📚 مراجعة المواد", callback_data: "content_all" },
            { text: "📊 إحصائياتي", callback_data: "my_stats" }
          ],
          [
            { text: "🔙 القائمة الرئيسية", callback_data: "main_menu" }
          ]
        ]
      };
      
      ctx.reply(resultMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
    
  } catch (error) {
    console.error("Error handling quiz answer:", error);
    ctx.reply("❌ حدث خطأ أثناء معالجة الإجابة. الرجاء المحاولة مرة أخرى.");
  }
}