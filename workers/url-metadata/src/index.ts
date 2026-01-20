/**
 * URL Metadata Extractor API
 * 
 * A Cloudflare Worker that fetches and extracts metadata from any URL.
 * Returns Open Graph data, Twitter cards, favicons, and basic page info.
 */

import type { ExecutionContext } from '@cloudflare/workers-types';

export interface Env { }

interface MetadataResult {
  success: boolean;
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  type?: string;
  author?: string;
  publishedDate?: string;
  keywords?: string[];
  themeColor?: string;
  twitter?: {
    card?: string;
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
    locale?: string;
  };
  error?: string;
  fetchedAt: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function extractMetaContent(html: string, property: string): string | undefined {
  const propertyMatch = html.match(
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)"`, 'i')
  );
  if (propertyMatch) return propertyMatch[1];

  const nameMatch = html.match(
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)"`, 'i')
  );
  if (nameMatch) return nameMatch[1];

  const reverseMatch = html.match(
    new RegExp(`<meta[^>]*content=["']([^"']*)"[^>]*(?:property|name)=["']${property}["']`, 'i')
  );
  if (reverseMatch) return reverseMatch[1];

  return undefined;
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decodeHTMLEntities(match[1].trim()) : undefined;
}

function extractFavicon(html: string, baseUrl: string): string | undefined {
  const match = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
  if (match) return resolveUrl(match[1], baseUrl);

  try {
    const url = new URL(baseUrl);
    return `${url.origin}/favicon.ico`;
  } catch {
    return undefined;
  }
}

function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  try {
    const base = new URL(baseUrl);
    return url.startsWith('/') ? `${base.origin}${url}` : `${base.origin}/${url}`;
  } catch {
    return url;
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

async function extractMetadata(url: string): Promise<MetadataResult> {
  const result: MetadataResult = {
    success: false,
    url,
    fetchedAt: new Date().toISOString(),
  };

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      result.success = true;
      result.type = contentType.split(';')[0];
      return result;
    }

    const html = await response.text();

    result.title = extractMetaContent(html, 'og:title') || extractTitle(html);
    result.description = extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description');
    result.image = extractMetaContent(html, 'og:image');
    if (result.image) result.image = resolveUrl(result.image, url);
    result.favicon = extractFavicon(html, url);
    result.siteName = extractMetaContent(html, 'og:site_name');
    result.type = extractMetaContent(html, 'og:type');
    result.author = extractMetaContent(html, 'author');
    result.themeColor = extractMetaContent(html, 'theme-color');

    result.twitter = {
      card: extractMetaContent(html, 'twitter:card'),
      site: extractMetaContent(html, 'twitter:site'),
      title: extractMetaContent(html, 'twitter:title'),
      description: extractMetaContent(html, 'twitter:description'),
      image: extractMetaContent(html, 'twitter:image'),
    };
    if (result.twitter.image) result.twitter.image = resolveUrl(result.twitter.image, url);
    if (Object.values(result.twitter).every(v => v === undefined)) delete result.twitter;

    result.openGraph = {
      title: extractMetaContent(html, 'og:title'),
      description: extractMetaContent(html, 'og:description'),
      image: extractMetaContent(html, 'og:image'),
      url: extractMetaContent(html, 'og:url'),
      type: extractMetaContent(html, 'og:type'),
      siteName: extractMetaContent(html, 'og:site_name'),
    };
    if (result.openGraph.image) result.openGraph.image = resolveUrl(result.openGraph.image, url);
    if (Object.values(result.openGraph).every(v => v === undefined)) delete result.openGraph;

    result.success = true;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API endpoint
    if (url.pathname === '/api/metadata') {
      const targetUrl = url.searchParams.get('url');

      if (!targetUrl) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required parameter: url' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const metadata = await extractMetadata(targetUrl);
      return new Response(JSON.stringify(metadata, null, 2), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', ...corsHeaders },
      });
    }

    // API info (JSON only, no HTML)
    return new Response(JSON.stringify({
      name: 'URL Metadata API',
      version: '1.0.0',
      endpoint: '/api/metadata?url=YOUR_URL',
      example: '/api/metadata?url=https://github.com',
      docs: 'https://workerscando.com/projects/url-metadata-api'
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
