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
          
          <h3 className={styles.subsectionTitle}>
            What is WorkersCanDo?
          </h3>
          <p className={styles.sectionText}>
            WorkersCanDo is a collection of 100 micro-tools built on Cloudflare Workers. 
            Each tool is designed to be fast, focused, and free to use.
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
            favicons, and more.
          </p>

          <h3 className={styles.subsectionTitle}>
            Endpoint
          </h3>
          <div className={styles.codeBlock}>
            GET https://url-metadata-api.brogee9o9.workers.dev/?url=YOUR_URL
          </div>

          <h3 className={styles.subsectionTitle}>
            Example
          </h3>
          <div className={styles.codeBlockLight}>
            <pre>{`curl "https://url-metadata-api.brogee9o9.workers.dev/?url=https://example.com"`}</pre>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              📖 More documentation coming soon...
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
              📖 More documentation coming soon...
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
