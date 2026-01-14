import type { ExecutionContext } from '@cloudflare/workers-types';

/**
 * URL Metadata API
 * 
 * A Cloudflare Worker that extracts metadata from any URL instantly at the edge.
 * Extracts Open Graph data, Twitter cards, favicons, and more.
 */

export interface Env {}

interface MetadataResponse {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    url?: string;
    siteName?: string;
  };
  twitter?: {
    card?: string;
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  favicons?: {
    icon?: string;
    appleTouchIcon?: string;
    shortcut?: string;
  };
  error?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Simple HTML entity decoder
const decode = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

// Resolve URLs (handles relative, absolute, protocol-relative)
const resolveUrl = (url: string, base: string): string => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  try {
    const baseUrl = new URL(base);
    return url.startsWith('/') ? `${baseUrl.origin}${url}` : `${baseUrl.origin}/${url}`;
  } catch {
    return url;
  }
};

// Extract meta tag content (handles property/name and reverse order)
const getMeta = (html: string, key: string): string | undefined => {
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${key}["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decode(match[1]);
  }
  return undefined;
};

// Extract title
const getTitle = (html: string): string | undefined => {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decode(match[1]) : undefined;
};

// Extract favicon
const getFavicon = (html: string, baseUrl: string): string => {
  const patterns = [
    /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i,
    /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return resolveUrl(match[1], baseUrl);
  }

  try {
    return `${new URL(baseUrl).origin}/favicon.ico`;
  } catch {
    return '';
  }
};

