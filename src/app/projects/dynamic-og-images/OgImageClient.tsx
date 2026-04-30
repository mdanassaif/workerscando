'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

        <div className={layout.leftBody} style={{ gap: '16px' }}>
          
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            className={layout.primaryBtn} 
            onClick={handleCopyUrl}
            style={{ marginTop: '8px' }}
          >
            {copied ? '✓ URL Copied to Clipboard' : 'Copy Static URL'}
          </button>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className={layout.rightPanel}>
        <header className={layout.rightHeader}>
          <span>Live Preview</span>
          <span>1200x630px</span>
        </header>

        <div className={layout.rightBody}>
          
          <div className={layout.resultCard} style={{ padding: '8px', background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="OG Image Preview"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }}
              />
            ) : (
               <div style={{ width: '100%', aspectRatio: '1200/630', background: '#F3F4F6', borderRadius: '4px' }} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', fontWeight: 600, fontSize: '13px', color: '#111827' }}>
                API Reference GET Request
              </div>
              <div style={{ padding: '16px', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#4B5563', lineHeight: 1.6 }}>
                <code>{WORKER_URL}/api/og</code><br/><br/>
                <strong>Parameters:</strong><br/>
                ?title=encoded_string  (required)<br/>
                &subtitle=encoded_string<br/>
                &theme=midnight|sunset|ocean|forest|minimal|rose<br/>
                &layout=standard|centered|split|minimal|bold
              </div>
            </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                <button 
                  onClick={() => setExampleTab('html')}
                  style={{ flex: 1, padding: '12px', fontSize: '12px', background: exampleTab === 'html' ? '#F9FAFB' : '#FFFFFF', border: 'none', borderBottom: exampleTab === 'html' ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
                >HTML Head Tag</button>
                <button 
                  onClick={() => setExampleTab('curl')}
                  style={{ flex: 1, padding: '12px', fontSize: '12px', background: exampleTab === 'curl' ? '#F9FAFB' : '#FFFFFF', border: 'none', borderBottom: exampleTab === 'curl' ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
                >cURL</button>
              </div>
              
              <div style={{ padding: '16px', position: 'relative' }}>
                <button 
                  onClick={copyExample}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}
                >
                  {exampleCopied ? '✓ Copied' : 'Copy'}
                </button>
                <div className={layout.codeBlock} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151', padding: '16px', borderRadius: '6px' }}>
                  {exampleCode[exampleTab]}
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
