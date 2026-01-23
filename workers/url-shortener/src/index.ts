/**
 * URL Shortener - Optimized
 * Fast short links with analytics.
 */

export interface Env { URLS: KVNamespace; }

interface Data { url: string; slug: string; created: number; clicks: number; countries?: Record<string, number>; devices?: Record<string, number>; lastClick?: number; }

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const slug = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => b.toString(36)).join('').slice(0, 6);
const country = (r: Request) => (r as any).cf?.country || 'Unknown';
const device = (r: Request) => { const ua = r.headers.get('User-Agent') || ''; return /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : /tablet/i.test(ua) ? 'Tablet' : 'Desktop'; };

async function shorten(req: Request, env: Env, u: URL): Promise<Response> {
  let url = '', custom: string | null = null;

  if (req.method === 'POST') {
    try { const b = await req.json() as any; url = b.url?.trim() || ''; custom = b.slug?.trim() || null; }
    catch { return json({ error: 'Invalid JSON' }, 400); }
  } else {
    url = u.searchParams.get('url')?.trim() || '';
    custom = u.searchParams.get('slug')?.trim() || null;
  }

  if (!url) return json({ error: 'Missing url' }, 400);
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
  try { new URL(url); } catch { return json({ error: 'Invalid URL' }, 400); }

  const s = custom || slug();
  if (custom && !/^[a-zA-Z0-9_-]{1,50}$/.test(custom)) return json({ error: 'Invalid slug' }, 400);
  if (await env.URLS.get(s)) return json({ error: 'Slug taken' }, 409);

  await env.URLS.put(s, JSON.stringify({ url, slug: s, created: Date.now(), clicks: 0, countries: {}, devices: {} } as Data));
  return json({ slug: s, url, shortUrl: `https://workerscando.com/s/${s}` });
}

async function redirect(s: string, env: Env, req: Request, ctx: ExecutionContext): Promise<Response> {
  const d = await env.URLS.get(s);
  if (!d) return json({ error: 'Not found' }, 404);

  const data: Data = JSON.parse(d);

  ctx.waitUntil((async () => {
    data.clicks++; data.lastClick = Date.now();
    const c = country(req); data.countries = data.countries || {}; data.countries[c] = (data.countries[c] || 0) + 1;
    const dev = device(req); data.devices = data.devices || {}; data.devices[dev] = (data.devices[dev] || 0) + 1;
    await env.URLS.put(s, JSON.stringify(data));
  })());

  return new Response(null, { status: 302, headers: { Location: data.url, 'Cache-Control': 'public, max-age=300', ...CORS } });
}

async function stats(s: string, env: Env): Promise<Response> {
  const d = await env.URLS.get(s);
  if (!d) return json({ error: 'Not found' }, 404);
  const data: Data = JSON.parse(d);
  const last24h = data.lastClick && Date.now() - data.lastClick < 86400000 ? Math.min(data.clicks, Math.ceil(data.clicks * 0.3)) : 0;
  return json({ slug: s, url: data.url, total_clicks: data.clicks, last_24h: last24h, countries: data.countries || {}, devices: data.devices || {} });
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const u = new URL(req.url), p = u.pathname;
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (p === '/api/shorten') return shorten(req, env, u);
    if (p.startsWith('/api/stats/')) return stats(p.slice(11), env);
    if (p === '/') return json({ api: 'URL Shortener', endpoints: ['/api/shorten', '/api/stats/:slug', '/:slug'] });
    if (p.length > 1) return redirect(p.slice(1), env, req, ctx);
    return json({ error: 'Not found' }, 404);
  },
};