
// @/actions/quizActions.ts
"use server";

import { generateQuizQuestions as genkitGenerateQuizQuestions } from "@/ai/flows/generate-quiz-questions";
import type { GenerateQuizQuestionsInput, GenerateQuizQuestionsOutput } from "@/ai/flows/generate-quiz-questions";
import { analyzeStudentPerformance as genkitAnalyzeStudentPerformance } from "@/ai/flows/analyze-student-performance";
import type { AnalyzeStudentPerformanceInput, AnalyzeStudentPerformanceOutput } from "@/ai/flows/analyze-student-performance";
import type { MathTopic, YearLevel } from "@/lib/constants";

export async function generateQuestionsAction(
  topic: MathTopic,
  numQuestions: number,
  yearLevel: YearLevel
): Promise<GenerateQuizQuestionsOutput> {
  const input: GenerateQuizQuestionsInput = { topic, numQuestions, yearLevel };
  try {
    const result = await genkitGenerateQuizQuestions(input);
    return result;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz questions. Please try again.");
  }
}

export async function analyzePerformanceAction(
  quizData: string, // JSON string of { question: string, studentAnswer: string, correctAnswer: string }[]
  studentName: string
  // yearLevel could be added here if analysis needs to be year-specific beyond the questions themselves
): Promise<AnalyzeStudentPerformanceOutput> {
  const input: AnalyzeStudentPerformanceInput = { quizData, studentName };
  try {
    const result = await genkitAnalyzeStudentPerformance(input);
    return result;
  } catch (error) {
    console.error("Error analyzing student performance:", error);
    throw new Error("Failed to analyze performance. Please try again.");
  }
}
