
import type { MathTopic, YearLevel } from "@/lib/constants"; // Added YearLevel

export interface QuestionWithAnswer {
  question: string;
  correctAnswer: string;
}

export interface QuizQuestionFormat {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
}

export interface DetailedQuestionAnalysisItem {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isStudentAnswerCorrect: boolean;
}

export interface AnalyzeStudentPerformanceOutput {
  overallScore: number;
  strengths: string;
  weaknesses: string;
  topicsToFocusOn: string;
  detailedQuestionAnalysis: DetailedQuestionAnalysisItem[];
}

export interface CurrentQuizData {
  topic: MathTopic;
  yearLevel: YearLevel; // Added yearLevel
  numQuestions: number;
  questions: QuestionWithAnswer[]; 
  answers: string[];
  studentName: string;
}

export interface QuizAttempt { // Omit removed, explicitly define fields
  id: string;
  date: string; // ISO string
  topic: MathTopic;
  yearLevel: YearLevel; // Added yearLevel
  numQuestions: number;
  questions: QuestionWithAnswer[];
  answers: string[];
  studentName: string;
  analysis: AnalyzeStudentPerformanceOutput;
}
