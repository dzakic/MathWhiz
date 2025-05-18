import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-student-performance.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/generate-math-whiz-image-flow.ts'; // Added new flow
