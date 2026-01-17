import { NextRequest, NextResponse } from 'next/server';
import { getUrlData, incrementClick } from '@/lib/url-store';

export const runtime = 'edge';

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

    const urlData = await getUrlData(slug);

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

    await incrementClick(slug, {
      timestamp: Date.now(),
      ip: ip.split(',')[0].trim(), // Get first IP if multiple
      userAgent,
      referer
    });

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