// Extract link tag (for apple-touch-icon, etc.)
const getLink = (html: string, rel: string, baseUrl: string): string | undefined => {
  const match = html.match(new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']*)["']`, 'i'));
  return match ? resolveUrl(match[1], baseUrl) : undefined;
};

// CSS styles for the documentation page
const cssStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #0a0a0b;
  --bg-secondary: #111113;
  --bg-tertiary: #18181b;
  --border: #27272a;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --accent: #60a5fa;
  --accent-hover: #3b82f6;
}

body {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.noise {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

.gradient-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
  top: -200px;
  right: -200px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
  bottom: -150px;
  left: -150px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

header {
  text-align: center;
  margin-bottom: 60px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 24px;
  font-family: 'JetBrains Mono', monospace;
}

h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 8px;
  color: var(--accent);
}

.card-title {
  font-size: 24px;
  font-weight: 600;
}

.demo-form {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.input-wrapper {
  flex: 1;
}

input[type="url"] {
  width: 100%;
  padding: 14px 18px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
}

input[type="url"]:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

button[type="submit"] {
  padding: 14px 32px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

button[type="submit"]:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-area {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.result-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.copy-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent);
  color: var(--accent);
}

pre {
  padding: 24px;
  margin: 0;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.preview-card {
  margin-top: 24px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  display: none;
}

.preview-card.visible {
  display: block;
}

.preview-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: none;
}

.preview-image[src] {
  display: block;
}

.preview-content {
  padding: 20px;
}

.preview-site {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.preview-favicon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  display: none;
}

.preview-favicon[src] {
  display: block;
}

.preview-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.preview-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.endpoint {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 10px;
}

.method {
  padding: 6px 12px;
  background: var(--accent);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.path {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;
}

.params-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
}

.params-table thead {
  background: var(--bg-tertiary);
}

.params-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.params-table td {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.param-name {
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent);
  font-weight: 600;
  margin-right: 8px;
}

.param-required {
  padding: 2px 8px;
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.feature {
  padding: 24px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-align: center;
}

.feature-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

footer {
  text-align: center;
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 14px;
}

footer a {
  color: var(--accent);
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

.loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  h1 {
    font-size: 36px;
  }
  
  .demo-form {
    flex-direction: column;
  }
  
  button[type="submit"] {
    width: 100%;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
`;

// HTML documentation template
function getDocsHTML(cssContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>URL Metadata API</title>
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="URL Metadata API">
  <meta name="description" content="Extract Open Graph data, Twitter cards, favicons, and more from any URL. Perfect for link previews. Runs on Cloudflare Workers.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="URL Metadata API">
  <meta property="og:description" content="Extract Open Graph data, Twitter cards, favicons, and more from any URL. Perfect for link previews.">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:title" content="URL Metadata API">
  <meta property="twitter:description" content="Extract Open Graph data, Twitter cards, favicons, and more from any URL. Perfect for link previews.">
  
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${cssContent}</style>
</head>
<body>
  <div class="noise"></div>
  <div class="gradient-orb orb-1"></div>
  <div class="gradient-orb orb-2"></div>
  
  <div class="container">
    <header>
      <div class="badge">
        <span>Cloudflare Workers</span>
      </div>
      <h1>URL Metadata API</h1>
      <p class="subtitle">Extract Open Graph data, Twitter cards, favicons, and more from any URL. Perfect for link previews.</p>
    </header>

    <div class="card">
      <div class="card-header">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><path fill="currentColor" d="M478.479 61.375c-55.278 0-108.521 8.66-158.25 25.738c-22.84 7.844-44.622 17.345-65.213 28.401c-20.026-10.522-41.174-19.587-63.313-27.116C142.007 71.5 88.788 62.931 33.522 62.931c-15.803 0-28.614 12.811-28.614 28.614s12.811 28.614 28.614 28.614c58.48 0 114.81 11.113 164.91 32.007c-64.631 50.071-105.018 114.785-105.978 169.69a28.707 28.707 0 0 0-.077 1.997c0 90.229 73.406 163.635 163.634 163.635h.054c90.228 0 163.634-73.406 163.634-163.635c0-.67-.031-1.332-.077-1.99c-.964-55.156-41.865-120.042-107.24-169.868c-.149-.114-.302-.223-.452-.337c50.529-21.572 107.453-33.054 166.548-33.054c15.803 0 28.614-12.811 28.614-28.614s-12.811-28.615-28.613-28.615zM277.692 197.511c58.527 44.607 84.725 95.598 84.725 126.343c0 58.664-47.719 106.391-106.379 106.406c-58.66-.015-106.379-47.742-106.379-106.406c0-30.871 26.215-82.173 84.78-127.192a338.643 338.643 0 0 1 20.866-14.79c7.701 4.941 15.18 10.146 22.387 15.639z"/></svg>
        </div>
        <h2 class="card-title">Try it out</h2>
      </div>
      
      <form class="demo-form" id="demoForm">
        <div class="input-wrapper">
          <input 
            type="url" 
            id="urlInput" 
            placeholder="https://example.com" 
            value="https://www.cloudflare.com"
            required
          >
        </div>
        <button type="submit" id="submitBtn">Extract</button>
      </form>

      <div class="result-area">
        <div class="result-header">
          <span class="result-label">Response</span>
          <button class="copy-btn" id="copyBtn">Copy</button>
        </div>
        <pre id="resultPre">// Enter a URL and click Extract</pre>
      </div>

      <div class="preview-card" id="previewCard">
        <img class="preview-image" id="previewImage" src="" alt="">
        <div class="preview-content">
          <div class="preview-site">
            <img class="preview-favicon" id="previewFavicon" src="" alt="">
            <span id="previewSite"></span>
          </div>
          <div class="preview-title" id="previewTitle"></div>
          <div class="preview-description" id="previewDesc"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5 4v6.333v-.025V20V4v4v-4Zm2.5 9.5h3.596q.148-.287.32-.527q.17-.24.365-.473H7.5v1Zm0 4h2.887q-.053-.25-.07-.5q-.015-.25-.004-.5H7.5v1ZM4 21V3h9.5L18 7.5v3.02q-.244-.085-.494-.121q-.25-.036-.506-.066V8h-4V4H5v16h6.39q.186.288.418.533q.232.246.486.467H4Zm12.504-1.692q1.18 0 1.992-.816q.812-.815.812-1.996q0-1.18-.816-1.992q-.815-.812-1.996-.812q-1.18 0-1.992.816q-.812.815-.812 1.996q0 1.18.816 1.992q.815.812 1.996.812Zm5.096 2.98l-2.777-2.776q-.486.388-1.08.592t-1.243.204q-1.587 0-2.697-1.11t-1.11-2.698q0-1.587 1.11-2.697t2.697-1.11q1.587 0 2.697 1.11t1.11 2.697q0 .65-.203 1.243t-.592 1.08l2.776 2.777l-.688.688Z"/></svg>
        </div>
        <h2 class="card-title">API Reference</h2>
      </div>

      <div class="endpoint">
        <span class="method">GET</span>
        <span class="path">/api/metadata?url={url}</span>
      </div>

      <table class="params-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span class="param-name">url</span>
              <span class="param-required">required</span>
            </td>
            <td>The URL to extract metadata from (must be URL-encoded)</td>
          </tr>
        </tbody>
      </table>

      <div class="features-grid">
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 2048 2048"><path fill="currentColor" d="M2048 256v1536H0V256h2048zm-128 128H128v512h256v256H128v512h1024v-256h256v256h256v-256h256V384zM640 896H384V640h256v256zm0 256V896h256v256H640zm512 0v256H896v-256h256zm512 0v256h-256v-256h256zm0-256h-256V640h256v256z"/></svg>
          </div>
          <div class="feature-title">Open Graph</div>
          <div class="feature-desc">Title, description, image, type, and more</div>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-2 -2 24 24"><g fill="currentColor"><path d="M15 6.947c-.368.16-.763.27-1.178.318c.424-.25.748-.646.902-1.117a4.16 4.16 0 0 1-1.304.49A2.06 2.06 0 0 0 11.923 6c-1.133 0-2.051.905-2.051 2.02c0 .158.018.312.053.46a5.854 5.854 0 0 1-4.228-2.11a1.982 1.982 0 0 0-.278 1.015c0 .7.363 1.32.913 1.681a2.076 2.076 0 0 1-.93-.253v.025a2.03 2.03 0 0 0 1.646 1.98a2.108 2.108 0 0 1-.927.034a2.049 2.049 0 0 0 1.916 1.403a4.156 4.156 0 0 1-2.548.864c-.165 0-.328-.01-.489-.028A5.863 5.863 0 0 0 8.144 14c3.774 0 5.837-3.078 5.837-5.748l-.007-.262A4.063 4.063 0 0 0 15 6.947z"/><path d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4zm0-2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"/></g></svg>
          </div>
          <div class="feature-title">Twitter Cards</div>
          <div class="feature-desc">Card type, creator, site handle</div>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M2 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zm4 2v4"/><path d="M11 10a2 2 0 1 0 0 4m3-2a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/></g></svg>
          </div>
          <div class="feature-title">Favicons</div>
          <div class="feature-desc">Site icons and apple-touch-icons</div>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20"><path fill="currentColor" d="M11 4a6 6 0 1 1-3.3 11.012V15h-.018A6 6 0 0 1 11 4ZM5.255 14c.25.36.534.694.846 1H1.5a.5.5 0 0 0 0 1h5.892a7 7 0 1 0 0-12H2.5a.5.5 0 0 0 0 1h3.601A6.979 6.979 0 0 0 4 10c0 1.074.242 2.09.674 3H3.5a.5.5 0 0 0 0 1h1.755Zm2.942-6.096A3.484 3.484 0 0 0 7.5 10c0 .786.26 1.512.697 2.096l1.08-1.08A1.991 1.991 0 0 1 9 10c0-.37.101-.718.277-1.016l-1.08-1.08Zm.707-.707l1.08 1.08A1.99 1.99 0 0 1 11 8c.37 0 .718.101 1.016.277l1.08-1.08A3.484 3.484 0 0 0 11 6.5c-.786 0-1.512.26-2.096.697Zm4.9.707l-1.08 1.08a2 2 0 0 1-.001 2.032l1.08 1.08c.438-.584.697-1.31.697-2.096s-.26-1.512-.697-2.096Zm-.708 4.9l-1.08-1.08A1.991 1.991 0 0 1 11 12c-.37 0-.718-.101-1.016-.277l-1.08 1.08c.584.438 1.31.697 2.096.697s1.512-.26 2.096-.697ZM6.5 10a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0Zm3.5 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0Z"/></svg>
          </div>
          <div class="feature-title">Edge Fast</div>
          <div class="feature-desc">Runs on 300+ Cloudflare locations</div>
        </div>
      </div>
    </div>

    <footer>
      Built with <a href="https://workers.cloudflare.com" target="_blank" rel="noopener">Cloudflare Workers</a>
    </footer>
  </div>

  <script>
    const form = document.getElementById('demoForm');
    const urlInput = document.getElementById('urlInput');
    const submitBtn = document.getElementById('submitBtn');
    const resultPre = document.getElementById('resultPre');
    const copyBtn = document.getElementById('copyBtn');
    const previewCard = document.getElementById('previewCard');
    const previewImage = document.getElementById('previewImage');
    const previewFavicon = document.getElementById('previewFavicon');
    const previewSite = document.getElementById('previewSite');
    const previewTitle = document.getElementById('previewTitle');
    const previewDesc = document.getElementById('previewDesc');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = urlInput.value.trim();
      if (!url) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading"></span>';
      previewCard.classList.remove('visible');

      try {
        const apiUrl = '/api/metadata?url=' + encodeURIComponent(url);
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        resultPre.textContent = JSON.stringify(data, null, 2);

        if (data.title || data.image) {
          previewCard.classList.add('visible');
          
          if (data.image) {
            previewImage.src = data.image;
            previewImage.style.display = 'block';
          } else {
            previewImage.style.display = 'none';
          }
          
          if (data.favicon) {
            previewFavicon.src = data.favicon;
            previewFavicon.style.display = 'block';
          } else {
            previewFavicon.style.display = 'none';
          }
          
          previewSite.textContent = data.siteName || data.openGraph?.siteName || new URL(url).hostname;
          previewTitle.textContent = data.title || data.openGraph?.title || 'No title';
          previewDesc.textContent = data.description || data.openGraph?.description || 'No description available';
        }
      } catch (error) {
        resultPre.textContent = JSON.stringify({ error: error.message }, null, 2);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Extract';
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(resultPre.textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    });
  </script>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: CORS_HEADERS });
    }

    // API endpoint
    if (url.pathname === '/api/metadata') {
      try {
        const urlParam = url.searchParams.get('url');
      
        if (!urlParam) {
          return Response.json({ error: 'Missing url parameter' }, { 
            status: 400, 
            headers: CORS_HEADERS 
          });
        }

        const targetUrl = new URL(urlParam);
        if (!['http:', 'https:'].includes(targetUrl.protocol)) {
          return Response.json({ error: 'Only HTTP and HTTPS are supported' }, { 
            status: 400, 
            headers: CORS_HEADERS 
          });
        }

        // Fetch with proper headers
        const res = await fetch(targetUrl.href, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          redirect: 'follow',
        });

        if (!res.ok) {
          return Response.json({ error: `Failed to fetch: ${res.status}` }, { 
            status: res.status, 
            headers: CORS_HEADERS 
          });
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          return Response.json({ url: targetUrl.href, type: contentType.split(';')[0] }, { 
            headers: CORS_HEADERS 
          });
        }

        const html = await res.text();
        const baseUrl = targetUrl.href;

        // Extract basic metadata
        const title = getMeta(html, 'og:title') || getTitle(html);
        const description = getMeta(html, 'og:description') || getMeta(html, 'description');
        const image = getMeta(html, 'og:image');
        const favicon = getFavicon(html, baseUrl);
        const siteName = getMeta(html, 'og:site_name');

        // Build Open Graph data
        const og: MetadataResponse['openGraph'] = {};
        const ogFields = ['title', 'description', 'image', 'type', 'url', 'siteName'] as const;
        for (const field of ogFields) {
          const value = getMeta(html, `og:${field}`);
          if (value) og[field] = field === 'image' || field === 'url' ? resolveUrl(value, baseUrl) : value;
        }

        // Build Twitter data
        const twitter: MetadataResponse['twitter'] = {};
        const twitterFields = ['card', 'site', 'creator', 'title', 'description', 'image'] as const;
        for (const field of twitterFields) {
          const value = getMeta(html, `twitter:${field}`);
          if (value) twitter[field] = field === 'image' ? resolveUrl(value, baseUrl) : value;
        }

        // Build favicons data
        const favicons: MetadataResponse['favicons'] = {};
        if (favicon) favicons.icon = favicon;
        const appleIcon = getLink(html, 'apple-touch-icon', baseUrl);
        if (appleIcon) favicons.appleTouchIcon = appleIcon;
        if (favicon) favicons.shortcut = favicon;

        // Build response
        const response: MetadataResponse = {
          url: targetUrl.href,
          title,
          description,
          image: image ? resolveUrl(image, baseUrl) : undefined,
          favicon: favicon || undefined,
          siteName,
          ...(Object.keys(og).length > 0 && { openGraph: og }),
          ...(Object.keys(twitter).length > 0 && { twitter }),
          ...(Object.keys(favicons).length > 0 && { favicons }),
        };

        return Response.json(response, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
            ...CORS_HEADERS,
          },
        });
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500, headers: CORS_HEADERS }
        );
      }
    }

    // Return HTML documentation page for root path
    return new Response(getDocsHTML(cssStyles), {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  },
};
