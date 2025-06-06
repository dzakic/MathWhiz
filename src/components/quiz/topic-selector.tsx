
// @/components/quiz/topic-selector.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MATH_TOPICS, NUM_QUESTIONS_OPTIONS, type MathTopic, type NumQuestionsOption, type YearLevel } from "@/lib/constants";
import { BookOpen, PlayCircle, Loader2 } from "lucide-react";

interface TopicSelectorProps {
  yearLevel: YearLevel;
}

export function TopicSelector({ yearLevel }: TopicSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState<MathTopic | undefined>(undefined);
  const [numQuestions, setNumQuestions] = useState<NumQuestionsOption>(NUM_QUESTIONS_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleStartQuiz = () => {
    if (selectedTopic && yearLevel) {
      setIsLoading(true);
      router.push(`/quiz/${selectedTopic.toLowerCase()}?numQuestions=${numQuestions}&year=${encodeURIComponent(yearLevel)}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <BookOpen className="mr-3 h-7 w-7 text-primary" />
          Select a Topic
        </CardTitle>
        <CardDescription>Choose a topic and the number of questions for {yearLevel}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="topic-select" className="text-base font-medium">Topic</Label>
          <Select
            value={selectedTopic}
            onValueChange={(value) => setSelectedTopic(value as MathTopic)}
            disabled={isLoading}
          >
            <SelectTrigger id="topic-select" className="w-full text-base py-6">
              <SelectValue placeholder="Select a math topic" />
            </SelectTrigger>
            <SelectContent>
              {MATH_TOPICS.map((topic) => (
                <SelectItem key={topic} value={topic} className="text-base py-3">
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="num-questions-select" className="text-base font-medium">Number of Questions</Label>
          <Select
            value={String(numQuestions)}
            onValueChange={(value) => setNumQuestions(Number(value) as NumQuestionsOption)}
            disabled={isLoading}
          >
            <SelectTrigger id="num-questions-select" className="w-full text-base py-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NUM_QUESTIONS_OPTIONS.map((num) => (
                <SelectItem key={num} value={String(num)} className="text-base py-3">
                  {num} Questions
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleStartQuiz}
          disabled={!selectedTopic || isLoading}
          className="w-full text-lg py-7"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading Quiz...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-5 w-5" />
              Start Quiz
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
