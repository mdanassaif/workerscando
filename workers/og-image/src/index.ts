/**
 * Dynamic OG Image Generator
 * 
 * A Cloudflare Worker that generates beautiful Open Graph images on-the-fly.
 * Returns SVG images. API only.
 */

export interface Env { }

const themes = {
  midnight: { bgSolid: '#0f0f23', text: '#ffffff', accent: '#6366f1', accentLight: '#818cf8', muted: '#94a3b8' },
  sunset: { bgSolid: '#1f1d2e', text: '#ffffff', accent: '#f97316', accentLight: '#fb923c', muted: '#a1a1aa' },
  ocean: { bgSolid: '#0c1929', text: '#ffffff', accent: '#06b6d4', accentLight: '#22d3ee', muted: '#94a3b8' },
  forest: { bgSolid: '#0f1a0f', text: '#ffffff', accent: '#22c55e', accentLight: '#4ade80', muted: '#a1a1aa' },
  minimal: { bgSolid: '#fafafa', text: '#18181b', accent: '#18181b', accentLight: '#3f3f46', muted: '#71717a' },
  rose: { bgSolid: '#1c1017', text: '#ffffff', accent: '#f43f5e', accentLight: '#fb7185', muted: '#a1a1aa' },
} as const;

type ThemeName = keyof typeof themes;
type LayoutName = 'standard' | 'centered' | 'minimal' | 'bold';

interface OGParams {
  title: string;
  subtitle?: string;
  author?: string;
  domain?: string;
  theme?: ThemeName;
  layout?: LayoutName;
  emoji?: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncateText(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : text.slice(0, maxLength - 1) + '…';
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const charWidth = fontSize * 0.5;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * charWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3);
}

function generateSVG(params: OGParams): string {
  const width = 1200;
  const height = 630;
  const theme = themes[params.theme || 'midnight'];
  const layout = params.layout || 'standard';

  const title = escapeHtml(truncateText(params.title, 80));
  const subtitle = params.subtitle ? escapeHtml(truncateText(params.subtitle, 120)) : '';
  const author = params.author ? escapeHtml(params.author) : '';
  const domain = params.domain ? escapeHtml(params.domain) : '';
  const emoji = params.emoji || '';

  let contentLayout = '';

  switch (layout) {
    case 'centered':
      contentLayout = `
        <circle cx="100" cy="100" r="300" fill="${theme.accent}" opacity="0.05"/>
        <circle cx="1100" cy="530" r="250" fill="${theme.accentLight}" opacity="0.05"/>
        <g transform="translate(${width / 2}, ${height / 2})">
          ${emoji ? `<text x="0" y="-120" font-size="72" text-anchor="middle">${emoji}</text>` : ''}
          <text x="0" y="${emoji ? '0' : '-40'}" font-family="system-ui, sans-serif" font-size="56" font-weight="700" fill="${theme.text}" text-anchor="middle">${title}</text>
          ${subtitle ? `<text x="0" y="${emoji ? '60' : '30'}" font-family="system-ui, sans-serif" font-size="24" fill="${theme.muted}" text-anchor="middle">${subtitle}</text>` : ''}
          ${author || domain ? `<text x="0" y="${emoji ? '130' : '100'}" font-family="system-ui, sans-serif" font-size="20" fill="${theme.accent}" text-anchor="middle">${author}${author && domain ? ' · ' : ''}${domain}</text>` : ''}
        </g>
      `;
      break;

    case 'minimal':
      contentLayout = `
        <line x1="80" y1="${height - 80}" x2="${width - 80}" y2="${height - 80}" stroke="${theme.accent}" stroke-width="2"/>
        <g transform="translate(80, ${height / 2 - 40})">
          <text font-family="system-ui, sans-serif" font-size="64" font-weight="600" fill="${theme.text}">
            ${wrapText(title, 1000, 64).map((line, i) => `<tspan x="0" dy="${i === 0 ? 0 : 76}">${line}</tspan>`).join('')}
          </text>
        </g>
        <g transform="translate(80, ${height - 50})">
          <text font-family="system-ui, sans-serif" font-size="18" fill="${theme.muted}">${domain}</text>
          <text x="${width - 160}" font-family="system-ui, sans-serif" font-size="18" fill="${theme.muted}">${author}</text>
        </g>
      `;
      break;

    case 'bold':
      contentLayout = `
        <rect x="0" y="0" width="${width}" height="12" fill="${theme.accent}"/>
        <rect x="0" y="${height - 12}" width="${width}" height="12" fill="${theme.accent}"/>
        <circle cx="${width - 150}" cy="150" r="200" fill="${theme.accent}" opacity="0.1"/>
        <g transform="translate(80, 120)">
          ${emoji ? `<text font-size="80">${emoji}</text>` : ''}
        </g>
        <g transform="translate(80, ${height / 2 + 20})">
          <text font-family="system-ui, sans-serif" font-size="72" font-weight="800" fill="${theme.text}" letter-spacing="-2">
            ${wrapText(title, 900, 72).map((line, i) => `<tspan x="0" dy="${i === 0 ? 0 : 82}">${line}</tspan>`).join('')}
          </text>
        </g>
        <g transform="translate(80, ${height - 60})">
          <rect x="-10" y="-25" width="${(author.length + domain.length) * 10 + 60}" height="40" rx="20" fill="${theme.accent}"/>
          <text font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="${theme.bgSolid}">${author}${author && domain ? ' · ' : ''}${domain}</text>
        </g>
      `;
      break;

    default: // standard
      contentLayout = `
        <rect x="0" y="0" width="${width}" height="6" fill="${theme.accent}"/>
        <circle cx="-100" cy="${height + 100}" r="400" fill="${theme.accent}" opacity="0.05"/>
        <circle cx="${width + 50}" cy="-50" r="300" fill="${theme.accentLight}" opacity="0.05"/>
        <g transform="translate(80, 80)">
          ${emoji ? `<text font-size="56">${emoji}</text>` : ''}
          <text x="${emoji ? '80' : '0'}" y="45" font-family="system-ui, sans-serif" font-size="18" font-weight="500" fill="${theme.accent}" letter-spacing="2">${domain.toUpperCase()}</text>
        </g>
        <g transform="translate(80, 220)">
          <text font-family="system-ui, sans-serif" font-size="58" font-weight="700" fill="${theme.text}">
            ${wrapText(title, 1000, 58).map((line, i) => `<tspan x="0" dy="${i === 0 ? 0 : 70}">${line}</tspan>`).join('')}
          </text>
        </g>
        ${subtitle ? `<g transform="translate(80, 420)"><text font-family="system-ui, sans-serif" font-size="24" fill="${theme.muted}">${subtitle}</text></g>` : ''}
        <g transform="translate(80, ${height - 60})">
          ${author ? `<text font-family="system-ui, sans-serif" font-size="18" fill="${theme.text}">${author}</text>` : ''}
        </g>
      `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${theme.bgSolid}"/>
  ${contentLayout}
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
    layout: (url.searchParams.get('layout') as LayoutName) || 'standard',
    emoji: url.searchParams.get('emoji') || undefined,
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

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
        layout: 'optional - standard, centered, minimal, bold',
        emoji: 'optional - Emoji to display',
      },
      example: '/api/og?title=Hello%20World&theme=ocean&layout=bold&domain=example.com',
      docs: 'https://workerscando.com/projects/dynamic-og-images'
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
