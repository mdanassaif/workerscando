'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ToolStudio } from '@/components';
import { Project } from '@/types';
import layout from '@/styles/components/split-layout.module.css';
import styles from './webdigest.module.css';

const WORKER_URL = process.env.NEXT_PUBLIC_WEB_DIGEST_URL || 'https://webdigest.brogee9o9.workers.dev';

interface DigestResult {
  url: string;
  summary: string;
  takeaways: string;
}

export default function WebDigestClient({ project }: { project: Project }) {
  const [urlInput, setUrlInput] = useState('');
  const [result, setResult] = useState<DigestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateDigest() {
    if (!urlInput.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    let target = urlInput.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate digest');
      }

      setResult(data as DigestResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

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
            {project.description}
          </p>
        </div>

        <div className={layout.leftBody}>
          <div className={layout.field}>
            <label className={layout.label}>Webpage URL</label>
            <input
              className={layout.input}
              placeholder="https://example.com/article"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateDigest()}
              spellCheck={false}
              autoFocus
            />
            <span className={layout.hint}>
              Enter any public URL. Our AI will fetch and summarize the content.
            </span>
          </div>

          <button 
            className={layout.primaryBtn} 
            onClick={generateDigest} 
            disabled={!urlInput.trim() || loading}
          >
            {loading ? 'Analyzing with AI...' : 'Generate Digest'}
          </button>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className={layout.rightPanel}>
        <header className={layout.rightHeader}>
          <span>Research Digest</span>
          {result && <span className={styles.tag}>AI Generated</span>}
        </header>

        <div className={layout.rightBody}>
          {error && <div className={layout.errorBanner}>{error}</div>}

          {!result && !loading && !error && (
            <div className={layout.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <div className={layout.emptyTitle}>Ready to Digest</div>
              <div className={layout.emptyText}>Paste an article link on the left to get an AI-powered summary and key takeaways.</div>
            </div>
          )}

          {loading && (
            <div className={layout.emptyState}>
              <div className={styles.spinner}></div>
              <div className={layout.emptyTitle} style={{ marginTop: '16px' }}>Processing Webpage</div>
              <div className={layout.emptyText}>Our AI models (Llama 3 & BART) are reading and analyzing the content...</div>
            </div>
          )}

          {result && (
            <div className={styles.resultContent}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Summary</h3>
                <p className={styles.summaryText}>{result.summary}</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Key Takeaways</h3>
                <div className={styles.takeaways}>
                  {result.takeaways.split('\n').map((line, i) => (
                    line.trim() && <div key={i} className={styles.takeawayLine}>{line.replace(/^[*-]\s*/, '')}</div>
                  ))}
                </div>
              </div>

              <div className={styles.footer}>
                Source: <a href={result.url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>{result.url}</a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </ToolStudio>
  );
}
