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
          <h2 className={styles.sectionTitle}>
            Getting Started
          </h2>
          <p className={styles.sectionText}>
            Welcome to WorkersCanDo! This documentation will help you understand how to use our tools 
            and potentially contribute your own.
          </p>

          <h3 className={styles.subsectionTitle}>Project Folder Structure</h3>
          <pre className={styles.codeBlockLight}>
{`
src/
  app/                # Main Next.js app (pages, layouts, API routes)
    about/            # About page components
    api/              # API routes (e.g., /api/og)
      og/             # Open Graph image API
      metadata/       # (Currently empty, can be deleted or used for future APIs)
    docs/             # Documentation pages
    projects/         # Projects listing and detail pages
      [slug]/         # Dynamic project detail pages
      dynamic-og-images/  # OG image generator UI
      url-metadata-api/   # URL metadata API UI
    globals.css       # Global styles
    layout.tsx        # App layout
    manifest.ts       # PWA manifest
    not-found.tsx     # 404 page
    robots.ts         # Robots.txt config
    sitemap.ts        # Sitemap config
  components/         # Reusable React UI components (Navbar, Footer, Hero, etc.)
  lib/                # Utility functions and data (e.g., projects list)
  types/              # TypeScript type definitions
  styles/             # CSS modules for components and pages
public/               # Static assets (icons, images)
workers/              # Standalone Cloudflare Worker projects
  og-image-generator/ # Worker for dynamic OG images
  url-metadata-api/   # Worker for URL metadata extraction
`}
          </pre>


          <h3 className={styles.subsectionTitle}>What is WorkersCanDo?</h3>
          <p className={styles.sectionText}>
            WorkersCanDo is a collection of 100 micro-tools built on Cloudflare Workers. 
            Each tool is designed to be fast, focused, and free to use.
          </p>

          <h3 className={styles.subsectionTitle}>What are Cloudflare Workers?</h3>
          <p className={styles.sectionText}>
            <b>Beginner:</b> Cloudflare Workers let you run your code on servers all around the world, so your site and APIs are super fast for everyone. You don’t need to manage any servers—just write your code and deploy. It’s perfect for building tools, APIs, and microservices that need to be fast and reliable.
          </p>
          <p className={styles.sectionText}>
            <b>Expert:</b> Cloudflare Workers are serverless functions running at Cloudflare’s edge network (300+ locations). They enable ultra-low-latency APIs, microservices, and dynamic content, with instant cold starts and global scaling. Workers are ideal for edge-first architectures, JAMstack, and modern web apps that demand performance and resilience.
          </p>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              💡 All tools are deployed at the edge and respond in milliseconds from 300+ locations worldwide.
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
          <h2 className={styles.sectionTitle}>
            URL Metadata API
          </h2>
          <span className={styles.statusBadge}>
            LIVE
          </span>
          
          <p className={styles.sectionText}>
            Extract metadata from any URL instantly. Get title, description, Open Graph tags, 
            Twitter cards, favicons, and more. Perfect for building link previews, bookmark managers, 
            or content aggregators.
          </p>

          <h3 className={styles.subsectionTitle}>
            Endpoint
          </h3>
          <div className={styles.codeBlock}>
            GET /api/metadata?url={'{url}'}
          </div>

          <h3 className={styles.subsectionTitle}>
            Parameters
          </h3>
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
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>The URL to extract metadata from (must be URL-encoded, required)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.subsectionTitle}>
            Example Request
          </h3>
          <div className={styles.codeBlockLight}>
            <pre>{`curl "https://workerscando.com/api/metadata?url=https://example.com"

# Or with URL encoding
curl "https://workerscando.com/api/metadata?url=https%3A%2F%2Fexample.com"`}</pre>
          </div>

          <h3 className={styles.subsectionTitle}>
            Response Format
          </h3>
          <div className={styles.codeBlockLight}>
            <pre>{`{
  "url": "https://example.com",
  "title": "Example Domain",
  "description": "This domain is for use in illustrative examples...",
  "image": "https://example.com/image.jpg",
  "favicon": "https://example.com/favicon.ico",
  "siteName": "Example",
  "openGraph": {
    "title": "Example Domain",
    "description": "...",
    "image": "https://example.com/og-image.jpg",
    "type": "website",
    "url": "https://example.com"
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "Example Domain",
    "description": "...",
    "image": "https://example.com/twitter-image.jpg"
  },
  "favicons": {
    "icon": "https://example.com/favicon.ico",
    "appleTouchIcon": "https://example.com/apple-touch-icon.png"
  }
}`}</pre>
          </div>

          <h3 className={styles.subsectionTitle}>
            Features
          </h3>
          <ul className={styles.list}>
            <li><strong>Open Graph</strong> - Extracts all OG tags (title, description, image, type, etc.)</li>
            <li><strong>Twitter Cards</strong> - Supports Twitter card metadata (card type, creator, site)</li>
            <li><strong>Favicons</strong> - Detects standard favicons and Apple touch icons</li>
            <li><strong>Edge Fast</strong> - Runs on Cloudflare Workers at 300+ global locations</li>
            <li><strong>CORS Enabled</strong> - Use directly from browsers</li>
          </ul>

          <h3 className={styles.subsectionTitle}>
            Try It
          </h3>
          <p className={styles.sectionText}>
            Visit the <a href="/projects/url-metadata-api" className={styles.infoText} style={{ textDecoration: 'underline' }}>URL Metadata API page</a> to try it out interactively.
          </p>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              💡 This API is built on Cloudflare Workers for lightning-fast global response times. All metadata extraction happens at the edge!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'og-image-generator',
      title: 'Dynamic OG Images',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>
            Dynamic OG Images
          </h2>
          <span className={styles.statusBadge}>
            LIVE
          </span>
          
          <p className={styles.sectionText}>
            Generate beautiful Open Graph images on the fly. Perfect for blogs, social sharing, 
            and dynamic content.
          </p>

          <h3 className={styles.subsectionTitle}>
            Endpoint
          </h3>
          <div className={styles.codeBlock}>
            GET https://og-image-generator.brogee9o9.workers.dev/
          </div>

          <h3 className={styles.subsectionTitle}>
            Parameters
          </h3>
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
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>The main title text</td>
                </tr>
                <tr className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.tableCellCode}`}>subtitle</td>
                  <td className={`${styles.tableCell} ${styles.tableCellText}`}>Optional subtitle text</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              � More documentation coming soon...
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'contributing',
      title: 'Contributing',
      content: (
        <div>
          <h2 className={styles.sectionTitle}>
            Contributing
          </h2>
          <p className={styles.sectionText}>
            Want to suggest a tool or contribute to the project? Here&apos;s how you can help.
          </p>

          <h3 className={styles.subsectionTitle}>
            Suggest a Tool
          </h3>
          <p className={styles.sectionText}>
            Have an idea for a useful micro-tool? Open an issue on GitHub with your suggestion. 
            Include what problem it solves and a brief description of how it should work.
          </p>

          <h3 className={styles.subsectionTitle}>
            Guidelines
          </h3>
          <ul className={styles.list}>
            <li>Tools should be small and focused on one task</li>
            <li>Must be deployable on Cloudflare Workers</li>
            <li>Should be useful to developers or general users</li>
            <li>Free to use with no authentication required</li>
          </ul>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              🚧 Contribution guidelines coming soon...
            </p>
          </div>
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
        </div>
      </div>
      <Footer />
    </main>
  );
}
