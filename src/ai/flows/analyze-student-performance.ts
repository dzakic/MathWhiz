// use server'

/**
 * @fileOverview Analyzes student quiz performance to identify strengths and weaknesses, using correct answers for scoring
 * and providing a detailed per-question correctness assessment.
 *
 * - analyzeStudentPerformance - A function that analyzes student quiz performance.
 * - AnalyzeStudentPerformanceInput - The input type for the analyzeStudentPerformance function.
 * - AnalyzeStudentPerformanceOutput - The return type for the analyzeStudentPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { QuizQuestionFormat } from '@/types'; // For type checking parsed quizData

const AnalyzeStudentPerformanceInputSchema = z.object({
  quizData: z.string().describe('A stringified JSON array of quiz items. Each item should be an object with "question" (string), "studentAnswer" (string), and "correctAnswer" (string) properties.'),
  studentName: z.string().describe('The name of the student being analyzed.'),
});
export type AnalyzeStudentPerformanceInput = z.infer<typeof AnalyzeStudentPerformanceInputSchema>;

const QuestionAnalysisSchema = z.object({
  question: z.string().describe("The original quiz question."),
  studentAnswer: z.string().describe("The student's answer to the question."),
  correctAnswer: z.string().describe("The correct answer to the question."),
  isStudentAnswerCorrect: z.boolean().describe("True if the AI, using flexible comparison, deemed the student's answer correct; false otherwise.")
});

const AnalyzeStudentPerformanceOutputSchema = z.object({
  overallScore: z.number().describe('The overall score of the student on the quiz, calculated as (correct answers / total questions) * 100, rounded to the nearest integer.'),
  strengths: z.string().describe('The identified strengths of the student based on correctly answered questions and topics.'),
  weaknesses: z.string().describe('The identified weaknesses of the student based on incorrectly answered questions and topics.'),
  topicsToFocusOn: z.string().describe('A list of topics or concepts the student should focus on to improve their understanding and skills, based on their errors.'),
  detailedQuestionAnalysis: z.array(QuestionAnalysisSchema).describe("An array containing the analysis for each question, including the original question, student's answer, correct answer, and whether the student's answer was deemed correct by the AI's flexible logic.")
});
export type AnalyzeStudentPerformanceOutput = z.infer<typeof AnalyzeStudentPerformanceOutputSchema>;

export async function analyzeStudentPerformance(input: AnalyzeStudentPerformanceInput): Promise<AnalyzeStudentPerformanceOutput> {
  return analyzeStudentPerformanceFlow(input);
}

const analyzeStudentPerformancePrompt = ai.definePrompt({
  name: 'analyzeStudentPerformancePrompt',
  input: {schema: AnalyzeStudentPerformanceInputSchema},
  output: {schema: AnalyzeStudentPerformanceOutputSchema},
  prompt: `You are an AI expert in analyzing student performance on math quizzes. You are provided with data from a quiz, including the student's answers and the correct answers for each question. Speak directly to the student ({{studentName}}) when identifying strengths and weaknesses.

The quiz data is a JSON array of objects, where each object contains "question", "studentAnswer", and "correctAnswer".

Your tasks are:
1.  **Analyze Each Question**: For each question provided in the \`quizData\`:
    *   Compare the "studentAnswer" to the "correctAnswer".
    *   For numerical answers, be flexible. Consider the answer correct if the core numerical value is the same, even if there are minor differences in formatting (e.g., "4" vs "4.0" or "4.00"), inclusion/omission of units (e.g., "180" vs "180 degrees", "5cm" vs "5 cm" vs "5"), or slight variations in wording that don't change the mathematical meaning.
    *   For algebraic expressions or formulas (like 'pir2' vs 'πr²' or 'a2+b2=c2' vs 'a² + b² = c²'), recognize common equivalent forms. Treat \`pi\` and \`π\` as equivalent. Treat \`x2\` and \`x²\` as equivalent (and similarly for other simple powers if possible, like x3 vs x³). Ignore minor spacing differences unless they change the mathematical meaning.
    *   Treat comparisons as case-insensitive where appropriate (e.g., for textual parts of an answer).
    *   Determine if the student's answer is correct based on this flexible comparison and set the 'isStudentAnswerCorrect' boolean flag for it in the 'detailedQuestionAnalysis' array.
2.  **Calculate Overall Score**: Based on the number of questions deemed correct in step 1 (from the 'isStudentAnswerCorrect' flags), calculate the overall score: (number of correct student answers / total number of questions) * 100. Round this score to the nearest integer.
3.  **Identify Strengths**: Based on the questions answered correctly (using the flexible comparison rules from step 1), describe the student's strengths. Mention specific topics or types of problems if a pattern emerges.
4.  **Identify Weaknesses**: Based on the questions answered incorrectly (using the flexible comparison rules from step 1), describe the student's weaknesses. Mention specific topics or types of problems where the student struggled.
5.  **Suggest Topics to Focus On**: Provide a concise list of topics or concepts the student should focus on to improve their understanding and skills, directly derived from their incorrect answers.

Here is the quiz data:
{{quizData}}

Respond with a JSON object matching the defined output schema. Ensure the \`detailedQuestionAnalysis\` array contains an entry for *each* question from the input \`quizData\`, preserving the original order. Each entry in \`detailedQuestionAnalysis\` must include the original "question", "studentAnswer", "correctAnswer", and the "isStudentAnswerCorrect" boolean flag you determined.`,
});

const analyzeStudentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeStudentPerformanceFlow',
    inputSchema: AnalyzeStudentPerformanceInputSchema,
    outputSchema: AnalyzeStudentPerformanceOutputSchema,
  },
  async input => {
    let parsedQuizData: QuizQuestionFormat[];
    try {
      parsedQuizData = JSON.parse(input.quizData) as QuizQuestionFormat[];
      if (!Array.isArray(parsedQuizData) || parsedQuizData.some(item =>
        typeof item.question !== 'string' ||
        typeof item.studentAnswer !== 'string' ||
        typeof item.correctAnswer !== 'string'
      )) {
        throw new Error('quizData is not an array or its items do not have the required string properties: question, studentAnswer, correctAnswer.');
      }
    } catch (e) {
      console.error("Error parsing or validating quizData in analyzeStudentPerformanceFlow:", e);
      throw new Error('Invalid JSON format or structure for quizData: ' + (e as Error).message);
    }

    const {output} = await analyzeStudentPerformancePrompt(input);
    if (output === undefined || output === null) {
      throw new Error('AI analysis returned undefined or null output.');
    }
    if (!output.detailedQuestionAnalysis || !Array.isArray(output.detailedQuestionAnalysis) || output.detailedQuestionAnalysis.length !== parsedQuizData.length) {
      console.error("AI output for detailedQuestionAnalysis is missing, not an array, or does not match the number of input questions.", output);
      throw new Error("AI analysis for detailed questions is incomplete or malformed.");
    }
    // Further validation for the content of detailedQuestionAnalysis
    for (const item of output.detailedQuestionAnalysis) {
        if (typeof item.question !== 'string' ||
            typeof item.studentAnswer !== 'string' ||
            typeof item.correctAnswer !== 'string' ||
            typeof item.isStudentAnswerCorrect !== 'boolean') {
            console.error("Invalid item structure in detailedQuestionAnalysis from AI.", item);
            throw new Error("AI returned malformed item in detailed question analysis.");
        }
    }

    return output;
  }
);
