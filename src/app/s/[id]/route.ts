import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// This should match the store from shorten/route.ts
// In production with Cloudflare KV, this would be shared
const urlStore = new Map<string, { originalUrl: string; createdAt: number; clicks: number; analytics: Array<{ timestamp: number; ip?: string; userAgent?: string; referer?: string }> }>();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid short link' },
        { status: 404 }
      );
    }

    const urlData = urlStore.get(slug);

    if (!urlData) {
      return NextResponse.json(
        { error: 'Short link not found' },
        { status: 404 }
      );
    }

    // Track analytics
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || 'direct';

    urlData.clicks += 1;
    urlData.analytics.push({
      timestamp: Date.now(),
      ip: ip.split(',')[0].trim(), // Get first IP if multiple
      userAgent,
      referer
    });

    // Keep only last 1000 analytics entries to prevent memory issues
    if (urlData.analytics.length > 1000) {
      urlData.analytics = urlData.analytics.slice(-1000);
    }

    // Redirect to original URL
    return NextResponse.redirect(urlData.originalUrl, {
      status: 302,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
