import { NextRequest } from 'next/server';

const WORKER = 'https://url-metadata-api.brogee9o9.workers.dev';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return Response.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const upstream = await fetch(
    `${WORKER}/api/metadata?url=${encodeURIComponent(url)}`,
    { headers: { 'User-Agent': 'WorkersCanDo-Proxy/1.0' } },
  );

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
