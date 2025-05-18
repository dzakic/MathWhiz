
// @/components/quiz/quiz-results-display.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Award, Home, Lightbulb, Loader2, RotateCcw, Target, TrendingDown, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { LOCAL_STORAGE_CURRENT_RESULT_KEY, LOCAL_STORAGE_PROGRESS_KEY } from "@/lib/constants";
import type { QuizAttempt, CurrentQuizData, QuestionWithAnswer } from "@/types";
import type { AnalyzeStudentPerformanceOutput } from "@/ai/flows/analyze-student-performance";

interface StoredResultData extends Omit<CurrentQuizData, 'questions'> {
  questions: QuestionWithAnswer[];
  analysis: AnalyzeStudentPerformanceOutput;
}

export function QuizResultsDisplay() {
  const [result, setResult] = useState<StoredResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedResult = localStorage.getItem(LOCAL_STORAGE_CURRENT_RESULT_KEY);
    if (storedResult) {
      try {
        const parsedResult: StoredResultData = JSON.parse(storedResult);
        if (!Array.isArray(parsedResult.questions) || !parsedResult.questions.every(q => typeof q.question === 'string' && typeof q.correctAnswer === 'string')) {
          throw new Error("Malformed question data in stored results.");
        }
        setResult(parsedResult);

        const newAttempt: QuizAttempt = {
          ...parsedResult,
          id: new Date().toISOString() + Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString(),
        };

        const progress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY) || "[]") as QuizAttempt[];
        progress.unshift(newAttempt);
        localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(progress.slice(0, 50)));

        localStorage.removeItem(LOCAL_STORAGE_CURRENT_RESULT_KEY);

      } catch (e) {
        console.error("Error parsing stored result:", e);
        toast({ title: "Error Loading Results", description: `Could not load quiz results. ${(e as Error).message || 'Invalid data format.'}`, variant: "destructive" });
        router.push("/");
      }
    } else {
      if (!isLoading && !result) {
         toast({ title: "No Results Found", description: "Redirecting to home.", variant: "default" });
         router.push("/");
      }
    }
    setIsLoading(false);
  }, [router, toast, isLoading, result]);

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Quiz results could not be loaded. You might have already viewed them or there was an error.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleNavigation("/")} disabled={isNavigating}>
            {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Home className="mr-2 h-4 w-4" />}
            Go Home
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const { topic, analysis, questions, answers: userAnswers } = result;
  const scoreColorClass = analysis.overallScore >= 70 ? "text-primary" : analysis.overallScore >= 40 ? "text-accent" : "text-destructive";

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <Award className="mx-auto h-16 w-16 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">Quiz Results: {topic}</CardTitle>
        <CardDescription className="text-lg">Here's how you performed on the {topic} quiz.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant={analysis.overallScore >= 70 ? "default" : (analysis.overallScore >=40 ? "default" : "destructive")} 
               className={`bg-card border-border shadow-sm ${analysis.overallScore < 40 ? 'border-destructive' : analysis.overallScore < 70 ? 'border-accent' : 'border-primary'}`}>
           <div className="flex items-center">
             <span className={`text-5xl font-bold mr-4 ${scoreColorClass}`}>
                {analysis.overallScore}%
             </span>
             <div>
                <AlertTitle className="text-xl font-semibold">Overall Score</AlertTitle>
                <AlertDescription className="text-base">
                    {analysis.overallScore >= 70 ? "Great job!" : analysis.overallScore >=40 ? "Good effort, keep practicing!" : "Needs improvement, but don't give up!"}
                </AlertDescription>
             </div>
           </div>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strengths</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{analysis.strengths || "N/A"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Areas for Improvement</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{analysis.weaknesses || "N/A"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics to Focus On</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{analysis.topicsToFocusOn || "N/A"}</p>
            </CardContent>
        </Card>
        
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <Lightbulb className="mr-2 h-5 w-5 text-accent" /> Review Your Answers
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4 mt-2">
                {questions.map((q, i) => {
                  const userAnswer = userAnswers[i] || "Not answered";
                  const isCorrect = q.correctAnswer && userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                  return (
                    <li key={i} className="p-4 border rounded-lg bg-card space-y-2 shadow-sm">
                      <p className="font-semibold text-base"><strong>Q:</strong> {q.question}</p>
                      
                      <div className="flex items-start text-sm">
                        {isCorrect ? (
                          <CheckCircle2 className="mr-2 mt-0.5 h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="mr-2 mt-0.5 h-5 w-5 text-destructive flex-shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold mr-1">Your Answer:</span>
                          <span className={isCorrect ? 'text-green-700 dark:text-green-300' : 'text-destructive'}>{userAnswer}</span>
                        </div>
                      </div>

                      {!isCorrect && q.correctAnswer && (
                        <div className="flex items-start text-sm text-primary pl-[28px]"> {/* Approx icon width + margin */}
                          <Lightbulb className="mr-2 mt-0.5 h-5 w-5 text-primary flex-shrink-0" /> 
                          <div>
                            <span className="font-semibold mr-1">Correct Answer:</span>
                            <span>{q.correctAnswer}</span>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
        <Button onClick={() => handleNavigation("/")} variant="outline" size="lg" disabled={isNavigating}>
          {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Home className="mr-2 h-4 w-4" />}
          Go Home
        </Button>
        <Button onClick={() => handleNavigation("/")} size="lg" disabled={isNavigating}>
          {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
          Take Another Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
