'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { API } from '@/lib/api';
import layout from '@/styles/components/split-layout.module.css';

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
    title?: string;
    description?: string;
    image?: string;
    creator?: string;
    site?: string;
  };
  favicons?: {
    icon?: string;
    appleTouchIcon?: string;
    shortcut?: string;
  };
  error?: string;
}

interface UrlMetadataClientProps {
  project: Project;
}

export default function UrlMetadataClient({ project }: UrlMetadataClientProps) {
  const [url, setUrl] = useState('freecodecamp.com');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<MetadataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exampleTab, setExampleTab] = useState<'html' | 'curl' | 'js'>('curl');
  const [exampleCopied, setExampleCopied] = useState(false);

  // Direct Cloudflare Workers API URL
  const WORKER_URL = 'https://url-metadata-api.brogee9o9.workers.dev';

  const exampleCode = {
    html: `<meta property="og:url" content="${WORKER_URL}/api/metadata?url=https://example.com" />`,
    curl: `curl "${WORKER_URL}/api/metadata?url=https://example.com"`,
    js: `fetch('${WORKER_URL}/api/metadata?url=' + encodeURIComponent('https://example.com'))\n  .then(res => res.json())\n  .then(data => console.log(data));`
  };

  const copyExample = async () => {
    await navigator.clipboard.writeText(exampleCode[exampleTab]);
    setExampleCopied(true);
    setTimeout(() => setExampleCopied(false), 2000);
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let urlToUse = url.trim();
      if (!urlToUse.startsWith('http://') && !urlToUse.startsWith('https://')) {
        urlToUse = `https://${urlToUse}`;
      }

      const apiUrl = `${API.METADATA}?url=${encodeURIComponent(urlToUse)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract metadata');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (response) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
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
            Extract Open Graph data, Twitter cards, favicons, and metadata directly from any URL instantly.
          </p>
        </div>

        <div className={layout.leftBody}>
          <div className={layout.field}>
            <label className={layout.label}>Target URL</label>
            <input
              className={layout.input}
              placeholder="e.g. example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExtract()}
              spellCheck={false}
              autoFocus
            />
            <span className={layout.hint}>
              Fetches all metadata tags via edge worker.
            </span>
          </div>

          <button 
            className={layout.primaryBtn} 
            onClick={handleExtract} 
            disabled={!url.trim() || loading}
          >
            {loading ? 'Extracting Metadata...' : 'Extract Metadata'}
          </button>

          {/* API Reference Setup contained in left */}
          <div style={{ marginTop: '32px', borderTop: '1px solid #E5E7EB', paddingTop: '32px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              API Reference
            </h3>
            
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                <button 
                  onClick={() => setExampleTab('curl')}
                  style={{ flex: 1, padding: '8px', fontSize: '12px', background: exampleTab === 'curl' ? '#FFFFFF' : 'transparent', border: 'none', borderBottom: exampleTab === 'curl' ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
                >cURL</button>
                <button 
                  onClick={() => setExampleTab('js')}
                  style={{ flex: 1, padding: '8px', fontSize: '12px', background: exampleTab === 'js' ? '#FFFFFF' : 'transparent', border: 'none', borderBottom: exampleTab === 'js' ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
                >JavaScript</button>
                <button 
                  onClick={() => setExampleTab('html')}
                  style={{ flex: 1, padding: '8px', fontSize: '12px', background: exampleTab === 'html' ? '#FFFFFF' : 'transparent', border: 'none', borderBottom: exampleTab === 'html' ? '2px solid #111827' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
                >HTML</button>
              </div>
              
              <div style={{ padding: '12px', position: 'relative' }}>
                <button 
                  onClick={copyExample}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#6B7280' }}
                >
                  {exampleCopied ? 'Copied' : 'Copy'}
                </button>
                <pre style={{ margin: 0, fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {exampleCode[exampleTab]}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className={layout.rightPanel}>
        <header className={layout.rightHeader}>
          <span>JSON Response payload</span>
          {response && (
            <button 
              onClick={handleCopy}
              style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '11px', cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {copied ? '✓ COPIED' : 'COPY JSON'}
            </button>
          )}
        </header>

        <div className={layout.rightBody}>
          {error && <div className={layout.errorBanner}>{error}</div>}

          {!response && !loading && !error && (
            <div className={layout.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div className={layout.emptyTitle}>No API Request Sent</div>
              <div className={layout.emptyText}>Enter a URL to see the extracted metadata JSON payload.</div>
            </div>
          )}

          {loading && !response && (
            <div className={layout.emptyState} style={{ color: '#6B7280' }}>
              Fetching metadata on the edge...
            </div>
          )}

          {response && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Image Preview if available */}
              {(response.image || response.openGraph?.image) && (
                <div style={{ 
                  width: '100%', 
                  background: '#FFFFFF', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '6px', 
                  overflow: 'hidden',
                  padding: '8px'
                }}>
                  <div style={{ 
                    width: '100%',
                    aspectRatio: '1200 / 630',
                    background: '#F9FAFB',
                    backgroundImage: `url(${response.openGraph?.image || response.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '4px'
                  }} />
                  <div style={{ padding: '12px 12px 4px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                      {response.openGraph?.title || response.title || 'No Title'}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {response.openGraph?.description || response.description || 'No Description'}
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Block */}
              <pre className={layout.codeBlock} style={{ margin: 0 }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
