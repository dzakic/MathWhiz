// @/actions/imageActions.ts
"use server";

import { generateImage as genkitGenerateImage } from "@/ai/flows/generate-math-whiz-image-flow";
import type { GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-math-whiz-image-flow";
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.tmp');
const CACHE_FILE_PATH = path.join(CACHE_DIR, 'cached_math_whiz_image.json');
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ImageCache {
  imageUrl: string;
  timestamp: number;
}

export async function generateImageAction(prompt: string): Promise<string> {
  // Ensure cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch (err) {
      console.error("Failed to create cache directory:", err);
      // Proceed without caching if directory creation fails
    }
  }

  // Try to read from cache
  if (fs.existsSync(CACHE_FILE_PATH)) {
    try {
      const cachedData = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const cache: ImageCache = JSON.parse(cachedData);
      if (Date.now() - cache.timestamp < CACHE_DURATION_MS) {
        console.log("Serving image from cache.");
        return cache.imageUrl;
      }
    } catch (error) {
      console.error("Error reading or parsing cache file:", error);
      // Proceed to generate a new image if cache is invalid
    }
  }

  // If cache is stale, not found, or invalid, generate a new image
  console.log("Generating new image as cache is stale or missing.");
  const input: GenerateImageInput = { prompt };
  try {
    const result: GenerateImageOutput = await genkitGenerateImage(input);
    const newImageUrl = result.imageDataUri;

    // Save the new image to cache
    const newCache: ImageCache = {
      imageUrl: newImageUrl,
      timestamp: Date.now(),
    };
    try {
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(newCache));
      console.log("New image saved to cache.");
    } catch (error) {
      console.error("Error writing to cache file:", error);
    }

    return newImageUrl;
  } catch (error) {
    console.error("Error generating image via action:", error);
    // Fallback to a placeholder if generation fails to prevent breaking the page.
    return "https://placehold.co/600x300.png?text=Image+Gen+Error";
  }
}
