import { NextRequest, NextResponse } from 'next/server';
import { saveUrlData, getUrlData, generateShortId } from '@/lib/url-store';

export const runtime = 'edge';

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
      const existing = await getUrlData(slug);
      if (existing) {
        return NextResponse.json(
          { error: 'This custom slug is already taken' },
          { status: 409 }
        );
      }
    } else {
      // Generate unique slug
      let exists = true;
      while (exists) {
        slug = generateShortId();
        const existing = await getUrlData(slug);
        exists = !!existing;
      }
    }

    // Store the URL
    const baseUrl = request.nextUrl.origin;
    await saveUrlData(slug, {
      originalUrl: parsedUrl.href,
      createdAt: Date.now(),
      clicks: 0,
      analytics: []
    });

    const shortUrl = `${baseUrl}/s/${slug}`;

    return NextResponse.json({
      shortUrl,
      slug,
      url: parsedUrl.href,
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
