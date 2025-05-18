// use server'

/**
 * @fileOverview Analyzes student quiz performance to identify strengths and weaknesses, using correct answers for scoring.
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

const AnalyzeStudentPerformanceOutputSchema = z.object({
  overallScore: z.number().describe('The overall score of the student on the quiz, calculated as (correct answers / total questions) * 100, rounded to the nearest integer.'),
  strengths: z.string().describe('The identified strengths of the student based on correctly answered questions and topics.'),
  weaknesses: z.string().describe('The identified weaknesses of the student based on incorrectly answered questions and topics.'),
  topicsToFocusOn: z.string().describe('A list of topics or concepts the student should focus on to improve their understanding and skills, based on their errors.'),
});
export type AnalyzeStudentPerformanceOutput = z.infer<typeof AnalyzeStudentPerformanceOutputSchema>;

export async function analyzeStudentPerformance(input: AnalyzeStudentPerformanceInput): Promise<AnalyzeStudentPerformanceOutput> {
  return analyzeStudentPerformanceFlow(input);
}

const analyzeStudentPerformancePrompt = ai.definePrompt({
  name: 'analyzeStudentPerformancePrompt',
  input: {schema: AnalyzeStudentPerformanceInputSchema},
  output: {schema: AnalyzeStudentPerformanceOutputSchema},
  prompt: `You are an AI expert in analyzing student performance on math quizzes. You are provided with data from a quiz, including the student's answers and the correct answers for each question. Speak directly to the student when identifying strengths and weaknesses.

Analyze the quiz data for the student {{studentName}}. The quiz data is a JSON array of objects, where each object contains "question", "studentAnswer", and "correctAnswer".

Your tasks are:
1.  **Calculate Overall Score**: Determine the number of questions the student answered correctly by comparing their "studentAnswer" to the "correctAnswer" for each question. The score should be (number of correct student answers / total number of questions) * 100. Round this score to the nearest integer. For comparison, treat answers as case-insensitive if appropriate for math (e.g. "4" is same as "4.0", but be strict with wording if it's not a numerical answer). Be reasonably flexible with minor formatting differences in numerical answers if the mathematical value is the same (e.g. "5.0" vs "5").
2.  **Identify Strengths**: Based on the questions answered correctly, describe the student's strengths. Mention specific topics or types of problems if a pattern emerges.
3.  **Identify Weaknesses**: Based on the questions answered incorrectly, describe the student's weaknesses. Mention specific topics or types of problems where the student struggled.
4.  **Suggest Topics to Focus On**: Provide a concise list of topics or concepts the student should focus on to improve their understanding and skills, directly derived from their incorrect answers.

Here is the quiz data:
{{quizData}}

Respond with a JSON object matching the defined output schema.`,
});

const analyzeStudentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeStudentPerformanceFlow',
    inputSchema: AnalyzeStudentPerformanceInputSchema,
    outputSchema: AnalyzeStudentPerformanceOutputSchema,
  },
  async input => {
    try {
      // Attempt to parse the quizData and validate its structure.
      const parsedQuizData = JSON.parse(input.quizData) as QuizQuestionFormat[];
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
    return output;
  }
);
