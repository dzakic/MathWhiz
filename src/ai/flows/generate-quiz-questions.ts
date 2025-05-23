
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating math quiz questions tailored to a specific topic and year level, including their correct answers.
 *
 * - generateQuizQuestions - A function that generates math quiz questions with answers.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The mathematical topic for which to generate quiz questions.'),
  numQuestions: z.number().describe('The number of quiz questions to generate.'),
  yearLevel: z.string().describe('The academic year level for the quiz questions (e.g., "Year 7", "Year 3").'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const QuizQuestionWithAnswerSchema = z.object({
  question: z.string().describe("The math quiz question."),
  correctAnswer: z.string().describe("The correct answer to the question.")
});

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(QuizQuestionWithAnswerSchema).describe('An array of math quiz questions, each with its correct answer.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const generateQuizQuestionsPrompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a math quiz question generator. Generate {{numQuestions}} math quiz questions suitable for {{yearLevel}} students, focusing on the topic of {{topic}}.
For each question, provide the question text and the correct answer.
Return the result as a JSON object with a single key "questions".
The value of "questions" should be an array of objects, where each object has two string properties: "question" and "correctAnswer".
Ensure the answers are concise and direct.
Example for {{yearLevel}} - {{topic}}: {"questions": [{"question": "What is 2+2?", "correctAnswer": "4"}, {"question": "What is 10/2?", "correctAnswer": "5"}]}`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateQuizQuestionsPrompt(input);
    if (!output?.questions || output.questions.length !== input.numQuestions) {
      console.error('AI did not return the expected number of questions or the format is incorrect.', output);
      throw new Error('Failed to generate the correct number of questions. The AI might have had an issue.');
    }
    for (const q of output.questions) {
      if (!q.question || !q.correctAnswer) {
        console.error('AI returned an empty question or answer.', q);
        throw new Error('AI returned an incomplete question or answer.');
      }
    }
    return output!;
  }
);
