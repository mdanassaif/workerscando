"use client";

import React, { useState } from 'react';
import { Navbar, Footer } from '@/components';
import styles from '@/styles/pages/docs.module.css';

interface DocItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function DocsClient() {
  const [activeSection, setActiveSection] = useState('getting-started');

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

          <h3 className={styles.subsectionTitle}>How It Works</h3>
          <p className={styles.sectionText}>
            Each tool runs on Cloudflare&apos;s global edge network. When you make a request, it&apos;s handled by the server closest to you—making everything incredibly fast.
          </p>

          <h3 className={styles.subsectionTitle}>Using the APIs</h3>
          <p className={styles.sectionText}>
            All tools are accessible via simple REST APIs:
          </p>
          <div className={styles.codeBlockLight}>
            <pre>{`# URL Metadata API
https://workerscando.com/api/metadata?url={your-url}

# OG Image Generator  
https://workerscando.com/api/og-image?title={your-title}`}</pre>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              💡 All APIs are free, require no authentication, and have CORS enabled for browser use.
            </p>
          </div>
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

          <h3 className={styles.subsectionTitle}>Endpoint</h3>
          <div className={styles.codeBlock}>
            GET https://workerscando.com/api/metadata?url={'{url}'}
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
curl "https://workerscando.com/api/metadata?url=https://github.com"

# JavaScript
fetch('https://workerscando.com/api/metadata?url=' + encodeURIComponent('https://github.com'))
  .then(res => res.json())
  .then(data => console.log(data));

# HTML (for link previews)
<meta property="og:url" content="https://workerscando.com/api/metadata?url=https://github.com" />`}</pre>
          </div>

          <h3 className={styles.subsectionTitle}>Response</h3>
          <div className={styles.codeBlockLight}>
            <pre>{`{
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
            <li>Building link preview cards (like Slack, Discord)</li>
            <li>Bookmark managers and reading lists</li>
            <li>Content aggregation and curation tools</li>
            <li>SEO analysis tools</li>
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

          <h3 className={styles.subsectionTitle}>Endpoint</h3>
          <div className={styles.codeBlock}>
            GET https://workerscando.com/api/og-image
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
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>Main title text</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>subtitle</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>Secondary text below title</td>
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
https://workerscando.com/api/og-image?title=My+Blog+Post&theme=midnight

# Use in HTML
<meta property="og:image" content="https://workerscando.com/api/og-image?title=Hello+World&theme=ocean" />

# Full example with all params
https://workerscando.com/api/og-image?title=Building+APIs&subtitle=A+Guide&author=John&theme=sunset&layout=bold`}</pre>
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
    }
  ];

  const activeDoc = docSections.find(s => s.id === activeSection);

  return (
    <main>
      <Navbar />
      <div className={styles.main}>
        {/* Sidebar: always visible on all screens */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLabel}>
              Documentation
            </span>
          </div>
          <nav>
            {docSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
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
