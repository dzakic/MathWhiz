// @/app/api/math-whiz-image/route.ts
import { NextResponse } from 'next/server';
import { ensureLatestImageFile } from '@/actions/imageActions';
import { MATH_WHIZ_HERO_PROMPT } from '@/lib/imagePrompts';
import fs from 'fs/promises';
import path from 'path';

// Removed 'request: Request' as it was unused.
// Filesystem access (fs) will still likely make this route dynamic in Next.js's view.
export async function GET() {
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

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    // Added 'immutable' to encourage strong caching.
    // 'immutable' means the content at this URL won't change for the max-age period.
    // This is okay since our server-side logic ensures the file content is updated daily if needed.
    responseHeaders.set('Cache-Control', 'public, max-age=86400, immutable');

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error serving math whiz image:', error);
    
    const errorHeaders = new Headers();
    errorHeaders.set('Content-Type', 'text/plain');
    errorHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    return new NextResponse('Error generating image.', { 
      status: 500,
      headers: errorHeaders,
    });
  }
}
