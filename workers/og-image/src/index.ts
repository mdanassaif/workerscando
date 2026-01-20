/**
 * Dynamic OG Image Generator
 * 
 * A Cloudflare Worker that generates beautiful Open Graph images on-the-fly.
 * Returns SVG images. No HTML UI - API only.
 */

export interface Env { }

const themes = {
  midnight: { bgSolid: '#0f0f23', text: '#ffffff', accent: '#6366f1', muted: '#94a3b8' },
  sunset: { bgSolid: '#1f1d2e', text: '#ffffff', accent: '#f97316', muted: '#a1a1aa' },
  ocean: { bgSolid: '#0c1929', text: '#ffffff', accent: '#06b6d4', muted: '#94a3b8' },
  forest: { bgSolid: '#0f1a0f', text: '#ffffff', accent: '#22c55e', muted: '#a1a1aa' },
  minimal: { bgSolid: '#fafafa', text: '#18181b', accent: '#18181b', muted: '#71717a' },
  rose: { bgSolid: '#1c1017', text: '#ffffff', accent: '#f43f5e', muted: '#a1a1aa' },
} as const;

type ThemeName = keyof typeof themes;

interface OGParams {
  title: string;
  subtitle?: string;
  author?: string;
  domain?: string;
  theme?: ThemeName;
  emoji?: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncateText(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : text.slice(0, maxLength - 1) + '…';
}

function generateSVG(params: OGParams): string {
  const width = 1200;
  const height = 630;
  const theme = themes[params.theme || 'midnight'];

  const title = escapeHtml(truncateText(params.title, 80));
  const subtitle = params.subtitle ? escapeHtml(truncateText(params.subtitle, 120)) : '';
  const author = params.author ? escapeHtml(params.author) : '';
  const domain = params.domain ? escapeHtml(params.domain) : '';
  const emoji = params.emoji || '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${theme.bgSolid}"/>
  <rect x="0" y="0" width="${width}" height="6" fill="${theme.accent}"/>
  
  <g transform="translate(80, 80)">
    ${emoji ? `<text font-size="56">${emoji}</text>` : ''}
    <text x="${emoji ? '80' : '0'}" y="45" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="${theme.accent}">${domain}</text>
  </g>
  
  <g transform="translate(80, 220)">
    <text font-family="system-ui, sans-serif" font-size="58" font-weight="700" fill="${theme.text}">${title}</text>
  </g>
  
  ${subtitle ? `
  <g transform="translate(80, 320)">
    <text font-family="system-ui, sans-serif" font-size="24" fill="${theme.muted}">${subtitle}</text>
  </g>
  ` : ''}
  
  <g transform="translate(80, ${height - 60})">
    ${author ? `<text font-family="system-ui, sans-serif" font-size="18" fill="${theme.text}">${author}</text>` : ''}
  </g>
</svg>`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function parseParams(url: URL): OGParams {
  return {
    title: url.searchParams.get('title') || 'Hello World',
    subtitle: url.searchParams.get('subtitle') || undefined,
    author: url.searchParams.get('author') || undefined,
    domain: url.searchParams.get('domain') || undefined,
    theme: (url.searchParams.get('theme') as ThemeName) || 'midnight',
    emoji: url.searchParams.get('emoji') || undefined,
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // OG Image API
    if (url.pathname === '/api/og') {
      const params = parseParams(url);
      const svg = generateSVG(params);

      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
          ...corsHeaders,
        },
      });
    }

    // API info (JSON only, no HTML)
    return new Response(JSON.stringify({
      name: 'OG Image Generator',
      version: '1.0.0',
      endpoint: '/api/og',
      params: {
        title: 'required - The main title',
        subtitle: 'optional - Subtitle text',
        author: 'optional - Author name',
        domain: 'optional - Domain to display',
        theme: 'optional - midnight, sunset, ocean, forest, minimal, rose',
        emoji: 'optional - Emoji to display',
      },
      example: '/api/og?title=Hello%20World&theme=ocean&domain=example.com',
      docs: 'https://workerscando.com/projects/dynamic-og-images'
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
