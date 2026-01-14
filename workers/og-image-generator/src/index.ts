/**
 * Dynamic OG Image Generator
 * 
 * A Cloudflare Worker that generates beautiful Open Graph images on-the-fly.
 * Perfect for blog posts, social sharing, documentation, and more.
 * 
 * Uses SVG generation for consistent, sharp output.
 */

import type { ExecutionContext } from '@cloudflare/workers-types';

export interface Env {}

type ThemeName = 'midnight' | 'sunset' | 'ocean' | 'forest' | 'minimal' | 'rose';
type LayoutName = 'standard' | 'centered' | 'split' | 'minimal' | 'bold';

const themes: Record<ThemeName, { bg: string; bgSolid: string; text: string; accent: string; accentLight: string; muted: string }> = {
  midnight: {
    bg: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d1f 100%)',
    bgSolid: '#0f0f23',
    text: '#ffffff',
    accent: '#6366f1',
    accentLight: '#818cf8',
    muted: '#94a3b8',
  },
  sunset: {
    bg: 'linear-gradient(135deg, #1f1d2e 0%, #2d1b3d 50%, #1a1625 100%)',
    bgSolid: '#1f1d2e',
    text: '#ffffff',
    accent: '#f97316',
    accentLight: '#fb923c',
    muted: '#a1a1aa',
  },
  ocean: {
    bg: 'linear-gradient(135deg, #0c1929 0%, #0f2847 50%, #071520 100%)',
    bgSolid: '#0c1929',
    text: '#ffffff',
    accent: '#06b6d4',
    accentLight: '#22d3ee',
    muted: '#94a3b8',
  },
  forest: {
    bg: 'linear-gradient(135deg, #0f1a0f 0%, #1a2e1a 50%, #0d150d 100%)',
    bgSolid: '#0f1a0f',
    text: '#ffffff',
    accent: '#22c55e',
    accentLight: '#4ade80',
    muted: '#a1a1aa',
  },
  minimal: {
    bg: 'linear-gradient(135deg, #fafafa 0%, #f4f4f5 50%, #e4e4e7 100%)',
    bgSolid: '#fafafa',
    text: '#18181b',
    accent: '#18181b',
    accentLight: '#3f3f46',
    muted: '#71717a',
  },
  rose: {
    bg: 'linear-gradient(135deg, #1c1017 0%, #2d1a24 50%, #170d12 100%)',
    bgSolid: '#1c1017',
    text: '#ffffff',
    accent: '#f43f5e',
    accentLight: '#fb7185',
    muted: '#a1a1aa',
  },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
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
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.slice(0, 3);
}


interface OGParams {
  title: string;
  subtitle?: string;
  author?: string;
  domain?: string;
  theme?: ThemeName;
  layout?: LayoutName;
  emoji?: string;
  date?: string;
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
  const date = params.date ? escapeHtml(params.date) : '';

  let contentLayout = '';
  let decorativeElements = '';

