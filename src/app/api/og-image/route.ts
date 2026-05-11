import { NextRequest } from 'next/server';

const WORKER = 'https://og-image-generator.brogee9o9.workers.dev';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const upstream = await fetch(
    `${WORKER}/api/og?${searchParams.toString()}`,
    { headers: { 'User-Agent': 'WorkersCanDo-Proxy/1.0' } },
  );

  // Pass through the image response (PNG/JPEG binary)
  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'image/png',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
