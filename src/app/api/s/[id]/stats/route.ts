import { NextRequest, NextResponse } from 'next/server';
import { getUrlData } from '@/lib/url-store';

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

    // Calculate stats
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const clicksLast24h = urlData.analytics.filter(a => a.timestamp >= oneDayAgo).length;

    // Parse countries from IP (simplified - in production, use a proper IP geolocation service)
    const countries: Record<string, number> = {};
    // For now, we'll use a simple approach - in production, use Cloudflare's request.cf.country
    // or a geolocation API
    urlData.analytics.forEach(a => {
      // Placeholder - in production, get country from IP geolocation
      const country = 'Unknown';
      countries[country] = (countries[country] || 0) + 1;
    });

    // Parse devices from user agent
    const devices: Record<string, number> = {};
    urlData.analytics.forEach(a => {
      if (!a.userAgent) {
        devices['Unknown'] = (devices['Unknown'] || 0) + 1;
        return;
      }
      
      const ua = a.userAgent.toLowerCase();
      let device = 'Desktop';
      
      if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
        device = 'Mobile';
      } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
        device = 'Tablet';
      } else if (/bot|crawler|spider|crawling/i.test(ua)) {
        device = 'Bot';
      }
      
      devices[device] = (devices[device] || 0) + 1;
    });

    return NextResponse.json({
      slug,
      url: urlData.originalUrl,
      total_clicks: urlData.clicks,
      last_24h: clicksLast24h,
      countries,
      devices
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
