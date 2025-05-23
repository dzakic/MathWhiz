
"use client"; // Converted to Client Component for state management

import { useState } from "react";
import Image from "next/image";
import { TopicSelector } from "@/components/quiz/topic-selector";
import { YearSelector } from "@/components/home/year-selector";
import type { YearLevel } from "@/lib/constants";

export default function HomePage() {
  const imageUrl = "/api/math-whiz-image";
  const [selectedYear, setSelectedYear] = useState<YearLevel | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary mb-4">
          Welcome to Math Whiz!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sharpen your math skills with AI-powered quizzes. Select your year level to begin your adventure!
        </p>
      </header>
      
      <div className="w-full flex justify-center mb-12">
         <Image 
            src={imageUrl} 
            alt="Enthusiastic Math Whiz kids with brilliant ideas"
            width={600} 
            height={300} 
            className="rounded-lg shadow-xl"
            data-ai-hint="enthusiastic kids learning" 
            priority 
          />
      </div>

      <YearSelector onYearSelect={setSelectedYear} selectedYear={selectedYear} />

      {selectedYear && (
        <div className="w-full mt-8">
          <h2 className="text-3xl font-semibold text-center mb-6 text-primary">
            Quizzes for {selectedYear}
          </h2>
          <TopicSelector yearLevel={selectedYear} />
        </div>
      )}
    </div>
  );
}
