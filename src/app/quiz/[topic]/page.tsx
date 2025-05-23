
// @/app/quiz/[topic]/page.tsx
import { Suspense } from 'react';
import { generateQuestionsAction } from "@/actions/quizActions";
import { QuizForm } from "@/components/quiz/quiz-form";
import { MATH_TOPICS, MathTopic, NUM_QUESTIONS_OPTIONS, YEAR_LEVELS, YearLevel } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { QuestionWithAnswer } from '@/types';

interface QuizPageParams {
  topic: string;
}

interface QuizPageProps {
  params: QuizPageParams;
  searchParams: { [key: string]: string | string[] | undefined };
}

async function QuizContent({ topic, numQuestions, yearLevel }: { topic: MathTopic, numQuestions: number, yearLevel: YearLevel }) {
  try {
    const { questions }: { questions: QuestionWithAnswer[] } = await generateQuestionsAction(topic, numQuestions, yearLevel);
    if (!questions || questions.length === 0) {
      return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load questions for {yearLevel} - {topic}. The AI might be busy or the topic might not have generated questions. Please try again later or select a different topic/year.</p>
          </CardContent>
        </Card>
      );
    }
    if (questions.some(q => !q.question || !q.correctAnswer)) {
       return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Some questions for {yearLevel} - {topic} were not generated correctly by the AI. Please try again later or select a different topic/year.</p>
          </CardContent>
        </Card>
      );
    }
    return <QuizForm topic={topic} initialQuestions={questions} numQuestions={numQuestions} yearLevel={yearLevel} />;
  } catch (error) {
    console.error("Failed to load quiz questions:", error);
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
           <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Quiz
            </CardTitle>
        </CardHeader>
        <CardContent>
          <p>An unexpected error occurred while loading questions for {yearLevel} - {topic}: {(error as Error).message || "Unknown error"}. Please try refreshing the page or select a different topic/year.</p>
        </CardContent>
      </Card>
    );
  }
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const topicParam = resolvedParams.topic.charAt(0).toUpperCase() + resolvedParams.topic.slice(1);
  const numQuestionsParam = resolvedSearchParams.numQuestions
    ? parseInt(resolvedSearchParams.numQuestions as string)
    : NUM_QUESTIONS_OPTIONS[0];
  const yearLevelParam = resolvedSearchParams.year as string;

  if (!MATH_TOPICS.includes(topicParam as MathTopic)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Invalid Topic</h1>
        <p>The selected topic "{topicParam}" is not recognized.</p>
      </div>
    );
  }
  
  if (!yearLevelParam || !YEAR_LEVELS.includes(yearLevelParam as YearLevel)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Invalid Year Level</h1>
        <p>The selected year level "{yearLevelParam}" is not recognized.</p>
      </div>
    );
  }
  
  const topic = topicParam as MathTopic;
  const numQuestions = NUM_QUESTIONS_OPTIONS.includes(numQuestionsParam as any) ? numQuestionsParam : NUM_QUESTIONS_OPTIONS[0];
  const yearLevel = yearLevelParam as YearLevel;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader><CardTitle>Loading Quiz for {yearLevel} - {topic}...</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      }>
        <QuizContent topic={topic} numQuestions={numQuestions} yearLevel={yearLevel} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params, searchParams }: QuizPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const topic = resolvedParams.topic.charAt(0).toUpperCase() + resolvedParams.topic.slice(1);
  const yearLevel = resolvedSearchParams.year as string || "Selected Year";
  return {
    title: `Math Whiz Quiz: ${yearLevel} - ${topic}`,
    description: `Take a ${yearLevel} math quiz on ${topic}.`,
  };
}
