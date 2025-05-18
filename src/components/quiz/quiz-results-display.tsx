// @/components/quiz/quiz-results-display.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Award, BookOpen, Home, Lightbulb, Loader2, RotateCcw, Target, TrendingDown, TrendingUp } from "lucide-react";
import { LOCAL_STORAGE_CURRENT_RESULT_KEY, LOCAL_STORAGE_PROGRESS_KEY, MathTopic } from "@/lib/constants";
import type { QuizAttempt, CurrentQuizData } from "@/types";
import type { AnalyzeStudentPerformanceOutput } from "@/ai/flows/analyze-student-performance";

interface StoredResultData extends CurrentQuizData {
  analysis: AnalyzeStudentPerformanceOutput;
}

export function QuizResultsDisplay() {
  const [result, setResult] = useState<StoredResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false); // New state for navigation loading
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedResult = localStorage.getItem(LOCAL_STORAGE_CURRENT_RESULT_KEY);
    if (storedResult) {
      try {
        const parsedResult: StoredResultData = JSON.parse(storedResult);
        setResult(parsedResult);

        // Save to overall progress
        const newAttempt: QuizAttempt = {
          ...parsedResult,
          id: new Date().toISOString() + Math.random().toString(36).substring(2, 9), // More unique ID
          date: new Date().toISOString(),
        };

        const progress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY) || "[]") as QuizAttempt[];
        progress.unshift(newAttempt); // Add to the beginning of the array
        localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(progress.slice(0, 50))); // Keep last 50 attempts

        // Clear the temporary result
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_RESULT_KEY);

      } catch (e) {
        console.error("Error parsing stored result:", e);
        toast({ title: "Error", description: "Could not load quiz results.", variant: "destructive" });
        router.push("/"); // Redirect if data is malformed
      }
    } else {
      // Only show "No Results Found" toast if not already loading and result isn't set yet.
      // This avoids showing it on initial load if data is eventually found or if redirected for other reasons.
      if (!isLoading && !result) {
         toast({ title: "No Results Found", description: "Redirecting to home.", variant: "default" });
         router.push("/"); // Redirect if no data
      }
    }
    setIsLoading(false);
  }, [router, toast, isLoading, result]); // Added isLoading and result to dependency array for better control of toast message

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
            {isNavigating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Home className="mr-2 h-4 w-4" />
            )}
            Go Home
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const { topic, analysis, questions, answers: userAnswers } = result;
  const scoreColor = analysis.overallScore >= 70 ? "text-green-600" : analysis.overallScore >= 40 ? "text-yellow-600" : "text-red-600";

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <Award className="mx-auto h-16 w-16 text-primary mb-4" />
        <CardTitle className="text-3xl font-bold">Quiz Results: {topic}</CardTitle>
        <CardDescription className="text-lg">Here's how you performed on the {topic} quiz.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant={analysis.overallScore >= 70 ? "default" : "destructive"} className="bg-card border-border shadow-sm">
           <div className="flex items-center">
             <span className="text-5xl font-bold mr-4" style={{color: `hsl(var(--${scoreColor.substring(5, scoreColor.length-4)}))`}}>
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
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <Lightbulb className="mr-2 h-5 w-5 text-accent" /> Review Your Answers
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4 mt-2">
                {questions.map((q, i) => (
                  <li key={i} className="p-3 border rounded-md bg-secondary/30">
                    <p className="font-medium text-sm"><strong>Q:</strong> {q}</p>
                    <p className="text-sm text-muted-foreground"><strong>Your Answer:</strong> {userAnswers[i] || "Not answered"}</p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
        <Button onClick={() => handleNavigation("/")} variant="outline" size="lg" disabled={isNavigating}>
          {isNavigating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Home className="mr-2 h-4 w-4" />
          )}
          Go Home
        </Button>
        <Button onClick={() => handleNavigation("/")} size="lg" disabled={isNavigating}>
          {isNavigating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Take Another Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
