import { TopicSelector } from "@/components/quiz/topic-selector";
import Image from "next/image";
// Removed: import { generateImageAction } from "@/actions/imageActions";
import { MATH_WHIZ_HERO_PROMPT } from "@/lib/imagePrompts"; // Import the prompt if needed for alt text or other metadata

export default async function HomePage() {
  // The image will now be fetched from the API endpoint by the <Image /> component
  const imageUrl = "/api/math-whiz-image"; // URL to our new API route

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
            src={imageUrl} 
            alt="Enthusiastic Math Whiz kids with brilliant ideas" // Alt text can use the prompt or a summary
            width={600} 
            height={300} 
            className="rounded-lg shadow-xl"
            data-ai-hint="enthusiastic kids learning" 
            priority 
          />
      </div>

      <TopicSelector />
    </div>
  );
}
