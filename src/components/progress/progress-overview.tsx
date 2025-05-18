// @/components/progress/progress-overview.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LOCAL_STORAGE_PROGRESS_KEY } from "@/lib/constants";
import type { QuizAttempt } from "@/types";
import { format } from "date-fns";
import { BarChart3, CheckCircle, ListChecks, Star, TrendingDown, TrendingUp } from "lucide-react";

export function ProgressOverview() {
  const [progress, setProgress] = useState<QuizAttempt[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedProgress = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
    if (storedProgress) {
      try {
        const parsedProgress = JSON.parse(storedProgress);
        // Basic validation to ensure it's an array and items have expected structure
        if (Array.isArray(parsedProgress) && parsedProgress.every(item => typeof item === 'object' && item !== null && 'id' in item && 'analysis' in item && 'questions' in item && 'answers' in item)) {
          setProgress(parsedProgress);
        } else {
          console.warn("Malformed progress data in localStorage. Clearing it.");
          localStorage.removeItem(LOCAL_STORAGE_PROGRESS_KEY);
          setProgress([]);
        }
      } catch (error) {
        console.error("Error parsing progress data from localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_PROGRESS_KEY); // Clear corrupted data
        setProgress([]);
      }
    }
  }, []);

  if (!mounted) {
    return (
        <Card className="w-full max-w-4xl mx-auto shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                    <BarChart3 className="mr-3 h-7 w-7 text-primary" />
                    Your Progress
                </CardTitle>
                <CardDescription>Loading your quiz history...</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex justify-center items-center">
                 <Star className="h-8 w-8 animate-ping text-primary" />
            </CardContent>
        </Card>
    );
  }

  if (progress.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl">
            <ListChecks className="mr-3 h-7 w-7 text-primary" />
            No Progress Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You haven't completed any quizzes yet. Take a quiz to see your progress here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-3xl">
          <BarChart3 className="mr-3 h-8 w-8 text-primary" />
          Your Quiz Progress
        </CardTitle>
        <CardDescription>Review your past quiz attempts and performance analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <Accordion type="multiple" className="w-full space-y-4">
            {progress.map((attempt) => {
              // Ensure analysis and overallScore exist to prevent runtime errors
              const overallScore = attempt.analysis?.overallScore ?? 0;
              const scoreColor = overallScore >= 70 ? "bg-green-500" : overallScore >= 40 ? "bg-yellow-500" : "bg-red-500";
              return (
                <AccordionItem key={attempt.id} value={attempt.id} className="border rounded-lg shadow-sm bg-card overflow-hidden">
                  <AccordionTrigger className="p-4 hover:no-underline text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary">{attempt.topic}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(attempt.date), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Badge className={`text-base px-3 py-1 text-white ${scoreColor}`}>
                        Score: {overallScore}%
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-background/50">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" />Strengths:</h4>
                        <p className="text-sm text-muted-foreground pl-6">{attempt.analysis?.strengths || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center"><TrendingDown className="mr-2 h-4 w-4 text-red-500" />Weaknesses:</h4>
                        <p className="text-sm text-muted-foreground pl-6">{attempt.analysis?.weaknesses || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-blue-500" />Topics to Focus On:</h4>
                        <p className="text-sm text-muted-foreground pl-6">{attempt.analysis?.topicsToFocusOn || "N/A"}</p>
                      </div>
                      <details className="mt-2">
                        <summary className="text-sm font-medium text-primary cursor-pointer hover:underline">Show Questions & Answers</summary>
                        <ul className="mt-2 space-y-2 pl-4 text-xs">
                          {attempt.questions.map((q, i) => (
                            <li key={i} className="p-2 border rounded-md bg-muted/50">
                              <p><strong>Q:</strong> {q}</p>
                              <p className="text-muted-foreground"><strong>Your Answer:</strong> {(attempt.answers && attempt.answers[i]) || "Not answered"}</p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
