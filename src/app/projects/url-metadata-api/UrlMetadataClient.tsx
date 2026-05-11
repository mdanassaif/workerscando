'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ToolStudio } from '@/components';
import { Project } from '@/types';
import { API } from '@/lib/api';
import layout from '@/styles/components/split-layout.module.css';

interface MetadataResponse {
  success?: boolean;
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
      const data = (await res.json()) as MetadataResponse & { success?: boolean; error?: string };

      if (!res.ok || data.success === false) {
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

          <div className={layout.toolSection}>
            <h3 className={layout.toolSectionTitle}>API reference</h3>
            <div className={layout.apiPanel}>
              <div className={layout.tabRow}>
                <button
                  type="button"
                  className={`${layout.tabBtn} ${exampleTab === 'curl' ? layout.tabBtnActive : ''}`}
                  onClick={() => setExampleTab('curl')}
                >
                  cURL
                </button>
                <button
                  type="button"
                  className={`${layout.tabBtn} ${exampleTab === 'js' ? layout.tabBtnActive : ''}`}
                  onClick={() => setExampleTab('js')}
                >
                  JavaScript
                </button>
                <button
                  type="button"
                  className={`${layout.tabBtn} ${exampleTab === 'html' ? layout.tabBtnActive : ''}`}
                  onClick={() => setExampleTab('html')}
                >
                  HTML
                </button>
              </div>
              <div className={layout.apiPanelBody}>
                <button type="button" className={layout.copyCornerBtn} onClick={copyExample}>
                  {exampleCopied ? 'Copied' : 'Copy'}
                </button>
                <pre className={layout.snippetPre}>{exampleCode[exampleTab]}</pre>
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
            <button type="button" className={layout.headerActionBtn} onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          )}
        </header>

        <div className={layout.rightBody}>
          {error && <div className={layout.errorBanner}>{error}</div>}

          {!response && !loading && !error && (
            <div className={layout.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <div className={layout.emptyTitle}>No API Request Sent</div>
              <div className={layout.emptyText}>Enter a URL to see the extracted metadata JSON payload.</div>
            </div>
          )}

          {loading && !response && (
            <div className={`${layout.emptyState} ${layout.loadingLine}`}>Fetching metadata on the edge…</div>
          )}

          {response && (
            <div className={layout.flexColGap}>
              {(response.image || response.openGraph?.image) && (
                <div className={layout.previewCard}>
                  <div
                    className={layout.previewOg}
                    style={{
                      backgroundImage: `url(${response.openGraph?.image || response.image})`,
                    }}
                  />
                  <div className={layout.previewMeta}>
                    <div className={layout.previewTitle}>
                      {response.openGraph?.title || response.title || 'No title'}
                    </div>
                    <div className={layout.previewDesc}>
                      {response.openGraph?.description || response.description || 'No description'}
                    </div>
                  </div>
                </div>
              )}

              <pre className={layout.codeBlock}>{JSON.stringify(response, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
    </ToolStudio>
  );
}
