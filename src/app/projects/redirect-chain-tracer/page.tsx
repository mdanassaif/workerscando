'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ToolStudio } from '@/components';
import layout from '@/styles/components/split-layout.module.css';

const WORKER_URL =
  process.env.NEXT_PUBLIC_REDIRECT_TRACER_URL ?? 'https://redirect-chain.brogee9o9.workers.dev';

interface Hop {
  url: string;
  status: number;
  duration_ms: number;
  location_header: string | null;
  params: Record<string, string>;
  added_params: string[];
  removed_params: string[];
  is_downgrade: boolean;
}

interface TraceResult {
  final_url: string;
  total_hops: number;
  total_ms: number;
  has_downgrade: boolean;
  hops: Hop[];
  error?: string;
}

export default function RedirectTracerPage() {
  const [urlInput, setUrlInput] = useState('');
  const [result, setResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function traceUrl() {
    if (!urlInput.trim()) return;
    
    setLoading(true);
    setResult(null);
    setApiError(null);

    let target = urlInput.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'http://' + target;
    }
    setUrlInput(target);

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      
      const data = await res.json() as TraceResult & { error?: string };
      
      if (res.status !== 200 && data.error) {
        setApiError(data.error);
        if (data.hops) setResult(data);
      } else {
        setResult(data);
      }
    } catch {
      setApiError(
        'Could not reach the trace worker. For local dev run `wrangler dev` in workers/redirect-chain-tracer and set NEXT_PUBLIC_REDIRECT_TRACER_URL.',
      );
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
            <span className={layout.dayTag}>Day 7</span>
            <span className={layout.liveTag}>
              <span className={layout.liveDot} />
              Live
            </span>
          </div>
          
          <h1 className={layout.title}>Redirect Tracer</h1>
          <p className={layout.description}>
            Follow every HTTP hop. Uncover hidden tracking params, measure exact edge latency, and detect forced security downgrades.
          </p>
        </div>

        <div className={layout.leftBody}>
          <div className={layout.field}>
            <label className={layout.label}>Target URL</label>
            <input
              className={layout.input}
              placeholder="e.g. github.com or bit.ly/example"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && traceUrl()}
              spellCheck={false}
              autoFocus
            />
            <span className={layout.hint}>
              Traced manually via Cloudflare edge servers. Maximum 20 redirects followed.
            </span>
          </div>

          <button 
            className={layout.primaryBtn} 
            onClick={traceUrl} 
            disabled={!urlInput.trim() || loading}
          >
            {loading ? 'Tracing Hops...' : 'Trace URL Chain'}
          </button>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className={layout.rightPanel}>
        <header className={layout.rightHeader}>
          <span>Trace results</span>
          {result && (
            <span className={layout.rightHeaderMeta}>
              {result.total_hops} hops · {result.total_ms}ms
            </span>
          )}
        </header>

        <div className={layout.rightBody}>
          {apiError && <div className={layout.errorBanner}>{apiError}</div>}

          {!result && !loading && !apiError && (
            <div className={layout.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <div className={layout.emptyTitle}>Ready to Trace</div>
              <div className={layout.emptyText}>Enter a URL on the left. The network hop cascade will appear here in real-time.</div>
            </div>
          )}

          {loading && !result && (
            <div className={`${layout.emptyState} ${layout.loadingLine}`}>Following redirects…</div>
          )}

          {result && (
            <div className={`${layout.resultCard} ${layout.transparentResult}`}>
              {result.has_downgrade && (
                <div className={`${layout.errorBanner} ${layout.warnBanner}`} style={{ marginBottom: '24px' }}>
                  <strong>HTTPS → HTTP</strong> in this chain. Review before trusting the final URL.
                </div>
              )}

              <div className={layout.hopList}>
                {result.hops.map((hop, index) => {
                  const isError = hop.status >= 400 || hop.status === 0;
                  const isRedirect = hop.status >= 300 && hop.status < 400;
                  const pillClass = isError ? layout.pillErr : isRedirect ? layout.pillRedirect : layout.pillOk;

                  return (
                    <div key={`${hop.url}-${index}`} className={layout.hopRow}>
                      <div className={layout.hopIndex}>{index + 1}</div>
                      <div className={layout.hopBody}>
                        <div className={layout.hopTop}>
                          <span className={layout.hopUrl}>{hop.url}</span>
                          <span className={`${layout.statusPill} ${pillClass}`}>
                            {hop.status === 0 ? 'ERR' : hop.status}
                          </span>
                        </div>
                        <div className={layout.hopMeta}>
                          <span>{hop.duration_ms}ms</span>
                          {hop.is_downgrade && (
                            <span className={layout.downgrade}>Protocol downgrade</span>
                          )}
                          {hop.added_params.length > 0 && (
                            <span className={layout.paramAdd}>+ {hop.added_params.join(', ')}</span>
                          )}
                          {hop.removed_params.length > 0 && (
                            <span className={layout.paramRemove}>- {hop.removed_params.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </ToolStudio>
  );
}
