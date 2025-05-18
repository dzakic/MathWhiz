import { TopicSelector } from "@/components/quiz/topic-selector";
import Image from "next/image";
import { generateImageAction } from "@/actions/imageActions";

export default async function HomePage() {
  const imagePrompt = "Vibrant digital illustration of a diverse group of young, enthusiastic math whiz kids (around 10-12 years old) excitedly sharing an 'aha!' moment, ideas sparking around them like little comets. Glowing lightbulbs and mathematical symbols float whimsically. Friendly, approachable, dynamic style. Simple, cheerful background. Aspect ratio 2:1, suitable for 600x300 display.";
  let imageUrl: string;

  try {
    imageUrl = await generateImageAction(imagePrompt);
  } catch (error) {
    console.error("Failed to generate image for homepage:", error);
    imageUrl = "https://placehold.co/600x300.png?text=Error+Loading+Image"; // Fallback
  }

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
            alt="Enthusiastic Math Whiz kids with brilliant ideas" 
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
