/**
 * URL Metadata API - Optimized
 * Extracts metadata from any URL.
 */

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

const meta = (html: string, p: string): string | undefined => {
  const m = html.match(new RegExp(`<meta[^>]*(?:property|name)=["']${p}["'][^>]*content=["']([^"']*)`, 'i')) ||
    html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${p}["']`, 'i'));
  return m?.[1];
};

const title = (html: string) => html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();

const favicon = (html: string, base: string) => {
  const m = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
  if (m) return resolve(m[1], base);
  try { return new URL(base).origin + '/favicon.ico'; } catch { return undefined; }
};

const resolve = (url: string, base: string): string => {
  if (!url || url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  try { const b = new URL(base); return url.startsWith('/') ? b.origin + url : b.origin + '/' + url; } catch { return url; }
};

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

async function extract(url: string) {
  const r: any = { success: false, url, fetchedAt: new Date().toISOString() };

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MetadataBot/1.0)', 'Accept': 'text/html' },
      redirect: 'follow',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) { r.success = true; r.type = ct.split(';')[0]; return r; }

    const html = await res.text();
    r.title = meta(html, 'og:title') || (title(html) ? decode(title(html)!) : undefined);
    r.description = meta(html, 'og:description') || meta(html, 'description');
    r.image = resolve(meta(html, 'og:image') || '', url) || undefined;
    r.favicon = favicon(html, url);
    r.siteName = meta(html, 'og:site_name');

    const tw = {
      card: meta(html, 'twitter:card'),
      site: meta(html, 'twitter:site'),
      title: meta(html, 'twitter:title'),
      description: meta(html, 'twitter:description'),
      image: resolve(meta(html, 'twitter:image') || '', url) || undefined,
    };
    if (Object.values(tw).some(v => v)) r.twitter = tw;

    const og = {
      title: meta(html, 'og:title'),
      description: meta(html, 'og:description'),
      image: resolve(meta(html, 'og:image') || '', url) || undefined,
      url: meta(html, 'og:url'),
      type: meta(html, 'og:type'),
      siteName: meta(html, 'og:site_name'),
    };
    if (Object.values(og).some(v => v)) r.openGraph = og;

    r.success = true;
  } catch (e) {
    r.error = e instanceof Error ? e.message : 'Error';
  }
  return r;
}

export default {
  async fetch(req: Request): Promise<Response> {
    const u = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (u.pathname === '/api/metadata') {
      const target = u.searchParams.get('url');
      if (!target) return new Response(JSON.stringify({ success: false, error: 'Missing url parameter' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });

      const data = await extract(target);
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', ...CORS } });
    }

    return new Response(JSON.stringify({ api: 'URL Metadata', endpoint: '/api/metadata?url=URL' }), { headers: { 'Content-Type': 'application/json', ...CORS } });
  }
};
