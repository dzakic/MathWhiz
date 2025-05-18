import type { AnalyzeStudentPerformanceOutput } from "@/ai/flows/analyze-student-performance";
import type { MathTopic } from "@/lib/constants";

export interface QuizQuestionFormat {
  question: string;
  studentAnswer: string;
}

export interface CurrentQuizData {
  topic: MathTopic;
  numQuestions: number;
  questions: string[];
  answers: string[];
  studentName: string;
}

export interface QuizAttempt extends CurrentQuizData {
  id: string;
  date: string; // ISO string
  analysis: AnalyzeStudentPerformanceOutput;
}
