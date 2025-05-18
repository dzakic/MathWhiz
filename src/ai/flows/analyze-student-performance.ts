// use server'

/**
 * @fileOverview Analyzes student quiz performance to identify strengths and weaknesses.
 *
 * - analyzeStudentPerformance - A function that analyzes student quiz performance.
 * - AnalyzeStudentPerformanceInput - The input type for the analyzeStudentPerformance function.
 * - AnalyzeStudentPerformanceOutput - The return type for the analyzeStudentPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStudentPerformanceInputSchema = z.object({
  quizData: z.string().describe('A stringified JSON array of quiz questions and student answers.'),
  studentName: z.string().describe('The name of the student being analyzed.'),
});
export type AnalyzeStudentPerformanceInput = z.infer<typeof AnalyzeStudentPerformanceInputSchema>;

const AnalyzeStudentPerformanceOutputSchema = z.object({
  overallScore: z.number().describe('The overall score of the student on the quiz.'),
  strengths: z.string().describe('The identified strengths of the student.'),
  weaknesses: z.string().describe('The identified weaknesses of the student.'),
  topicsToFocusOn: z.string().describe('A list of topics the student should focus on to improve.'),
});
export type AnalyzeStudentPerformanceOutput = z.infer<typeof AnalyzeStudentPerformanceOutputSchema>;

export async function analyzeStudentPerformance(input: AnalyzeStudentPerformanceInput): Promise<AnalyzeStudentPerformanceOutput> {
  return analyzeStudentPerformanceFlow(input);
}

const analyzeStudentPerformancePrompt = ai.definePrompt({
  name: 'analyzeStudentPerformancePrompt',
  input: {schema: AnalyzeStudentPerformanceInputSchema},
  output: {schema: AnalyzeStudentPerformanceOutputSchema},
  prompt: `You are an AI expert in analyzing student performance on math quizzes.  You are provided with data from a quiz, including the student's answers.

  Analyze the quiz data for the student {{studentName}} and provide the following:

  - overallScore: The overall score of the student on the quiz.
  - strengths: Identified strengths of the student based on the quiz data.
  - weaknesses: Identified weaknesses of the student based on the quiz data.
  - topicsToFocusOn: A list of topics the student should focus on to improve their understanding and skills.

  Here is the quiz data:
  {{quizData}}`,
});

const analyzeStudentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeStudentPerformanceFlow',
    inputSchema: AnalyzeStudentPerformanceInputSchema,
    outputSchema: AnalyzeStudentPerformanceOutputSchema,
  },
  async input => {
    try {
      // Attempt to parse the quizData to ensure it's valid JSON.
      JSON.parse(input.quizData);
    } catch (e) {
      throw new Error('Invalid JSON format for quizData: ' + e);
    }

    const {output} = await analyzeStudentPerformancePrompt(input);
    return output!;
  }
);
