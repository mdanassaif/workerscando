/**
 * URL Shortener with Analytics
 * 
 * A Cloudflare Worker that creates short links with click tracking.
 * API only - no HTML UI.
 */

export interface Env {
  URLS: KVNamespace;
}

interface URLData {
  url: string;
  slug: string;
  created: number;
  clicks: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

async function handleShorten(request: Request, env: Env, url: URL): Promise<Response> {
  let targetUrl: string;
  let customSlug: string | null = null;

  if (request.method === 'POST') {
    try {
      const body = await request.json() as { url?: string; slug?: string };
      targetUrl = body.url || '';
      customSlug = body.slug || null;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }
  } else {
    targetUrl = url.searchParams.get('url') || '';
    customSlug = url.searchParams.get('slug') || null;
  }

  if (!targetUrl) {
    return jsonResponse({ error: 'Missing url parameter' }, 400);
  }

  try {
    new URL(targetUrl);
  } catch {
    return jsonResponse({ error: 'Invalid URL format' }, 400);
  }

  const slug = customSlug || generateSlug();

  if (customSlug && !/^[a-zA-Z0-9_-]+$/.test(customSlug)) {
    return jsonResponse({ error: 'Slug can only contain letters, numbers, hyphens, and underscores' }, 400);
  }

  const existing = await env.URLS.get(slug);
  if (existing) {
    return jsonResponse({ error: 'Slug already exists' }, 409);
  }

  const urlData: URLData = {
    url: targetUrl,
    slug,
    created: Date.now(),
    clicks: 0,
  };

  await env.URLS.put(slug, JSON.stringify(urlData));

  const baseUrl = new URL(request.url).origin;
  return jsonResponse({
    short_url: `${baseUrl}/${slug}`,
    slug,
    original_url: targetUrl,
    stats: `${baseUrl}/api/stats/${slug}`,
  });
}

async function handleRedirect(slug: string, env: Env, request: Request): Promise<Response> {
  const data = await env.URLS.get(slug);
  if (!data) {
    return jsonResponse({ error: 'Short link not found' }, 404);
  }

  const urlData: URLData = JSON.parse(data);
  urlData.clicks++;
  await env.URLS.put(slug, JSON.stringify(urlData));

  return Response.redirect(urlData.url, 301);
}

async function handleStats(slug: string, env: Env): Promise<Response> {
  const data = await env.URLS.get(slug);
  if (!data) {
    return jsonResponse({ error: 'Slug not found' }, 404);
  }

  const urlData: URLData = JSON.parse(data);
  return jsonResponse({
    slug,
    url: urlData.url,
    created: new Date(urlData.created).toISOString(),
    total_clicks: urlData.clicks,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Shorten API
    if (url.pathname === '/api/shorten') {
      return handleShorten(request, env, url);
    }

    // Stats API
    if (url.pathname.startsWith('/api/stats/')) {
      const slug = url.pathname.split('/api/stats/')[1];
      return handleStats(slug, env);
    }

    // Root path - API info
    if (url.pathname === '/' || url.pathname === '') {
      return jsonResponse({
        name: 'URL Shortener API',
        version: '1.0.0',
        endpoints: {
          shorten: 'GET/POST /api/shorten?url=YOUR_URL&slug=optional',
          stats: 'GET /api/stats/:slug',
          redirect: 'GET /:slug',
        },
        example: '/api/shorten?url=https://github.com',
        docs: 'https://workerscando.com/projects/url-shortener'
      });
    }

    // Redirect handler
    if (url.pathname.length > 1) {
      const slug = url.pathname.slice(1);
      return handleRedirect(slug, env, request);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};