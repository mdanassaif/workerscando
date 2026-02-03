"use client";

import React, { useState } from 'react';
import { Navbar, Footer } from '@/components';
import styles from '@/styles/pages/docs.module.css';

interface DocItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

// Direct Cloudflare Workers URLs
const WORKERS = {
  SHORTENER: 'https://urlshortener.brogee9o9.workers.dev',
  METADATA: 'https://url-metadata-api.brogee9o9.workers.dev',
  OG_IMAGE: 'https://og-image-generator.brogee9o9.workers.dev',
};

export default function DocsClient() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const docSections: DocItem[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>Getting Started</h2>
          <p className={styles.sectionText}>
            Welcome to WorkersCanDo! We&apos;re building 100 micro-tools in 100 days, all powered by Cloudflare Workers.
          </p>

          <h3 className={styles.subsectionTitle}>Direct API Access</h3>
          <p className={styles.sectionText}>
            All tools run on Cloudflare Workers and can be accessed directly via their worker URLs for the fastest possible response times:
          </p>
          <div className={styles.codeBlockLight}>
            <pre>{`# URL Metadata API
${WORKERS.METADATA}/api/metadata?url={your-url}

# OG Image Generator  
${WORKERS.OG_IMAGE}/api/og?title={your-title}

# URL Shortener
${WORKERS.SHORTENER}/api/shorten`}</pre>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              💡 All APIs are free, require no authentication, and have CORS enabled for browser use.
            </p>
          </div>

          <h3 className={styles.subsectionTitle}>Quick Start Examples</h3>
          <div className={styles.codeBlockLight}>
            <pre>{`// Shorten a URL
fetch('${WORKERS.SHORTENER}/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://github.com' })
}).then(r => r.json()).then(console.log);

// Extract URL metadata
fetch('${WORKERS.METADATA}/api/metadata?url=https://github.com')
  .then(r => r.json()).then(console.log);

// Generate OG image (returns SVG)
// Just use as an image src:
<img src="${WORKERS.OG_IMAGE}/api/og?title=Hello" />`}</pre>
          </div>
        </div>
      )
    },
    {
      id: 'why-workerscando',
      title: 'Why WorkersCanDo?',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>Why Build with WorkersCanDo?</h2>

          <p className={styles.sectionText}>
            WorkersCanDo provides production-ready micro-tools that you can use in your projects today. Here&apos;s why developers love it:
          </p>

          <h3 className={styles.subsectionTitle}>🚀 Instant Performance</h3>
          <p className={styles.sectionText}>
            All tools run on Cloudflare&apos;s global edge network with <strong>300+ locations worldwide</strong>. Your API calls are handled by the server closest to your users—typically <strong>under 50ms latency</strong>.
          </p>

          <h3 className={styles.subsectionTitle}>💰 Completely Free</h3>
          <p className={styles.sectionText}>
            No API keys, no sign-ups, no rate limits for normal use. Just call the API and get results. Perfect for prototyping, side projects, and production apps.
          </p>

          <h3 className={styles.subsectionTitle}>🔧 Developer-Friendly</h3>
          <ul className={styles.list}>
            <li><strong>CORS enabled</strong> — Works directly from browsers</li>
            <li><strong>No authentication</strong> — Just make HTTP requests</li>
            <li><strong>JSON responses</strong> — Easy to parse and use</li>
            <li><strong>Well-documented</strong> — Examples for cURL, JavaScript, and more</li>
          </ul>

          <h3 className={styles.subsectionTitle}>🛠️ Real-World Use Cases</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Tool</th>
                  <th className={styles.tableHeaderCell}>Use Cases</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.tableRow}>
                  <td className={styles.tableCell}><strong>URL Shortener</strong></td>
                  <td className={styles.tableCell}>Marketing campaigns, social sharing, QR codes, email tracking</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={styles.tableCell}><strong>URL Metadata</strong></td>
                  <td className={styles.tableCell}>Link previews (like Slack), bookmark managers, SEO tools</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={styles.tableCell}><strong>OG Image Generator</strong></td>
                  <td className={styles.tableCell}>Blog post images, social cards, documentation headers</td>
                </tr>

              </tbody>
            </table>
          </div>

          <h3 className={styles.subsectionTitle}>🌍 Global by Default</h3>
          <p className={styles.sectionText}>
            Unlike traditional servers that live in one region, Cloudflare Workers run in every major city. Your users in Tokyo, London, or São Paulo all get the same fast experience.
          </p>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              ⚡ <strong>Zero cold starts.</strong> Workers are always warm and ready to respond instantly—no waiting for containers to spin up.
            </p>
          </div>

          <h3 className={styles.subsectionTitle}>📖 Open Source</h3>
          <p className={styles.sectionText}>
            All tools are open source on <a href="https://github.com/mdanassaif/workerscando" target="_blank" rel="noopener noreferrer" className={styles.infoText} style={{ textDecoration: 'underline' }}>GitHub</a>. You can learn from the code, deploy your own instance, or contribute improvements.
          </p>
        </div>
      )
    },
    {
      id: 'what-are-workers',
      title: 'What Are Workers?',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>What Are Cloudflare Workers?</h2>

          <p className={styles.sectionText}>
            Cloudflare Workers are serverless functions that run at the <strong>edge</strong>—meaning your code executes on servers distributed across 300+ cities worldwide, as close to your users as possible.
          </p>

          <h3 className={styles.subsectionTitle}>Why Edge Computing?</h3>
          <p className={styles.sectionText}>
            Traditional servers are in one location. If your server is in New York but your user is in Tokyo, the request travels thousands of miles. With Workers, code runs in Tokyo for Tokyo users, New York for New York users.
          </p>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Traditional Server</th>
                  <th className={styles.tableHeaderCell}>Cloudflare Workers</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.tableRow}>
                  <td className={styles.tableCell}>Single location</td>
                  <td className={styles.tableCell}>300+ global locations</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={styles.tableCell}>100-500ms latency</td>
                  <td className={styles.tableCell}>10-50ms latency</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={styles.tableCell}>Cold starts: 500ms+</td>
                  <td className={styles.tableCell}>Cold starts: 0ms</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={styles.tableCell}>You manage scaling</td>
                  <td className={styles.tableCell}>Auto-scales infinitely</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.subsectionTitle}>Key Benefits</h3>
          <ul className={styles.list}>
            <li><strong>⚡ Blazing Fast</strong> — Sub-50ms response times globally</li>
            <li><strong>🌍 Global by Default</strong> — No regional configuration needed</li>
            <li><strong>💰 Cost Effective</strong> — Pay only for what you use</li>
            <li><strong>🔒 Secure</strong> — Runs in isolated V8 environments</li>
            <li><strong>📈 Scalable</strong> — Handles millions of requests automatically</li>
          </ul>

          <h3 className={styles.subsectionTitle}>How Workers Run</h3>
          <p className={styles.sectionText}>
            Workers use the V8 JavaScript engine (same as Chrome). They start in under 5ms and can handle thousands of concurrent requests. Your code is deployed globally with a single command.
          </p>

          <div className={styles.codeBlockLight}>
            <pre>{`// A simple Worker that returns JSON
export default {
  async fetch(request) {
    return new Response(JSON.stringify({
      message: "Hello from the edge!",
      location: request.cf?.city
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}`}</pre>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              🚀 Workers are perfect for APIs, redirects, A/B testing, image optimization, and any latency-sensitive operations.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'url-metadata-api',
      title: 'URL Metadata API',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>URL Metadata API</h2>
          <span className={styles.statusBadge}>LIVE</span>

          <p className={styles.sectionText}>
            Extract metadata from any URL instantly. Get title, description, Open Graph tags, Twitter cards, favicons, and more.
          </p>

          <h3 className={styles.subsectionTitle}>Direct Worker URL</h3>
          <div className={styles.codeBlock}>
            GET {WORKERS.METADATA}/api/metadata?url={'{url}'}
          </div>

          <h3 className={styles.subsectionTitle}>Parameters</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Parameter</th>
                  <th className={styles.tableHeaderCell}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>url</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>The URL to extract metadata from (required, URL-encoded)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.subsectionTitle}>Examples</h3>
          <div className={styles.codeBlockLight}>
            <pre>{`# cURL
curl "${WORKERS.METADATA}/api/metadata?url=https://github.com"

# JavaScript
fetch('${WORKERS.METADATA}/api/metadata?url=' + encodeURIComponent('https://github.com'))
  .then(res => res.json())
  .then(data => console.log(data));

# In your app
const response = await fetch(\`${WORKERS.METADATA}/api/metadata?url=\${encodeURIComponent(url)}\`);
const metadata = await response.json();`}</pre>
          </div>

          <h3 className={styles.subsectionTitle}>Response</h3>
          <div className={styles.codeBlockLight}>
            <pre>{`{
  "success": true,
  "url": "https://github.com",
  "title": "GitHub",
  "description": "Where the world builds software",
  "favicon": "https://github.com/favicon.ico",
  "openGraph": {
    "title": "GitHub",
    "description": "Where the world builds software",
    "image": "https://github.githubassets.com/images/og-image.png",
    "type": "website"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "GitHub"
  }
}`}</pre>
          </div>

          <h3 className={styles.subsectionTitle}>Use Cases</h3>
          <ul className={styles.list}>
            <li>Building link preview cards (like Slack, Discord, Notion)</li>
            <li>Bookmark managers and reading lists</li>
            <li>Content aggregation and curation tools</li>
            <li>SEO analysis and website crawlers</li>
          </ul>

          <p className={styles.sectionText}>
            <a href="/projects/url-metadata-api" className={styles.infoText} style={{ textDecoration: 'underline' }}>Try it live →</a>
          </p>
        </div>
      )
    },
    {
      id: 'og-image-generator',
      title: 'OG Image Generator',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>OG Image Generator</h2>
          <span className={styles.statusBadge}>LIVE</span>

          <p className={styles.sectionText}>
            Generate beautiful Open Graph images dynamically. Perfect for blogs, social sharing, and automated content.
          </p>

          <h3 className={styles.subsectionTitle}>Direct Worker URL</h3>
          <div className={styles.codeBlock}>
            GET {WORKERS.OG_IMAGE}/api/og
          </div>

          <h3 className={styles.subsectionTitle}>Parameters</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Parameter</th>
                  <th className={styles.tableHeaderCell}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>title</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>Main title text (required)</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>subtitle</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>Secondary text below the title</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>author</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>Author name</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>domain</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>Website domain</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>theme</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>midnight, sunset, ocean, forest, minimal, rose</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>layout</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>standard, centered, split, minimal, bold</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>emoji</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>Decorative emoji</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.subsectionTitle}>Examples</h3>
          <div className={styles.codeBlockLight}>
            <pre>{`# Generate an image
${WORKERS.OG_IMAGE}/api/og?title=My+Blog+Post&theme=midnight

# Use in HTML meta tag
<meta property="og:image" content="${WORKERS.OG_IMAGE}/api/og?title=Hello+World&theme=ocean" />

# Full example with all params
${WORKERS.OG_IMAGE}/api/og?title=Building+APIs&subtitle=A+Guide&author=John&theme=sunset&layout=bold&emoji=🚀`}</pre>
          </div>

          <h3 className={styles.subsectionTitle}>Use Cases</h3>
          <ul className={styles.list}>
            <li>Dynamic blog post images</li>
            <li>Social media sharing cards</li>
            <li>Automated marketing materials</li>
            <li>Documentation and guides</li>
          </ul>

          <p className={styles.sectionText}>
            <a href="/projects/dynamic-og-images" className={styles.infoText} style={{ textDecoration: 'underline' }}>Try it live →</a>
          </p>
        </div>
      )
    },
    {
      id: 'url-shortener',
      title: 'URL Shortener',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>URL Shortener API</h2>
          <span className={styles.statusBadge}>LIVE</span>

          <p className={styles.sectionText}>
            Create branded short links with real-time analytics. Track clicks, devices, and countries—all at the edge with instant redirects.
          </p>

          <h3 className={styles.subsectionTitle}>Direct Worker URL</h3>
          <div className={styles.codeBlock}>
            {WORKERS.SHORTENER}
          </div>

          <h3 className={styles.subsectionTitle}>Endpoints</h3>

          <div style={{ marginBottom: 32 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#18181B' }}>1. Create Short Link</h4>
            <div className={styles.codeBlock}>
              POST {WORKERS.SHORTENER}/api/shorten
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 12, color: '#52525B' }}>Request Body</h4>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>Parameter</th>
                    <th className={styles.tableHeaderCell}>Type</th>
                    <th className={styles.tableHeaderCell}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.tableCellCode}`}>url</td>
                    <td className={styles.tableCell}>string</td>
                    <td className={styles.tableCell}>The URL to shorten (required)</td>
                  </tr>
                  <tr className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.tableCellCode}`}>slug</td>
                    <td className={styles.tableCell}>string</td>
                    <td className={styles.tableCell}>Optional custom slug</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 12, color: '#52525B' }}>Example</h4>
            <div className={styles.codeBlockLight}>
              <pre>{`# cURL
curl -X POST "${WORKERS.SHORTENER}/api/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "slug": "my-link"}'

# JavaScript
fetch('${WORKERS.SHORTENER}/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
}).then(r => r.json()).then(console.log);`}</pre>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 12, color: '#52525B' }}>Response</h4>
            <div className={styles.codeBlockLight}>
              <pre>{`{
  "slug": "abc123",
  "url": "https://example.com",
  "shortUrl": "https://workerscando.com/s/abc123"
}`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#18181B' }}>2. Get Analytics</h4>
            <div className={styles.codeBlock}>
              GET {WORKERS.SHORTENER}/api/stats/{'{slug}'}
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 12, color: '#52525B' }}>Example</h4>
            <div className={styles.codeBlockLight}>
              <pre>{`# cURL
curl "${WORKERS.SHORTENER}/api/stats/abc123"

# JavaScript
fetch('${WORKERS.SHORTENER}/api/stats/abc123')
  .then(r => r.json()).then(console.log);`}</pre>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 12, color: '#52525B' }}>Response</h4>
            <div className={styles.codeBlockLight}>
              <pre>{`{
  "slug": "abc123",
  "url": "https://example.com",
  "total_clicks": 42,
  "last_24h": 15,
  "countries": { "US": 20, "UK": 12, "CA": 10 },
  "devices": { "Mobile": 25, "Desktop": 15, "Tablet": 2 }
}`}</pre>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#18181B' }}>3. Redirect</h4>
            <div className={styles.codeBlock}>
              GET {WORKERS.SHORTENER}/{'{slug}'}
            </div>

            <p className={styles.sectionText} style={{ marginTop: 12 }}>
              Automatically redirects to the original URL and tracks the click. Returns a 302 redirect.
            </p>
          </div>

          <h3 className={styles.subsectionTitle}>Features</h3>
          <ul className={styles.list}>
            <li><strong>⚡ Instant Shortening</strong> — Create short links at the edge</li>
            <li><strong>📊 Real-time Analytics</strong> — Track clicks, devices, countries</li>
            <li><strong>🎯 Custom Slugs</strong> — Create branded short links</li>
            <li><strong>🌍 Global Performance</strong> — Edge redirects under 50ms</li>
          </ul>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              💡 All endpoints support CORS. Perfect for browser apps!
            </p>
          </div>

          <p className={styles.sectionText}>
            <a href="/projects/url-shortener" className={styles.infoText} style={{ textDecoration: 'underline' }}>Try it live →</a>
          </p>
        </div>
      )
    },
    {
      id: 'contributing',
      title: 'Contributing',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>Contributing</h2>
          <p className={styles.sectionText}>
            Want to suggest a tool or contribute? Here&apos;s how.
          </p>

          <h3 className={styles.subsectionTitle}>Suggest a Tool</h3>
          <p className={styles.sectionText}>
            Open an issue on <a href="https://github.com/mdanassaif/workerscando" target="_blank" rel="noopener noreferrer" className={styles.infoText} style={{ textDecoration: 'underline' }}>GitHub</a> with:
          </p>
          <ul className={styles.list}>
            <li>What problem does it solve?</li>
            <li>Brief description of how it works</li>
            <li>Example use cases</li>
          </ul>

          <h3 className={styles.subsectionTitle}>Good Tool Ideas</h3>
          <ul className={styles.list}>
            <li>Small and focused on one task</li>
            <li>Deployable on Cloudflare Workers</li>
            <li>Useful for developers or everyday users</li>
            <li>Free with no auth required</li>
          </ul>

          <h3 className={styles.subsectionTitle}>Follow Along</h3>
          <p className={styles.sectionText}>
            Star the repo and follow <a href="https://x.com/mdanassaif" target="_blank" rel="noopener noreferrer" className={styles.infoText} style={{ textDecoration: 'underline' }}>@mdanassaif</a> for daily updates on the 100 tools journey.
          </p>
        </div>
      )
    },
    {
      id: 'hire-wire',
      title: 'HireWire API',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>HireWire API</h2>
          <span className={styles.statusBadge}>LIVE</span>
          <p className={styles.sectionText}>
            <strong>HireWire</strong> lets you add a "Hire Me" contact form to any static site or portfolio. Messages are sent directly to your Discord via webhook—no backend required. Perfect for freelancers, developers, and creators who want instant contact alerts.
          </p>
          <h3 className={styles.subsectionTitle}>How does it work?</h3>
          <ol className={styles.list} style={{ marginBottom: 24 }}>
            <li>Register your Discord webhook using the API or UI.</li>
            <li>Get a ready-to-use contact form component or HTML snippet.</li>
            <li>Embed it in your site—messages go straight to your Discord!</li>
          </ol>
          <h3 className={styles.subsectionTitle}>How to get your Discord webhook?</h3>
          <ol className={styles.list} style={{ marginBottom: 24 }}>
            <li>Go to your Discord server and open <strong>Server Settings &gt; Integrations &gt; Webhooks</strong>.</li>
            <li>Create a new webhook and copy the <strong>Webhook URL</strong>.</li>
            <li>Paste this URL when registering with HireWire.</li>
          </ol>

          <h3 className={styles.subsectionTitle}>Endpoints</h3>
          <div className={styles.apiCard}>
            <div className={styles.apiMethod}><span className={styles.methodBadge}>POST</span> <code className={styles.apiEndpoint}>/register</code></div>
            <div className={styles.parametersTable}>
              <div className={styles.tableHeader}><div className={styles.tableCell}>Parameter</div><div className={styles.tableCell}>Description</div></div>
              <div className={styles.tableRow}><div className={styles.tableCell}><code className={styles.paramName}>name</code></div><div className={styles.tableCell}>Project name (string)</div></div>
              <div className={styles.tableRow}><div className={styles.tableCell}><code className={styles.paramName}>webhookUrl</code></div><div className={styles.tableCell}>Discord webhook URL (string)</div></div>
            </div>
            <div className={styles.responseContainer} style={{ marginTop: 16 }}>
              <span className={styles.responseLabel}>Response</span>
              <pre className={styles.codeBlock}>{`{
    "success": true,
    "userId": "abc123",
    "message": "Account created!",
    "scriptUrl": "https://hire-wire.brogee9o9.workers.dev/widget.js?id=abc123"
  }`}</pre>
            </div>
          </div>

          <div className={styles.apiCard} style={{ marginTop: 32 }}>
            <div className={styles.apiMethod}><span className={styles.methodBadge}>POST</span> <code className={styles.apiEndpoint}>/send?id=USER_ID</code></div>
            <div className={styles.parametersTable}>
              <div className={styles.tableHeader}><div className={styles.tableCell}>Parameter</div><div className={styles.tableCell}>Description</div></div>
              <div className={styles.tableRow}><div className={styles.tableCell}><code className={styles.paramName}>email</code></div><div className={styles.tableCell}>Sender's email address</div></div>
              <div className={styles.tableRow}><div className={styles.tableCell}><code className={styles.paramName}>message</code></div><div className={styles.tableCell}>Message content</div></div>
            </div>
            <div className={styles.responseContainer} style={{ marginTop: 16 }}>
              <span className={styles.responseLabel}>Response</span>
              <pre className={styles.codeBlock}>{`{
    "sent": true
  }`}</pre>
            </div>
          </div>

          <div className={styles.apiCard} style={{ marginTop: 32 }}>
            <div className={styles.apiMethod}><span className={styles.methodBadge}>GET</span> <code className={styles.apiEndpoint}>/widget.js?id=USER_ID</code></div>
            <div className={styles.parametersTable}>
              <div className={styles.tableHeader}><div className={styles.tableCell}>Usage</div></div>
              <div className={styles.tableRow}><div className={styles.tableCell}>Embed the script in your HTML. It exposes <code>window.HireWire.send(email, message)</code> for sending messages.</div></div>
            </div>
          </div>
        </div>
      )
    },
  ];

  const activeDoc = docSections.find(s => s.id === activeSection);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <main>
      <Navbar />
      <div className={styles.main}>
        {/* Mobile menu toggle button */}
        <button
          className={`${styles.mobileMenuToggle} ${sidebarOpen ? styles.open : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span>{docSections.find(s => s.id === activeSection)?.title || 'Menu'}</span>
        </button>

        {/* Sidebar - hidden on mobile by default */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLabel}>
              Documentation
            </span>
          </div>
          <nav>
            {docSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`${styles.sidebarButton} ${activeSection === section.id ? styles.sidebarButtonActive : ''}`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>
        {/* Content */}
        <div className={styles.content}>
          {activeDoc?.content}
          <Footer />
        </div>
      </div>
    </main>
  );
}
