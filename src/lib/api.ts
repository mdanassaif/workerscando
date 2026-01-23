// API endpoints - proxied through Vercel rewrites to Cloudflare Workers
export const API = {
  METADATA: '/api/metadata',
  OG_IMAGE: '/api/og-image',
  SHORTEN: '/api/shorten',
} as const;

const WORKER_API_BASE = 'https://urlshortener.brogee9o9.workers.dev';

export type ShortenResponse = {
  url: string;
  slug: string;
};

export type StatsResponse = {
  slug: string;
  url: string;
  total_clicks: number;
  last_24h?: number;
  countries?: Record<string, number>;
  devices?: Record<string, number>;
};

// Shorten URL via POST (faster than GET)
export async function shortenUrl({ url, slug }: { url: string; slug?: string }): Promise<ShortenResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(`${WORKER_API_BASE}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, ...(slug ? { slug } : {}) }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Failed (${res.status})`);
    }
    return res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// Get stats for a short link
export async function getShortUrlStats(slug: string): Promise<StatsResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const res = await fetch(`${WORKER_API_BASE}/api/stats/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('Stats unavailable');
    return res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// Get redirect URL for a slug (returns the original URL, or throws if not found)
export async function getShortUrlRedirect(slug: string): Promise<string> {
  // This endpoint redirects, so we fetch with redirect: 'manual' to inspect headers
  const res = await fetch(`${WORKER_API_BASE}/${encodeURIComponent(slug)}`, { redirect: 'manual' });
  if (res.status === 301 || res.status === 302) {
    return res.headers.get('Location') || '';
  }
  throw new Error('Short link not found');
}
