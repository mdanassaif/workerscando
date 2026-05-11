'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ToolStudio } from '@/components';
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
            <label className={layout.label}>
              Custom slug <span className={layout.labelMuted}>(optional)</span>
            </label>
            <div className={layout.slugPrefixRow}>
              <span className={layout.slugPrefix}>workerscando.com/s/</span>
              <input
                className={`${layout.input} ${layout.slugInput}`}
                placeholder="my-link"
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value)}
                pattern="[a-zA-Z0-9_-]+"
              />
            </div>
            <span className={layout.hint}>Leave empty for a random short code.</span>
          </div>

          <button 
            className={layout.primaryBtn} 
            onClick={handleShorten} 
            disabled={!url.trim() || loading}
          >
            {loading ? 'Creating Short Link...' : 'Shorten URL'}
          </button>

          <div className={layout.toolSection}>
            <h3 className={layout.toolSectionTitle}>Edge API</h3>
            <div className={layout.apiChipRow}>
              <button
                type="button"
                className={`${layout.apiChip} ${apiTab === 'shorten' ? layout.apiChipOn : ''}`}
                onClick={() => setApiTab('shorten')}
              >
                Create
              </button>
              <button
                type="button"
                className={`${layout.apiChip} ${apiTab === 'stats' ? layout.apiChipOn : ''}`}
                onClick={() => setApiTab('stats')}
              >
                Stats
              </button>
              <button
                type="button"
                className={`${layout.apiChip} ${apiTab === 'track' ? layout.apiChipOn : ''}`}
                onClick={() => setApiTab('track')}
              >
                Redirect
              </button>
            </div>
            <div className={layout.apiDocBox}>
              {apiTab === 'shorten' && (
                <>
                  <span className={layout.methodPost}>POST</span> {WORKER_URL}/api/shorten
                  <br />
                  <br />
                  Body: <code>{`{"url":"...","slug":"..."}`}</code>
                </>
              )}
              {apiTab === 'stats' && (
                <>
                  <span className={layout.methodGet}>GET</span> {WORKER_URL}/api/stats/[slug]
                </>
              )}
              {apiTab === 'track' && (
                <>
                  <span className={layout.methodGet}>GET</span> {WORKER_URL}/[slug]
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
            <div className={`${layout.resultCard} ${layout.resultCardHighlight}`}>
              <div className={layout.kickerSm}>Your link</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className={layout.linkHero}>
                  {result.shortUrl.replace('https://', '')}
                </a>
                <button type="button" className={layout.ghostBtn} onClick={handleCopy}>
                  {copiedResult ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className={layout.redirectToRow}>
                <span style={{ whiteSpace: 'nowrap' }}>Redirects to</span>
                <span className={layout.redirectToUrl}>{result.url}</span>
              </div>
            </div>
          )}

          {/* Live Analytics Dashboard */}
          {(analytics || loadingAnalytics || result) && (
            <div className={`${layout.resultCard} ${layout.flexColGap}`} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                  Live analytics {result ? `· /${result.slug}` : ''}
                </h3>
                {loadingAnalytics && (
                  <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Refreshing…</span>
                )}
              </div>

              <div className={layout.statGrid}>
                <div className={layout.statCard}>
                  <div className={layout.statLabel}>Total clicks</div>
                  <div className={layout.statValue}>{analytics?.total_clicks ?? '—'}</div>
                </div>
                <div className={layout.statCard}>
                  <div className={layout.statLabel}>Past 24 hours</div>
                  <div className={layout.statValue}>{analytics?.last_24h ?? '—'}</div>
                </div>
              </div>

              <div className={layout.twoCol}>
                <div>
                  <h4 className={layout.listHeading}>Top countries</h4>
                  {!analytics?.countries || Object.keys(analytics.countries).length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>No data yet</div>
                  ) : (
                    Object.entries(analytics.countries)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([country, count]) => (
                        <div key={country} className={layout.barRow}>
                          <span>{country}</span>
                          <span style={{ fontWeight: 600 }}>{count}</span>
                        </div>
                      ))
                  )}
                </div>
                <div>
                  <h4 className={layout.listHeading}>Devices</h4>
                  {!analytics?.devices || Object.keys(analytics.devices).length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>No data yet</div>
                  ) : (
                    Object.entries(analytics.devices)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([device, count]) => (
                        <div key={device} className={layout.barRow}>
                          <span style={{ textTransform: 'capitalize' }}>{device}</span>
                          <span style={{ fontWeight: 600 }}>{count}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Saved History */}
          {savedLinks.length > 0 && !result && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Recent links</h3>
                <button type="button" className={layout.dangerBtn} onClick={() => {
                  if (window.confirm('Clear all saved links?')) setSavedLinks([]);
                }}
                >
                  Clear all
                </button>
              </div>
              <div className={layout.flexColGap}>
                {savedLinks.map(link => (
                  <div
                    key={link.slug}
                    className={layout.resultCard}
                    style={{ marginBottom: 0, padding: '16px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontWeight: 600,
                            color: 'var(--foreground)',
                            textDecoration: 'none',
                            fontSize: '14px',
                          }}
                        >
                          /{link.slug}
                        </a>
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--muted-foreground)',
                            marginTop: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {link.url}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          className={layout.mutedBtn}
                          onClick={() =>
                            setResult({ slug: link.slug, url: link.url, shortUrl: link.shortUrl })
                          }
                        >
                          Stats
                        </button>
                        <button
                          type="button"
                          className={layout.mutedBtn}
                          onClick={async () => {
                            await navigator.clipboard.writeText(link.shortUrl);
                            setCopiedSlug(link.slug);
                            setTimeout(() => setCopiedSlug(null), 2000);
                          }}
                        >
                          {copiedSlug === link.slug ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!result && savedLinks.length === 0 && (
            <div className={layout.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    </ToolStudio>
  );
}
