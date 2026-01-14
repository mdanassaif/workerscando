'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types';
import styles from './og-image.module.css';

interface OgImageClientProps {
  project: Project;
}

type ThemeName = 'midnight' | 'sunset' | 'ocean' | 'forest' | 'minimal' | 'rose';
type LayoutName = 'standard' | 'centered' | 'split' | 'minimal' | 'bold';

export default function OgImageClient({ project }: OgImageClientProps) {
  const [title, setTitle] = useState('WorkersCanDO');
  const [subtitle, setSubtitle] = useState('Dynamic OG Images');
  const [author, setAuthor] = useState('Mohd Anas');
  const [domain, setDomain] = useState('Cloud.com');
  const [theme, setTheme] = useState<ThemeName>('ocean');
  const [layout, setLayout] = useState<LayoutName>('split');
  const [emoji, setEmoji] = useState('☁️');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (subtitle) params.set('subtitle', subtitle);
    if (author) params.set('author', author);
    if (domain) params.set('domain', domain);
    if (theme) params.set('theme', theme);
    if (layout) params.set('layout', layout);
    if (emoji) params.set('emoji', emoji);
    if (date) params.set('date', date);
    setImageUrl(`https://og-image-generator.brogee9o9.workers.dev/api/og?${params.toString()}`);
  }, [title, subtitle, author, domain, theme, layout, emoji, date]);

  const handleCopyUrl = async () => {
    // Always use the workerscando.com domain for the copied URL
    const fullUrl = `https://workerscando.com${imageUrl.replace(/^https?:\/\/[^/]+/, '')}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.badgesContainer}>
            <span className={styles.dayBadge}>
              Day {project.day}
            </span>
          </div>

          <h1 className={styles.title}>
            {project.name}
          </h1>

          <p className={styles.description}>
            Generate beautiful Open Graph images on the fly. Perfect for blogs, social sharing, and marketing.
          </p>
        </div>
      </section>

      <section className={styles.demoSection}>
        <div className={styles.container}>
          <div className={styles.demoCard}>
            <h2 className={styles.demoTitle}>Try it out</h2>
            <div className={styles.previewContainer}>
              <div className={styles.imagePreview}>
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt="OG Image Preview"
                    className={styles.previewImage}
                  />
                )}
              </div>
            </div>
            <div className={styles.controlsGrid}>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Hello World"
                  className={styles.input}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Optional subtitle"
                  className={styles.input}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="John Doe"
                  className={styles.input}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className={styles.input}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as ThemeName)}
                  className={styles.select}
                >
                  <option value="midnight">Midnight</option>
                  <option value="sunset">Sunset</option>
                  <option value="ocean">Ocean</option>
                  <option value="forest">Forest</option>
                  <option value="minimal">Minimal</option>
                  <option value="rose">Rose</option>
                </select>
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Layout</label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as LayoutName)}
                  className={styles.select}
                >
                  <option value="standard">Standard</option>
                  <option value="centered">Centered</option>
                  <option value="split">Split</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Emoji</label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🚀"
                  className={styles.input}
                />
              </div>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Jan 2025"
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.actions}>
              <button onClick={handleCopyUrl} className={styles.copyButton}>
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.apiSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>API Reference</h2>
          <div className={styles.apiCard}>
            <div className={styles.apiMethod}>
              <span className={styles.methodBadge}>GET</span>
              <code className={styles.apiEndpoint}>/api/og-image</code>
            </div>
            <div className={styles.parametersTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Parameter</div>
                <div className={styles.tableCell}>Description</div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>title</code>
                </div>
                <div className={styles.tableCell}>
                  Main title text (required)
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>subtitle</code>
                </div>
                <div className={styles.tableCell}>
                  Secondary text below the title
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>theme</code>
                </div>
                <div className={styles.tableCell}>
                  Color theme: midnight, sunset, ocean, forest, minimal, rose
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>layout</code>
                </div>
                <div className={styles.tableCell}>
                  Layout style: standard, centered, split, minimal, bold
                </div>
              </div>
            </div>
            <div className={styles.sampleApiBox}>
              <div className={styles.sampleApiLabel}>Example Usage</div>
              <div className={styles.sampleApiUrl}>
                <code>{`<meta property="og:image" content="https://og-image-generator.brogee9o9.workers.dev/api/og?title=My+Blog+Post&author=John&theme=midnight" />`}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.linksSection}>
        <div className={styles.container}>
          <div className={styles.linksContent}>
            <p className={styles.linkLine}>
              Wanna contribute or learn? <a 
                href="https://github.com/mdanassaif/workerscando" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.inlineLink}
              >
                Here&apos;s the code
              </a>
            </p>
            <p className={styles.linkLine}>
              Support me on <a 
                href="https://x.com/mdanassaif" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.inlineLink}
              >
                Twitter
              </a> for daily updates
            </p>
            <p className={styles.linkLine}>
              Wanna learn why it&apos;s the best solution? <a 
                href="/docs"
                className={styles.inlineLink}
              >
                Read the docs
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
