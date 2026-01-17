import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// This should match the store from shorten/route.ts
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

    // Calculate stats
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const clicksToday = urlData.analytics.filter(a => a.timestamp >= oneDayAgo).length;
    const clicksThisWeek = urlData.analytics.filter(a => a.timestamp >= oneWeekAgo).length;
    const clicksThisMonth = urlData.analytics.filter(a => a.timestamp >= oneMonthAgo).length;

    // Get unique referrers
    const referrers = new Map<string, number>();
    urlData.analytics.forEach(a => {
      const ref = a.referer || 'direct';
      referrers.set(ref, (referrers.get(ref) || 0) + 1);
    });

    // Get top referrers
    const topReferrers = Array.from(referrers.entries())
      .map(([referer, count]) => ({ referer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get clicks by day (last 30 days)
    const clicksByDay: Record<string, number> = {};
    urlData.analytics.forEach(a => {
      const date = new Date(a.timestamp).toISOString().split('T')[0];
      clicksByDay[date] = (clicksByDay[date] || 0) + 1;
    });

    return NextResponse.json({
      slug,
      originalUrl: urlData.originalUrl,
      createdAt: new Date(urlData.createdAt).toISOString(),
      totalClicks: urlData.clicks,
      clicksToday,
      clicksThisWeek,
      clicksThisMonth,
      topReferrers,
      clicksByDay,
      recentClicks: urlData.analytics.slice(-50).reverse().map(a => ({
        timestamp: new Date(a.timestamp).toISOString(),
        referer: a.referer || 'direct',
        userAgent: a.userAgent
      }))
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
