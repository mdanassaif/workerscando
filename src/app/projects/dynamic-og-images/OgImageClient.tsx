'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ToolStudio } from '@/components';
import { Project } from '@/types';
import { API } from '@/lib/api';
import layout from '@/styles/components/split-layout.module.css';

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
  const [pageLayout, setPageLayout] = useState<LayoutName>('split');
  const [emoji, setEmoji] = useState('☁️');
  const [date, setDate] = useState('');
  
  const [imageUrl, setImageUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [exampleTab, setExampleTab] = useState<'html' | 'curl'>('html');
  const [exampleCopied, setExampleCopied] = useState(false);

  const WORKER_URL = 'https://og-image-generator.brogee9o9.workers.dev';

  const exampleCode = {
    html: `<meta property="og:image" content="${WORKER_URL}/api/og?title=My+Post&theme=midnight" />`,
    curl: `curl "${WORKER_URL}/api/og?title=My+Post&theme=midnight"`
  };

  const copyExample = async () => {
    await navigator.clipboard.writeText(exampleCode[exampleTab]);
    setExampleCopied(true);
    setTimeout(() => setExampleCopied(false), 2000);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (subtitle) params.set('subtitle', subtitle);
    if (author) params.set('author', author);
    if (domain) params.set('domain', domain);
    if (theme) params.set('theme', theme);
    if (pageLayout) params.set('layout', pageLayout);
    if (emoji) params.set('emoji', emoji);
    if (date) params.set('date', date);
    setImageUrl(`${API.OG_IMAGE}?${params.toString()}`);
  }, [title, subtitle, author, domain, theme, pageLayout, emoji, date]);

  const handleCopyUrl = async () => {
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
    <ToolStudio>
    <div className={layout.wrapper}>
      {/* ── LEFT PANEL ── */}
      <aside className={layout.leftPanel}>
        <div className={layout.leftHeader}>
          <Link href="/projects" className={layout.backLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Tools
          </Link>

          <div className={layout.metaTags}>
            <span className={layout.dayTag}>Day {project.day}</span>
            <span className={layout.liveTag}>
              <span className={layout.liveDot} />
              Live
            </span>
          </div>
          
          <h1 className={layout.title}>{project.name}</h1>
          <p className={layout.description}>
            Generate beautiful Open Graph images on the fly. Perfect for blogs, social sharing, and marketing previews.
          </p>
        </div>

        <div className={`${layout.leftBody} ${layout.leftBodyTight}`}>
          
          <div className={layout.field}>
            <label className={layout.label}>Title</label>
            <input
              className={layout.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hello World"
            />
          </div>

          <div className={layout.field}>
            <label className={layout.label}>Subtitle</label>
            <input
              className={layout.input}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Optional subtitle"
            />
          </div>

          <div className={layout.twoCol}>
            <div className={layout.field}>
              <label className={layout.label}>Author</label>
              <input
                className={layout.input}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div className={layout.field}>
              <label className={layout.label}>Domain</label>
              <input
                className={layout.input}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
              />
            </div>
          </div>

          <div className={layout.twoCol}>
            <div className={layout.field}>
              <label className={layout.label}>Theme</label>
              <select
                className={layout.input}
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
              >
                <option value="midnight">Midnight</option>
                <option value="sunset">Sunset</option>
                <option value="ocean">Ocean</option>
                <option value="forest">Forest</option>
                <option value="minimal">Minimal</option>
                <option value="rose">Rose</option>
              </select>
            </div>

            <div className={layout.field}>
              <label className={layout.label}>Layout Template</label>
              <select
                className={layout.input}
                value={pageLayout}
                onChange={(e) => setPageLayout(e.target.value as LayoutName)}
              >
                <option value="standard">Standard</option>
                <option value="centered">Centered</option>
                <option value="split">Split</option>
                <option value="minimal">Minimal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>

          <div className={layout.twoCol}>
             <div className={layout.field}>
                <label className={layout.label}>Emoji</label>
                <input
                  className={layout.input}
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🚀"
                />
             </div>
             <div className={layout.field}>
                <label className={layout.label}>Date</label>
                <input
                  className={layout.input}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="March 2026"
                />
             </div>
          </div>

          <button
            type="button"
            className={layout.primaryBtn}
            onClick={handleCopyUrl}
          >
            {copied ? '✓ URL Copied to Clipboard' : 'Copy Static URL'}
          </button>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className={layout.rightPanel}>
        <header className={layout.rightHeader}>
          <span>Live Preview</span>
          <span className={layout.rightHeaderMeta}>1200×630</span>
        </header>

        <div className={layout.rightBody}>
          <div className={layout.previewCard}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="OG preview"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'var(--radius-sm)' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1200/630',
                  background: 'var(--muted)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            )}
          </div>

          <div className={layout.rightStack}>
            <div className={layout.refCard}>
              <div className={layout.refCardHead}>GET /api/og</div>
              <div className={layout.refCardBody}>
                <code>{WORKER_URL}/api/og</code>
                <br />
                <br />
                ?title (required) · subtitle · author · domain · theme · layout · emoji · date
              </div>
            </div>

            <div className={layout.apiPanel}>
              <div className={layout.tabRow}>
                <button
                  type="button"
                  className={`${layout.tabBtn} ${exampleTab === 'html' ? layout.tabBtnActive : ''}`}
                  onClick={() => setExampleTab('html')}
                >
                  HTML
                </button>
                <button
                  type="button"
                  className={`${layout.tabBtn} ${exampleTab === 'curl' ? layout.tabBtnActive : ''}`}
                  onClick={() => setExampleTab('curl')}
                >
                  cURL
                </button>
              </div>
              <div className={layout.apiPanelBody}>
                <button type="button" className={layout.copyCornerBtn} onClick={copyExample}>
                  {exampleCopied ? 'Copied' : 'Copy'}
                </button>
                <pre
                  className={`${layout.codeBlock} ${layout.codeBlockLight}`}
                  style={{ margin: 0, padding: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                >
                  {exampleCode[exampleTab]}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ToolStudio>
  );
}
