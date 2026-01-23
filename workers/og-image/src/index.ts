/**
 * OG Image Generator - Optimized
 * Generates SVG Open Graph images on-the-fly.
 */

const T = {
  midnight: { bg: '#0f0f23', t: '#fff', a: '#6366f1', al: '#818cf8', m: '#94a3b8' },
  sunset: { bg: '#1f1d2e', t: '#fff', a: '#f97316', al: '#fb923c', m: '#a1a1aa' },
  ocean: { bg: '#0c1929', t: '#fff', a: '#06b6d4', al: '#22d3ee', m: '#94a3b8' },
  forest: { bg: '#0f1a0f', t: '#fff', a: '#22c55e', al: '#4ade80', m: '#a1a1aa' },
  minimal: { bg: '#fafafa', t: '#18181b', a: '#18181b', al: '#3f3f46', m: '#71717a' },
  rose: { bg: '#1c1017', t: '#fff', a: '#f43f5e', al: '#fb7185', m: '#a1a1aa' },
} as const;

type TN = keyof typeof T;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cut = (s: string, n: number) => s.length <= n ? s : s.slice(0, n - 1) + '…';

function wrap(txt: string, max: number, fs: number): string[] {
  const w = txt.split(' '), lines: string[] = [];
  let line = '';
  for (const word of w) {
    const test = line ? `${line} ${word}` : word;
    if (test.length * fs * 0.5 > max && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function svg(p: { title: string; subtitle?: string; author?: string; domain?: string; theme?: TN; layout?: string; emoji?: string }) {
  const W = 1200, H = 630;
  const th = T[p.theme || 'midnight'];
  const l = p.layout || 'standard';
  const title = esc(cut(p.title, 80));
  const sub = p.subtitle ? esc(cut(p.subtitle, 120)) : '';
  const auth = p.author ? esc(p.author) : '';
  const dom = p.domain ? esc(p.domain) : '';
  const em = p.emoji || '';

  const tspan = (lines: string[], dy: number) => lines.map((ln, i) => `<tspan x="0" dy="${i ? dy : 0}">${ln}</tspan>`).join('');

  let c = '';
  if (l === 'centered') {
    c = `<g transform="translate(600,315)">
      ${em ? `<text y="-120" font-size="72" text-anchor="middle">${em}</text>` : ''}
      <text y="${em ? 0 : -40}" font-family="system-ui" font-size="56" font-weight="700" fill="${th.t}" text-anchor="middle">${title}</text>
      ${sub ? `<text y="${em ? 60 : 30}" font-family="system-ui" font-size="24" fill="${th.m}" text-anchor="middle">${sub}</text>` : ''}
      ${auth || dom ? `<text y="${em ? 130 : 100}" font-family="system-ui" font-size="20" fill="${th.a}" text-anchor="middle">${auth}${auth && dom ? ' · ' : ''}${dom}</text>` : ''}</g>`;
  } else if (l === 'minimal') {
    c = `<line x1="80" y1="550" x2="1120" y2="550" stroke="${th.a}" stroke-width="2"/>
      <text x="80" y="290" font-family="system-ui" font-size="64" font-weight="600" fill="${th.t}">${tspan(wrap(title, 1000, 64), 76)}</text>
      <text x="80" y="580" font-family="system-ui" font-size="18" fill="${th.m}">${dom}</text>
      <text x="1040" y="580" font-family="system-ui" font-size="18" fill="${th.m}">${auth}</text>`;
  } else if (l === 'bold') {
    c = `<rect width="1200" height="12" fill="${th.a}"/><rect y="618" width="1200" height="12" fill="${th.a}"/>
      ${em ? `<text x="80" y="160" font-size="80">${em}</text>` : ''}
      <text x="80" y="340" font-family="system-ui" font-size="72" font-weight="800" fill="${th.t}">${tspan(wrap(title, 900, 72), 82)}</text>
      <g transform="translate(80,560)"><rect x="-10" y="-25" width="${(auth.length + dom.length) * 10 + 60}" height="40" rx="20" fill="${th.a}"/>
      <text font-family="system-ui" font-size="16" font-weight="600" fill="${th.bg}">${auth}${auth && dom ? ' · ' : ''}${dom}</text></g>`;
  } else if (l === 'split') {
    c = `<rect width="8" height="630" fill="${th.a}"/><rect x="800" width="400" height="630" fill="${th.a}" opacity="0.1"/>
      ${em ? `<text x="80" y="160" font-size="64">${em}</text>` : ''}
      <text x="80" y="${em ? 260 : 200}" font-family="system-ui" font-size="52" font-weight="700" fill="${th.t}">${tspan(wrap(title, 500, 52), 62)}</text>
      ${sub ? `<text x="80" y="${em ? 380 : 350}" font-family="system-ui" font-size="22" fill="${th.m}">${sub}</text>` : ''}
      <text x="80" y="550" font-family="system-ui" font-size="18" fill="${th.a}">${auth}${auth && dom ? ' · ' : ''}${dom}</text>`;
  } else {
    c = `<rect width="1200" height="6" fill="${th.a}"/>
      ${em ? `<text x="80" y="125" font-size="56">${em}</text>` : ''}
      <text x="${em ? 160 : 80}" y="125" font-family="system-ui" font-size="18" font-weight="500" fill="${th.a}" letter-spacing="2">${dom.toUpperCase()}</text>
      <text x="80" y="290" font-family="system-ui" font-size="58" font-weight="700" fill="${th.t}">${tspan(wrap(title, 1000, 58), 70)}</text>
      ${sub ? `<text x="80" y="420" font-family="system-ui" font-size="24" fill="${th.m}">${sub}</text>` : ''}
      ${auth ? `<text x="80" y="570" font-family="system-ui" font-size="18" fill="${th.t}">${auth}</text>` : ''}`;
  }

  return `<?xml version="1.0"?><svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${th.bg}"/>${c}</svg>`;
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };

export default {
  async fetch(req: Request): Promise<Response> {
    const u = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (u.pathname === '/api/og') {
      const s = svg({
        title: u.searchParams.get('title') || 'Hello World',
        subtitle: u.searchParams.get('subtitle') || undefined,
        author: u.searchParams.get('author') || undefined,
        domain: u.searchParams.get('domain') || undefined,
        theme: (u.searchParams.get('theme') as TN) || 'midnight',
        layout: u.searchParams.get('layout') || 'standard',
        emoji: u.searchParams.get('emoji') || undefined,
      });
      return new Response(s, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400', ...CORS } });
    }

    return new Response(JSON.stringify({ api: 'OG Image', endpoint: '/api/og', params: ['title', 'subtitle', 'author', 'domain', 'theme', 'layout', 'emoji'] }), {
      headers: { 'Content-Type': 'application/json', ...CORS }
    });
  },
};
