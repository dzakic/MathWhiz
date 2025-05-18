// @/actions/imageActions.ts
"use server";

import { generateImage as genkitGenerateImage } from "@/ai/flows/generate-math-whiz-image-flow";
import type { GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-math-whiz-image-flow";

export async function generateImageAction(prompt: string): Promise<string> {
  const input: GenerateImageInput = { prompt };
  try {
    const result: GenerateImageOutput = await genkitGenerateImage(input);
    return result.imageDataUri;
  } catch (error) {
    console.error("Error generating image via action:", error);
    // Fallback to a placeholder if generation fails to prevent breaking the page.
    return "https://placehold.co/600x300.png?text=Image+Gen+Error";
  }
}
