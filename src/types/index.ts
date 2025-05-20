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

// Represents the structure of each item in the detailed analysis from the AI
export interface DetailedQuestionAnalysisItem {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isStudentAnswerCorrect: boolean;
}

// Updated AI output structure
export interface AnalyzeStudentPerformanceOutput {
  overallScore: number;
  strengths: string;
  weaknesses: string;
  topicsToFocusOn: string;
  detailedQuestionAnalysis: DetailedQuestionAnalysisItem[];
}

export interface CurrentQuizData {
  topic: MathTopic;
  numQuestions: number;
  questions: QuestionWithAnswer[]; 
  answers: string[]; // Stores student's answers
  studentName: string;
}

export interface QuizAttempt extends Omit<CurrentQuizData, 'studentName'> { // studentName is part of CurrentQuizData, but often less relevant for long-term storage unless multiple users are tracked
  id: string;
  date: string; // ISO string
  analysis: AnalyzeStudentPerformanceOutput; // This will now have the detailed structure
  studentName: string; // Explicitly include if needed per attempt record
}
