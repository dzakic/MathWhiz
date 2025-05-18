import type { AnalyzeStudentPerformanceOutput } from "@/ai/flows/analyze-student-performance";
import type { MathTopic } from "@/lib/constants";

export interface QuestionWithAnswer {
  question: string;
  correctAnswer: string;
}

export interface QuizQuestionFormat { // Used for sending data to analysis AI
  question: string;
  studentAnswer: string;
  correctAnswer: string;
}

export interface CurrentQuizData {
  topic: MathTopic;
  numQuestions: number;
  questions: QuestionWithAnswer[]; // Now stores questions with their correct answers
  answers: string[]; // Stores student's answers
  studentName: string;
}

export interface QuizAttempt extends CurrentQuizData {
  id: string;
  date: string; // ISO string
  analysis: AnalyzeStudentPerformanceOutput;
}
