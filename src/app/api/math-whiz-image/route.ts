// @/app/api/math-whiz-image/route.ts
import { NextResponse } from 'next/server';
import { ensureLatestImageFile } from '@/actions/imageActions';
import { MATH_WHIZ_HERO_PROMPT } from '@/lib/imagePrompts';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const imageFilePath = await ensureLatestImageFile(MATH_WHIZ_HERO_PROMPT);
    const imageBuffer = await fs.readFile(imageFilePath);
    
    // Determine content type from file extension, default to png
    const ext = path.extname(imageFilePath).toLowerCase();
    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24 hours
      },
    });
  } catch (error) {
    console.error('Error serving math whiz image:', error);
    // Fallback to a default placeholder image or error response
    // For simplicity, returning a 500 error.
    // A real placeholder image could be served here if one is statically available.
    return new NextResponse('Error generating image.', { status: 500 });
  }
}
