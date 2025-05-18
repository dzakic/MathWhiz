import { TopicSelector } from "@/components/quiz/topic-selector";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary mb-4">
          Welcome to Math Whiz!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sharpen your Year 7 math skills with AI-powered quizzes. Select a topic below and test your knowledge.
        </p>
      </header>
      
      <div className="w-full flex justify-center mb-12">
         <Image 
            src="https://placehold.co/600x300.png" 
            alt="Math illustration" 
            width={600} 
            height={300} 
            className="rounded-lg shadow-xl"
            data-ai-hint="math education" 
          />
      </div>

      <TopicSelector />
    </div>
  );
}
