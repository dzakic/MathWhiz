// @/components/quiz/quiz-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { analyzePerformanceAction } from "@/actions/quizActions";
import { STUDENT_NAME, MathTopic, LOCAL_STORAGE_CURRENT_RESULT_KEY } from "@/lib/constants";
import type { CurrentQuizData, QuizQuestionFormat } from "@/types";

interface QuizFormProps {
  topic: MathTopic;
  initialQuestions: string[];
  numQuestions: number;
}

export function QuizForm({ topic, initialQuestions, numQuestions }: QuizFormProps) {
  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(numQuestions).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Clear any previous result from local storage when a new quiz starts
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_RESULT_KEY);
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const quizDataForAnalysis: QuizQuestionFormat[] = questions.map((q, i) => ({
        question: q,
        studentAnswer: answers[i] || "Not answered", // Provide a default for unanswered questions
      }));
      
      const analysis = await analyzePerformanceAction(
        JSON.stringify(quizDataForAnalysis),
        STUDENT_NAME
      );

      const currentQuizResult: CurrentQuizData & { analysis: any } = {
        topic,
        numQuestions,
        questions,
        answers,
        studentName: STUDENT_NAME,
        analysis,
      };
      
      localStorage.setItem(LOCAL_STORAGE_CURRENT_RESULT_KEY, JSON.stringify(currentQuizResult));
      
      toast({
        title: "Quiz Submitted!",
        description: "Redirecting to your results...",
        variant: "default",
      });
      router.push("/quiz/results");

    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!questions.length) {
    return <Card><CardContent><p>No questions loaded. Please try starting a new quiz.</p></CardContent></Card>;
  }

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Quiz: {topic}</CardTitle>
        <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
        <Progress value={progressPercentage} className="w-full mt-2" />
      </CardHeader>
      <CardContent className="min-h-[200px] flex flex-col justify-center">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <Label htmlFor="answer" className="text-lg font-semibold">
              {questions[currentQuestionIndex]}
            </Label>
            <Input
              id="answer"
              type="text"
              value={answers[currentQuestionIndex]}
              onChange={handleAnswerChange}
              placeholder="Your answer"
              className="text-base py-6"
              aria-label={`Answer for question: ${questions[currentQuestionIndex]}`}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isLoading} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button onClick={handleNext} disabled={isLoading}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Submit Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
