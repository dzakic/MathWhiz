// @/actions/imageActions.ts
"use server";

import { generateImage as genkitGenerateImage } from "@/ai/flows/generate-math-whiz-image-flow";
import type { GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-math-whiz-image-flow";
import { MATH_WHIZ_HERO_PROMPT } from "@/lib/imagePrompts"; // Import the prompt
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.tmp');
const IMAGE_FILE_NAME = 'math_whiz_hero.png';
const IMAGE_FILE_PATH = path.join(CACHE_DIR, IMAGE_FILE_NAME);
const METADATA_FILE_NAME = 'math_whiz_hero_metadata.json';
const METADATA_FILE_PATH = path.join(CACHE_DIR, METADATA_FILE_NAME);
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ImageMetadata {
  timestamp: number;
  prompt: string;
}

function dataUriToBuffer(dataUri: string): Buffer {
  const base64Marker = ';base64,';
  const base64Index = dataUri.indexOf(base64Marker);
  if (base64Index === -1) {
    // If it's not a valid data URI (e.g. already a URL or malformed)
    // This might happen if the genkit flow returns a placeholder URL directly
    // For simplicity, we'll throw an error, assuming genkit flow returns valid data URI for actual images
    console.error("Invalid data URI format:", dataUri.substring(0, 100));
    throw new Error('Invalid data URI format for image buffer conversion.');
  }
  const base64 = dataUri.substring(base64Index + base64Marker.length);
  return Buffer.from(base64, 'base64');
}

export async function ensureLatestImageFile(prompt: string): Promise<string> {
  // Ensure cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch (err) {
      console.error("Failed to create cache directory:", err);
      // If we can't create cache dir, we can't proceed with file caching.
      // This scenario should be rare. For now, we'll let it error out.
      // A more robust solution might fallback to data URI or a default placeholder.
      throw new Error("Cache directory could not be created.");
    }
  }

  let needsGeneration = true;

  if (fs.existsSync(METADATA_FILE_PATH) && fs.existsSync(IMAGE_FILE_PATH)) {
    try {
      const metadataContent = await fsp.readFile(METADATA_FILE_PATH, 'utf-8');
      const metadata: ImageMetadata = JSON.parse(metadataContent);
      if (
        metadata.prompt === prompt &&
        (Date.now() - metadata.timestamp < CACHE_DURATION_MS)
      ) {
        console.log("Image is fresh in server cache. Serving from file:", IMAGE_FILE_PATH);
        needsGeneration = false;
      } else {
        console.log("Cache stale or prompt mismatch. Regenerating image.");
      }
    } catch (error) {
      console.error("Error reading or parsing metadata file, proceeding to generate new image:", error);
      // Proceed to generate a new image if metadata is invalid
    }
  } else {
    console.log("Image or metadata not found in cache. Generating new image.");
  }

  if (needsGeneration) {
    console.log("Generating new image with prompt:", prompt);
    const input: GenerateImageInput = { prompt };
    try {
      const result: GenerateImageOutput = await genkitGenerateImage(input);
      const imageDataUri = result.imageDataUri;
      
      // If imageDataUri is a placeholder URL (e.g. from Ollama fallback), we can't save it as a file this way.
      // The genkit flow for ollama was modified to return "data:image/png;base64,..." for placeholder.
      // So this conversion should generally work.
      const imageBuffer = dataUriToBuffer(imageDataUri);
      await fsp.writeFile(IMAGE_FILE_PATH, imageBuffer);
      
      const newMetadata: ImageMetadata = {
        timestamp: Date.now(),
        prompt: prompt,
      };
      await fsp.writeFile(METADATA_FILE_PATH, JSON.stringify(newMetadata));
      console.log("New image generated and saved to cache:", IMAGE_FILE_PATH);
    } catch (error) {
      console.error("Error generating or saving image:", error);
      // If generation or saving fails, what to do?
      // For now, if IMAGE_FILE_PATH doesn't exist, the API route will error.
      // A more robust solution would ensure a fallback placeholder file exists.
      // Let's ensure a fallback placeholder is written if generation fails.
      if (!fs.existsSync(IMAGE_FILE_PATH)) {
        try {
            const placeholderDataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAGQCAYAAAByNR6YAAAAAXNSR0IArs4c6QAAAPBJREFUeF7t0DEBAAAAwiD7P2PbMFMXOkpdJLClogEBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECDwVwATgAI2gL27GUAAAAASUVORK5CYII="; // Simple 600x300 transparent png
            const placeholderBuffer = dataUriToBuffer(placeholderDataUri);
            await fsp.writeFile(IMAGE_FILE_PATH, placeholderBuffer);
            console.log("Fallback placeholder image written to cache due to generation error.");
             const newMetadata: ImageMetadata = { // Still write metadata for the placeholder
                timestamp: Date.now(), // So it's not regenerated immediately
                prompt: prompt, // Keep the original prompt
            };
            await fsp.writeFile(METADATA_FILE_PATH, JSON.stringify(newMetadata));
        } catch (fallbackError) {
            console.error("Error writing fallback placeholder image:", fallbackError);
        }
      }
      // Re-throw or handle as appropriate if the API route relies on this function to always succeed or provide a file.
      // For now, ensure IMAGE_FILE_PATH exists or the API will fail.
    }
  }
  return IMAGE_FILE_PATH;
}