  switch (layout) {
    case 'centered':
      decorativeElements = `
        <circle cx="100" cy="100" r="300" fill="${theme.accent}" opacity="0.05"/>
        <circle cx="1100" cy="530" r="250" fill="${theme.accentLight}" opacity="0.05"/>
      `;
      contentLayout = `
        <g transform="translate(${width / 2}, ${height / 2})">
          ${emoji ? `<text x="0" y="-120" font-size="72" text-anchor="middle" fill="${theme.text}">${emoji}</text>` : ''}
          <text x="0" y="${emoji ? '0' : '-40'}" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" fill="${theme.text}" text-anchor="middle">${title}</text>
          ${subtitle ? `<text x="0" y="${emoji ? '60' : '30'}" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${theme.muted}" text-anchor="middle">${subtitle}</text>` : ''}
          ${author || domain ? `
            <text x="0" y="${emoji ? '130' : '100'}" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="${theme.accent}" text-anchor="middle">
              ${author}${author && domain ? ' · ' : ''}${domain}
            </text>
          ` : ''}
        </g>
      `;
      break;

    case 'minimal':
      decorativeElements = `
        <line x1="80" y1="${height - 80}" x2="${width - 80}" y2="${height - 80}" stroke="${theme.accent}" stroke-width="2"/>
      `;
      const titleLines = wrapText(title, 1000, 64);
      contentLayout = `
        <g transform="translate(80, ${height / 2 - 40})">
          <text font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="600" fill="${theme.text}">
            ${titleLines.map((line, i) => `<tspan x="0" dy="${i === 0 ? 0 : 76}">${line}</tspan>`).join('')}
          </text>
        </g>
        <g transform="translate(80, ${height - 50})">
          <text font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${theme.muted}">${domain}</text>
          <text x="${width - 160}" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${theme.muted}" text-anchor="end">${date || author}</text>
        </g>
      `;
      break;

    case 'bold':
      decorativeElements = `
        <rect x="0" y="0" width="${width}" height="12" fill="${theme.accent}"/>
        <rect x="0" y="${height - 12}" width="${width}" height="12" fill="${theme.accent}"/>
        <circle cx="${width - 150}" cy="150" r="200" fill="${theme.accent}" opacity="0.1"/>
        <circle cx="${width - 100}" cy="200" r="150" fill="${theme.accentLight}" opacity="0.08"/>
      `;
      const boldTitleLines = wrapText(title, 900, 72);
      contentLayout = `
        <g transform="translate(80, 120)">
          ${emoji ? `<text font-size="80" fill="${theme.text}">${emoji}</text>` : ''}
        </g>
        <g transform="translate(80, ${height / 2 + 20})">
          <text font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="${theme.text}" letter-spacing="-2">
            ${boldTitleLines.map((line, i) => `<tspan x="0" dy="${i === 0 ? 0 : 82}">${line}</tspan>`).join('')}
          </text>
        </g>
        ${author || domain ? `
          <g transform="translate(80, ${height - 60})">
            <rect x="-10" y="-25" width="${(author.length + domain.length) * 10 + 60}" height="40" rx="20" fill="${theme.accent}"/>
            <text font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="${theme.bgSolid}">${author}${author && domain ? ' · ' : ''}${domain}</text>
          </g>
        ` : ''}
      `;
      break;

    default: // standard
      decorativeElements = `
        <rect x="0" y="0" width="${width}" height="6" fill="${theme.accent}"/>
        <circle cx="-100" cy="${height + 100}" r="400" fill="${theme.accent}" opacity="0.05"/>
        <circle cx="${width + 50}" cy="-50" r="300" fill="${theme.accentLight}" opacity="0.05"/>
      `;
      const standardTitleLines = wrapText(title, 1000, 58);
      contentLayout = `
        <g transform="translate(80, 80)">
          ${emoji ? `<text font-size="56" fill="${theme.text}">${emoji}</text>` : ''}
          ${domain ? `<text x="${emoji ? '80' : '0'}" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="${theme.accent}" text-transform="uppercase" letter-spacing="2">${domain}</text>` : ''}
        </g>
        <g transform="translate(80, 220)">
          <text font-family="system-ui, -apple-system, sans-serif" font-size="58" font-weight="700" fill="${theme.text}">
            ${standardTitleLines.map((line, i) => `<tspan x="0" dy="${i === 0 ? 0 : 70}">${line}</tspan>`).join('')}
          </text>
        </g>
        ${subtitle ? `
          <g transform="translate(80, 420)">
            <text font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${theme.muted}">${subtitle}</text>
          </g>
        ` : ''}
        <g transform="translate(80, ${height - 60})">
          ${author ? `
            <circle cx="20" cy="-8" r="20" fill="${theme.accent}" opacity="0.2"/>
            <text x="20" y="-2" font-size="20" text-anchor="middle" fill="${theme.text}" font-weight="600">${author.charAt(0).toUpperCase()}</text>
            <text x="55" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${theme.text}">${author}</text>
          ` : ''}
          ${date ? `<text x="${width - 160}" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="${theme.muted}" text-anchor="end">${date}</text>` : ''}
        </g>
      `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.bgSolid};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${theme.bgSolid};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.bgSolid};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  
  <!-- Decorative elements -->
  ${decorativeElements}
  
  <!-- Content -->
  ${contentLayout}
</svg>`;
}

function parseParams(url: URL): OGParams {
  const title = url.searchParams.get('title') || 'Hello World';
  const subtitle = url.searchParams.get('subtitle') || undefined;
  const author = url.searchParams.get('author') || undefined;
  const domain = url.searchParams.get('domain') || undefined;
  const theme = (url.searchParams.get('theme') as ThemeName) || 'midnight';
  const layout = (url.searchParams.get('layout') as LayoutName) || 'standard';
  const emoji = url.searchParams.get('emoji') || undefined;
  const date = url.searchParams.get('date') || undefined;

  return { title, subtitle, author, domain, theme, layout, emoji, date };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS
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
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
          ...corsHeaders,
        },
      });
    }

    // Return 404 for other routes
    return new Response('Not Found', { status: 404 });
  },
};
