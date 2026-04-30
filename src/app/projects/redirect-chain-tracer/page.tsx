'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import layout from '@/styles/components/split-layout.module.css';

const WORKER_URL =
  process.env.NEXT_PUBLIC_REDIRECT_TRACER_URL ?? 'http://localhost:8798';

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
      const res = await fetch(`${WORKER_URL}/trace`, {
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
      setApiError('Unable to connect to the trace worker. Ensure it is running locally.');
    } finally {
      setLoading(false);
    }
  }

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
          <span>Trace Results</span>
          {result && <span>{result.total_hops} hops • {result.total_ms}ms</span>}
        </header>

        <div className={layout.rightBody}>
          {apiError && <div className={layout.errorBanner}>{apiError}</div>}

          {!result && !loading && !apiError && (
            <div className={layout.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <div className={layout.emptyTitle}>Ready to Trace</div>
              <div className={layout.emptyText}>Enter a URL on the left. The network hop cascade will appear here in real-time.</div>
            </div>
          )}

          {loading && !result && (
            <div className={layout.emptyState} style={{ color: '#6B7280' }}>
              Following redirects...
            </div>
          )}

          {result && (
            <div className={layout.resultCard} style={{ background: 'transparent', border: 'none', padding: 0 }}>
              
              {result.has_downgrade && (
                <div className={layout.errorBanner} style={{ marginBottom: '32px' }}>
                  <strong>Security Warning:</strong> Your chain contains an insecure protocol downgrade (HTTPS to HTTP).
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {result.hops.map((hop, index) => {
                  const isError = hop.status >= 400 || hop.status === 0;
                  const isRedirect = hop.status >= 300 && hop.status < 400;
                  
                  return (
                    <div key={index} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px' }}>
                      
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '4px', background: '#F3F4F6', color: '#4B5563',
                        fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                           <span style={{ 
                             fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#111827', 
                             wordBreak: 'break-all', lineHeight: 1.5 
                           }}>
                             {hop.url}
                           </span>

                           <span style={{ 
                             fontSize: '12px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                             background: isError ? '#FEF2F2' : isRedirect ? '#FFFBEB' : '#ECFDF5',
                             color: isError ? '#DC2626' : isRedirect ? '#D97706' : '#059669',
                             border: `1px solid ${isError ? '#FECACA' : isRedirect ? '#FEF3C7' : '#D1FAE5'}`
                           }}>
                             {hop.status === 0 ? 'ERR' : hop.status}
                           </span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B7280', flexWrap: 'wrap' }}>
                          <span>{hop.duration_ms}ms</span>

                          {hop.is_downgrade && (
                            <span style={{ color: '#DC2626', fontWeight: 500 }}>HTTPS ➔ HTTP</span>
                          )}
                          
                          {hop.added_params.length > 0 && (
                            <span style={{ color: '#059669' }}>
                              + {hop.added_params.join(', ')}
                            </span>
                          )}
                          
                          {hop.removed_params.length > 0 && (
                            <span style={{ color: '#DC2626', textDecoration: 'line-through' }}>
                              - {hop.removed_params.join(', ')}
                            </span>
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
  );
}
