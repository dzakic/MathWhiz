// @/app/quiz/results/page.tsx
import { QuizResultsDisplay } from "@/components/quiz/quiz-results-display";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz Results - Math Whiz',
  description: 'View your math quiz performance and AI-powered analysis.',
};

export default function QuizResultsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <QuizResultsDisplay />
    </div>
  );
}
