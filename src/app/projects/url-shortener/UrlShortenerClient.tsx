'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import layout from '@/styles/components/split-layout.module.css';
import { shortenUrl, getShortUrlStats, ShortenResponse, StatsResponse } from '@/lib/api';

interface UrlShortenerClientProps {
  project: Project;
}

export interface SavedShortLink {
  slug: string;
  url: string;
  shortUrl: string;
  createdAt: string;
}

export default function UrlShortenerClient({ project }: UrlShortenerClientProps) {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(ShortenResponse & { shortUrl: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<StatsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  const [savedLinks, setSavedLinks] = useState<SavedShortLink[]>([]);
  const [apiTab, setApiTab] = useState<'shorten' | 'stats' | 'track'>('shorten');

  const WORKER_URL = 'https://urlshortener.brogee9o9.workers.dev';

  const isInitialMount = useRef(true);

  useEffect(() => {
    // On mount, try to load from localStorage
    if (isInitialMount.current) {
      const saved = localStorage.getItem('shortenedLinks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedLinks(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved links', e);
        }
      }
      isInitialMount.current = false;
      return;
    }
    
    // On subsequent updates, save to localStorage
    localStorage.setItem('shortenedLinks', JSON.stringify(savedLinks));
  }, [savedLinks]);


  const handleShorten = async () => {
    if (!url.trim()) {
      setError('Please enter a target URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAnalytics(null);

    try {
      let urlToUse = url.trim();
      if (!urlToUse.startsWith('http://') && !urlToUse.startsWith('https://')) {
        urlToUse = `https://${urlToUse}`;
      }

      const data = await shortenUrl({ url: urlToUse, slug: customSlug.trim() || undefined });
      const shortUrl = `https://workerscando.com/s/${data.slug}`;
      const originalUrl = (data as any).originalUrl || data.url || urlToUse;
      
      setResult({ ...data, url: originalUrl, shortUrl });
      
      const newLink: SavedShortLink = {
        slug: data.slug,
        url: originalUrl,
        shortUrl,
        createdAt: new Date().toISOString(),
      };
      
      setSavedLinks(prev => {
        if (prev.some(l => l.slug === newLink.slug)) return prev;
        return [newLink, ...prev];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred connecting to the service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  const fetchAnalytics = useCallback(async (slug: string) => {
    setLoadingAnalytics(true);
    try {
      const data = await getShortUrlStats(slug);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (result?.slug) {
      fetchAnalytics(result.slug);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => fetchAnalytics(result.slug), 15000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [result?.slug, fetchAnalytics]);

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
            Create branded short links instantly. Includes real-time edge analytics for clicks, countries, and devices.
          </p>
        </div>

        <div className={layout.leftBody}>
          <div className={layout.field}>
            <label className={layout.label}>Target URL</label>
            <input
              className={layout.input}
              placeholder="e.g. https://github.com/mdanassaif"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleShorten()}
              autoFocus
            />
          </div>

          <div className={layout.field}>
            <label className={layout.label}>Custom Slug <span style={{ color: '#9CA3AF', fontWeight: 'normal' }}>(Optional)</span></label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '10px 12px', background: '#F9FAFB', border: '1px solid #D1D5DB', borderRight: 'none', borderRadius: '6px 0 0 6px', color: '#6B7280', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                workerscando.com/s/
              </span>
              <input
                className={layout.input}
                style={{ borderRadius: '0 6px 6px 0' }}
                placeholder="my-link"
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value)}
                pattern="[a-zA-Z0-9_-]+"
              />
            </div>
            <span className={layout.hint}>
              Leave empty for a random short code.
            </span>
          </div>

          <button 
            className={layout.primaryBtn} 
            onClick={handleShorten} 
            disabled={!url.trim() || loading}
          >
            {loading ? 'Creating Short Link...' : 'Shorten URL'}
          </button>

          {/* API Documentation in Sidebar */}
          <div style={{ marginTop: '32px', borderTop: '1px solid #E5E7EB', paddingTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Edge API
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button 
                onClick={() => setApiTab('shorten')} 
                style={{ padding: '6px 10px', fontSize: '12px', background: apiTab === 'shorten' ? '#111827' : '#F3F4F6', color: apiTab === 'shorten' ? '#FFFFFF' : '#4B5563', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >Create</button>
              <button 
                onClick={() => setApiTab('stats')} 
                style={{ padding: '6px 10px', fontSize: '12px', background: apiTab === 'stats' ? '#111827' : '#F3F4F6', color: apiTab === 'stats' ? '#FFFFFF' : '#4B5563', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >Stats</button>
              <button 
                onClick={() => setApiTab('track')} 
                style={{ padding: '6px 10px', fontSize: '12px', background: apiTab === 'track' ? '#111827' : '#F3F4F6', color: apiTab === 'track' ? '#FFFFFF' : '#4B5563', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >Track</button>
            </div>

            <div style={{ padding: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#374151', wordBreak: 'break-all' }}>
              {apiTab === 'shorten' && (
                <>
                  <strong style={{ color: '#059669' }}>POST</strong> {WORKER_URL}/api/shorten<br/><br/>
                  Body: <code>{`{"url":"...","slug":"..."}`}</code>
                </>
              )}
              {apiTab === 'stats' && (
                <>
                  <strong style={{ color: '#2563EB' }}>GET</strong> {WORKER_URL}/api/stats/[slug]
                </>
              )}
              {apiTab === 'track' && (
                <>
                  <strong style={{ color: '#2563EB' }}>GET</strong> {WORKER_URL}/[slug]
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className={layout.rightPanel}>
        <header className={layout.rightHeader}>
          <span>Analytics & Links</span>
        </header>

        <div className={layout.rightBody}>
          {error && <div className={layout.errorBanner}>{error}</div>}

          {/* Active Result Banner */}
          {result && (
            <div className={layout.resultCard} style={{ background: '#FFFFFF', borderColor: '#111827', borderWidth: '2px', padding: '32px' }}>
              <div style={{ marginBottom: '8px', fontSize: '13px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Your Link is Ready</div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '24px', fontWeight: 600, color: '#111827', textDecoration: 'none' }}>
                  {result.shortUrl.replace('https://', '')}
                </a>
                <button 
                  onClick={handleCopy}
                  style={{ padding: '8px 16px', background: '#111827', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {copiedResult ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ whiteSpace: 'nowrap' }}>Redirects to:</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px' }}>
                  {result.url}
                </span>
              </div>
            </div>
          )}

          {/* Live Analytics Dashboard */}
          {(analytics || loadingAnalytics || result) && (
            <div className={layout.resultCard} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Live Analytics {result ? `for /${result.slug}` : ''}
                </h3>
                {loadingAnalytics && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Refreshing...</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>Total Clicks</div>
                  <div style={{ fontSize: '32px', fontWeight: 600, color: '#111827' }}>
                    {analytics?.total_clicks ?? '—'}
                  </div>
                </div>
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>Past 24 Hours</div>
                  <div style={{ fontSize: '32px', fontWeight: 600, color: '#111827' }}>
                    {analytics?.last_24h ?? '—'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, marginBottom: '12px' }}>Top Countries</h4>
                  {!analytics?.countries || Object.keys(analytics.countries).length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#9CA3AF' }}>No data yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(analytics.countries).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([country, count]) => (
                        <div key={country} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#374151' }}>{country}</span>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, marginBottom: '12px' }}>Devices</h4>
                  {!analytics?.devices || Object.keys(analytics.devices).length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#9CA3AF' }}>No data yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(analytics.devices).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([device, count]) => (
                        <div key={device} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#374151', textTransform: 'capitalize' }}>{device}</span>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Saved History */}
          {savedLinks.length > 0 && !result && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>My Links</h3>
                <button 
                  onClick={() => { if (window.confirm('Clear all links?')) setSavedLinks([]); }}
                  style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: '13px', cursor: 'pointer' }}
                >
                  Clear All
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedLinks.map(link => (
                  <div key={link.slug} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                      <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: '#111827', textDecoration: 'none', fontSize: '14px' }}>
                        /{link.slug}
                      </a>
                      <span style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {link.url}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button 
                        onClick={() => setResult({ slug: link.slug, url: link.url, shortUrl: link.shortUrl })}
                        style={{ padding: '6px 12px', fontSize: '12px', background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}
                      >Stats</button>
                      <button 
                        onClick={async () => {
                          await navigator.clipboard.writeText(link.shortUrl);
                          setCopiedSlug(link.slug);
                          setTimeout(() => setCopiedSlug(null), 2000);
                        }}
                        style={{ padding: '6px 12px', fontSize: '12px', background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}
                      >
                        {copiedSlug === link.slug ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {!result && savedLinks.length === 0 && (
            <div className={layout.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              <div className={layout.emptyTitle}>Enter a URL</div>
              <div className={layout.emptyText}>Create a new shortlink to instantly generate production-ready edge analytics.</div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
