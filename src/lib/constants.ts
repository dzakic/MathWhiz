export const MATH_TOPICS = ["Algebra", "Geometry", "Arithmetic", "Percentages", "Fractions"] as const;
export type MathTopic = typeof MATH_TOPICS[number];

export const NUM_QUESTIONS_OPTIONS = [5, 10, 15] as const;
export type NumQuestionsOption = typeof NUM_QUESTIONS_OPTIONS[number];

export const LOCAL_STORAGE_PROGRESS_KEY = 'mathWhizProgress';
export const LOCAL_STORAGE_CURRENT_RESULT_KEY = 'mathWhizCurrentResult';

export const STUDENT_NAME = "Math Whiz User";
