// @/app/api/math-whiz-image/route.ts
import { NextResponse } from 'next/server'; // NextResponse can be used, or standard Response
import { ensureLatestImageFile } from '@/actions/imageActions';
import { MATH_WHIZ_HERO_PROMPT } from '@/lib/imagePrompts';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const imageFilePath = await ensureLatestImageFile(MATH_WHIZ_HERO_PROMPT);
    const imageBuffer = await fs.readFile(imageFilePath);
    
    const ext = path.extname(imageFilePath).toLowerCase();
    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }

    // Explicitly create a Headers object
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Cache-Control', 'public, max-age=86400'); // 24 hours

    return new Response(imageBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error serving math whiz image:', error);
    // Fallback to a simple error response.
    // Consider sending a placeholder image with appropriate cache headers if generation fails.
    return new NextResponse('Error generating image.', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // No caching for errors
      }
    });
  }
}
