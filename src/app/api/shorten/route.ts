import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// In-memory storage (for demo - in production, use Cloudflare KV or D1)
// This will reset on each deployment, but works for demo purposes
const urlStore = new Map<string, { originalUrl: string; createdAt: number; clicks: number; analytics: Array<{ timestamp: number; ip?: string; userAgent?: string; referer?: string }> }>();

// Generate a short ID
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, customSlug } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { error: 'Only HTTP and HTTPS URLs are supported' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate or use custom slug
    let slug = customSlug?.trim();
    
    if (slug) {
      // Validate custom slug
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        return NextResponse.json(
          { error: 'Custom slug can only contain letters, numbers, hyphens, and underscores' },
          { status: 400 }
        );
      }
      
      // Check if slug already exists
      if (urlStore.has(slug)) {
        return NextResponse.json(
          { error: 'This custom slug is already taken' },
          { status: 409 }
        );
      }
    } else {
      // Generate unique slug
      do {
        slug = generateShortId();
      } while (urlStore.has(slug));
    }

    // Store the URL
    const baseUrl = request.nextUrl.origin;
    urlStore.set(slug, {
      originalUrl: parsedUrl.href,
      createdAt: Date.now(),
      clicks: 0,
      analytics: []
    });

    const shortUrl = `${baseUrl}/s/${slug}`;

    return NextResponse.json({
      shortUrl,
      slug,
      originalUrl: parsedUrl.href,
      createdAt: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
