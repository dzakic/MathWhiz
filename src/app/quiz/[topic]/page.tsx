
// @/app/quiz/[topic]/page.tsx
import { Suspense } from 'react';
import { generateQuestionsAction } from "@/actions/quizActions";
import { QuizForm } from "@/components/quiz/quiz-form";
import { MATH_TOPICS, MathTopic, NUM_QUESTIONS_OPTIONS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { QuestionWithAnswer } from '@/types';

interface QuizPageParams {
  topic: string;
}

interface QuizPageProps {
  params: QuizPageParams; // This type describes the resolved shape
  searchParams: { [key: string]: string | string[] | undefined }; // This type describes the resolved shape
}

async function QuizContent({ topic, numQuestions }: { topic: MathTopic, numQuestions: number }) {
  try {
    const { questions }: { questions: QuestionWithAnswer[] } = await generateQuestionsAction(topic, numQuestions);
    if (!questions || questions.length === 0) {
      return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load questions for {topic}. The AI might be busy or the topic might not have generated questions. Please try again later or select a different topic.</p>
          </CardContent>
        </Card>
      );
    }
    // Additional check for malformed questions (e.g. missing question text or answer)
    if (questions.some(q => !q.question || !q.correctAnswer)) {
       return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Some questions for {topic} were not generated correctly by the AI. Please try again later or select a different topic.</p>
          </CardContent>
        </Card>
      );
    }
    return <QuizForm topic={topic} initialQuestions={questions} numQuestions={numQuestions} />;
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
          <p>An unexpected error occurred while loading questions for {topic}: {(error as Error).message || "Unknown error"}. Please try refreshing the page or select a different topic.</p>
        </CardContent>
      </Card>
    );
  }
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  // Await params and searchParams before accessing their properties
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const topicParam = resolvedParams.topic.charAt(0).toUpperCase() + resolvedParams.topic.slice(1);
  const numQuestionsParam = resolvedSearchParams.numQuestions
    ? parseInt(resolvedSearchParams.numQuestions as string)
    : NUM_QUESTIONS_OPTIONS[0];

  if (!MATH_TOPICS.includes(topicParam as MathTopic)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Invalid Topic</h1>
        <p>The selected topic "{topicParam}" is not recognized.</p>
      </div>
    );
  }
  
  const topic = topicParam as MathTopic;
  const numQuestions = NUM_QUESTIONS_OPTIONS.includes(numQuestionsParam as any) ? numQuestionsParam : NUM_QUESTIONS_OPTIONS[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardHeader><CardTitle>Loading Quiz...</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      }>
        <QuizContent topic={topic} numQuestions={numQuestions} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: QuizPageProps) {
  // Await params before accessing its properties
  const resolvedParams = await params;
  const topic = resolvedParams.topic.charAt(0).toUpperCase() + resolvedParams.topic.slice(1);
  return {
    title: `Math Whiz Quiz: ${topic}`,
    description: `Take a math quiz on ${topic}.`,
  };
}
