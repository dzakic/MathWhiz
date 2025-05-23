
export const MATH_TOPICS = ["Algebra", "Geometry", "Arithmetic", "Percentages", "Fractions", "Problem Solving", "Measurement"] as const; // Added more topics
export type MathTopic = typeof MATH_TOPICS[number];

export const YEAR_LEVELS = ["Year 3", "Year 5", "Year 7", "Year 9"] as const;
export type YearLevel = typeof YEAR_LEVELS[number];

export const NUM_QUESTIONS_OPTIONS = [5, 10, 15] as const;
export type NumQuestionsOption = typeof NUM_QUESTIONS_OPTIONS[number];

export const LOCAL_STORAGE_PROGRESS_KEY = 'mathWhizProgress';
export const LOCAL_STORAGE_CURRENT_RESULT_KEY = 'mathWhizCurrentResult';

export const STUDENT_NAME = "Math Whiz User";
