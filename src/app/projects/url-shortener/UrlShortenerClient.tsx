'use client';

import React, { useState, useEffect } from 'react';

import { Project } from '@/types';
import styles from './url-shortener.module.css';
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
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);
  const [analytics, setAnalytics] = useState<StatsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [shortenExampleTab, setShortenExampleTab] = useState<'curl' | 'js'>('curl');
  const [shortenExampleCopied, setShortenExampleCopied] = useState(false);
  const [statsExampleTab, setStatsExampleTab] = useState<'curl' | 'js'>('curl');
  const [statsExampleCopied, setStatsExampleCopied] = useState(false);
  const [trackExampleTab, setTrackExampleTab] = useState<'curl' | 'js'>('curl');
  const [trackExampleCopied, setTrackExampleCopied] = useState(false);
  const [savedLinks, setSavedLinks] = useState<SavedShortLink[]>([]);

  const shortenExampleCode = {
    curl: `curl -X POST "https://workerscando.com/api/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`,
    js: `fetch('https://workerscando.com/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
})
.then(res => res.json())
.then(data => console.log(data));`
  };

  const statsExampleCode = {
    curl: `curl "https://workerscando.com/api/s/abc123/stats"`,
    js: `fetch('https://workerscando.com/api/s/abc123/stats')
  .then(res => res.json())
  .then(data => console.log(data));`
  };

  const trackExampleCode = {
    curl: `curl -L "https://workerscando.com/s/abc123"`,
    js: `// Redirects automatically in browser
window.location.href = 'https://workerscando.com/s/abc123';

// Or fetch with redirect: 'manual' to inspect
fetch('https://workerscando.com/s/abc123', { redirect: 'manual' })
  .then(res => {
    if (res.status === 302) {
      const location = res.headers.get('Location');
      console.log('Redirects to:', location);
    }
  });`
  };

  const copyShortenExample = async () => {
    await navigator.clipboard.writeText(shortenExampleCode[shortenExampleTab]);
    setShortenExampleCopied(true);
    setTimeout(() => setShortenExampleCopied(false), 2000);
  };

  const copyStatsExample = async () => {
    await navigator.clipboard.writeText(statsExampleCode[statsExampleTab]);
    setStatsExampleCopied(true);
    setTimeout(() => setStatsExampleCopied(false), 2000);
  };

  const copyTrackExample = async () => {
    await navigator.clipboard.writeText(trackExampleCode[trackExampleTab]);
    setTrackExampleCopied(true);
    setTimeout(() => setTrackExampleCopied(false), 2000);
  };

  // Load saved links from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('shortenedLinks');
    if (saved) {
      try {
        setSavedLinks(JSON.parse(saved));
      } catch {
        setSavedLinks([]);
      }
    }
  }, []);

  // Save links to localStorage when savedLinks changes
  useEffect(() => {
    localStorage.setItem('shortenedLinks', JSON.stringify(savedLinks));
  }, [savedLinks]);

  const handleShorten = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
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
      // Handle both 'url' and 'originalUrl' from API response
      const originalUrl = (data as any).originalUrl || data.url || urlToUse;
      setResult({ ...data, url: originalUrl, shortUrl });
      // Save to localStorage
      const newLink: SavedShortLink = {
        slug: data.slug,
        url: originalUrl,
        shortUrl,
        createdAt: new Date().toISOString(),
      };
      setSavedLinks((prev) => {
        // Avoid duplicates by slug
        if (prev.some((l) => l.slug === newLink.slug)) return prev;
        return [newLink, ...prev];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.shortUrl);
        setCopiedResult(true);
        setTimeout(() => setCopiedResult(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const fetchAnalytics = async () => {
    if (!result?.slug) return;
    setLoadingAnalytics(true);
    try {
      const data = await getShortUrlStats(result.slug);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (result) {
      fetchAnalytics();
      // Refresh analytics every 5 seconds
      const interval = setInterval(fetchAnalytics, 5000);
      return () => clearInterval(interval);
    }
  }, [result]);

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
            Create branded short links with real-time analytics. Deploy globally in seconds.
          </p>
        </div>
      </section>

      <section className={styles.demoSection}>
        <div className={styles.container}>
          <div className={styles.demoCard}>
            <h2 className={styles.demoTitle}>Create Short Link</h2>

            <div className={styles.inputGroup}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className={styles.urlInput}
                onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
              />
              <button
                onClick={handleShorten}
                disabled={loading}
                className={styles.shortenButton}
              >
                {loading ? 'Shortening...' : 'Shorten'}
              </button>
            </div>

            <div className={styles.customSlugGroup}>
              <label className={styles.customSlugLabel}>Custom Slug (optional)</label>
              <div className={styles.customSlugInputWrapper}>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-custom-link"
                  className={styles.customSlugInput}
                  pattern="[a-zA-Z0-9_-]+"
                />
              </div>
              <p className={styles.customSlugHint}>
                Only letters, numbers, hyphens, and underscores allowed
              </p>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {result && (
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Your Short Link</span>
                  <button onClick={handleCopy} className={styles.copyButton}>
                    {copiedResult ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className={styles.resultUrl}>{result.shortUrl}</div>
                <div className={styles.originalUrl}>
                  <span className={styles.originalUrlLabel}>Original URL:</span>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className={styles.originalUrlLink}>{result.url}</a>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Saved Links Section */}
        {savedLinks.length > 0 && (
          <div className={styles.container}>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className={styles.demoCard} style={{ flex: 1, minWidth: 320 }}>
                <div className={styles.savedLinksHeader}>
                  <h2 className={styles.demoTitle}>Your Saved Short Links</h2>
                  <button
                    className={styles.copyButton}
                    style={{ background: '#991B1B', minWidth: 90 }}
                    onClick={() => {
                      if (window.confirm('Clear all saved links?')) setSavedLinks([]);
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div className={styles.savedLinksList}>
                  {savedLinks.map((link) => (
                    <div key={link.slug} className={styles.resultCardCompact}>
                      <div className={styles.resultHeaderCompact}>
                        <span className={styles.resultLabel}>{link.slug}</span>
                        <button
                          className={styles.copyButton}
                          onClick={async () => {
                            await navigator.clipboard.writeText(link.shortUrl);
                            setCopiedSlug(link.slug);
                            setTimeout(() => setCopiedSlug(null), 2000);
                          }}
                        >
                          {copiedSlug === link.slug ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          className={styles.copyButton}
                          style={{ marginLeft: 8, background: '#2563eb' }}
                          onClick={async () => {
                            setResult({ slug: link.slug, url: link.url, shortUrl: link.shortUrl });
                          }}
                        >
                          Track
                        </button>
                        <button
                          className={styles.copyButton}
                          style={{ marginLeft: 8, background: '#991B1B' }}
                          onClick={() => {
                            if (window.confirm('Delete this link?')) setSavedLinks((prev) => prev.filter((l) => l.slug !== link.slug));
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <div className={styles.resultUrlCompact}><a href={link.shortUrl} target="_blank" rel="noopener noreferrer">{link.shortUrl}</a></div>
                      <div className={styles.originalUrlCompact}>
                        <span title={link.url}>Original:</span> {link.url ? (<a href={link.url} target="_blank" rel="noopener noreferrer">{link.url.length > 32 ? link.url.slice(0, 32) + '…' : link.url}</a>) : <span style={{ color: '#991B1B' }}>N/A</span>}
                        <span className={styles.createdAtCompact}>{new Date(link.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {analytics && (
                <div className={styles.analyticsCardSmall}>
                  <h3 className={styles.analyticsTitleSmall}>Analytics</h3>
                  <div className={styles.analyticsStatsRow}>
                    <div>
                      <div className={styles.analyticsStatValue}>{analytics.total_clicks}</div>
                      <div className={styles.analyticsStatLabel}>Total</div>
                    </div>
                    <div>
                      <div className={styles.analyticsStatValue}>{analytics.last_24h ?? 0}</div>
                      <div className={styles.analyticsStatLabel}>24h</div>
                    </div>
                  </div>
                  <div className={styles.analyticsSectionLabel}>Last 24 Hours Activity</div>
                  <div className={styles.analyticsBarWrapper}>
                    {/* Simple bar for 24h activity (simulate for now) */}
                    <div className={styles.analyticsBarBg}>
                      <div className={styles.analyticsBarFill} style={{ width: `${Math.min(analytics.last_24h || 0, 100)}%` }} />
                    </div>
                    <div className={styles.analyticsBarLabels}>
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>23:59</span>
                    </div>
                  </div>
                  <div className={styles.analyticsSectionLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1024 1024"><path fill="#2563eb" d="M512 1024q-104 0-199-40.5t-163.5-109T40.5 711T0 512t40.5-199t109-163.5T313 40.5T512 0t199 40.5t163.5 109t109 163.5t40.5 199t-40.5 199t-109 163.5t-163.5 109t-199 40.5zM293 293l-48-42q-11 0-26 2.5t-27 2.5q-1-1-18-37Q64 346 64 512q0 3 .5 8t.5 7q6 6 29.5 22.5T128 576h64q3-2 5.5-3t5.5-2q-10-11-29.5-32.5T144 507q4-23 11-69.5t10-69.5q86-36 128-53v-22zm201-163q-14-6-26-11q-3-8-4-12q-6 19-19 57q4 1 11.5 2t11.5 2h26v-38zm-4 471q-5 5-7 8q-12 21-34 64t-33 64q14 21 42.5 64t42.5 64q130 8 197 12q2 25 16 34q91-46 154-127.5T951 601q-19-4-41.5-11t-32.5-9.5t-39.5-5T776 579q-12 1-15.5-15.5t-3.5-34t-4-18.5q-22-4-89 7.5t-89 7.5q-13 12-85 75zm59-501q-3 20-10.5 60T527 221q5-1 16.5-2.5T560 217q-3-2-7-4q15-5 22-8q-17-70-26-105zm116-9q-2 11-2 31t-10 53q1 2 4 4q20-2 67-7q0-21 21-42q-38-23-80-39zm125 70q-2 4-7 11q19 3 25 5q-12-11-18-16zm27 24q-3 6-9.5 18t-9.5 18q-29 1-78 3l-4-34q-2 1-7 2.5t-8 1.5v49q-21 2-64.5 6t-64.5 6q-7 10-15 22q27 58 41 87q-20 5-82 22v34q0 2 1.5 6t2.5 6q17 8 53 24t54 25l22-27q-1-10-5-31.5t-6-32.5q3-2 9.5-5.5t9.5-5.5q27-8 41-11q13 21 36.5 60t29.5 49q9-8 25-24.5t24-24.5q-54-38-71-49q1-8 4-23h37q56 48 115 98q1 0 2-1.5t2-1.5q-4-8-26-49q0-1 3-4l4-4h41q1-1 17-9q-34-116-124-200z" /></svg>
                    </span>
                    Top Countries
                  </div>
                  <div className={styles.analyticsListRow}>
                    {!analytics.countries || Object.keys(analytics.countries).length === 0 ? (
                      <span className={styles.analyticsNoData}>No data yet</span>
                    ) : (
                      Object.entries(analytics.countries)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([country, count]) => (
                          <span key={country} className={styles.analyticsCountry}>
                            {country}: {count}
                          </span>
                        ))
                    )}
                  </div>
                  <div className={styles.analyticsSectionLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#2563eb" d="M21.989 16.049c.009-.315.011-.657.011-1.049V6c0-1.654-1.346-3-3-3H5C3.346 3 2 4.346 2 6v9c0 .385.002.73.012 1.049A2.504 2.504 0 0 0 0 18.5C0 19.878 1.122 21 2.5 21h19c1.378 0 2.5-1.122 2.5-2.5a2.504 2.504 0 0 0-2.011-2.451zM4 6c0-.551.449-1 1-1h14c.551 0 1 .449 1 1v9c0 .388-.005.726-.014 1H19V7c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v9h-.98c-.012-.264-.02-.599-.02-1V6zm14 10H6V7h12v9zm3.5 3h-19c-.271 0-.5-.229-.5-.5s.229-.5.5-.5h19c.271 0 .5.229.5.5s-.229.5-.5.5z" /></svg>
                    </span>
                    Devices
                  </div>
                  <div className={styles.analyticsListRow}>
                    {!analytics.devices || Object.keys(analytics.devices).length === 0 ? (
                      <span className={styles.analyticsNoData}>No data yet</span>
                    ) : (
                      Object.entries(analytics.devices)
                        .map(([device, count]) => (
                          <span key={device} className={styles.analyticsDevice}>
                            {device}: {count}
                          </span>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className={styles.apiSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>API Reference</h2>

          {/* Shorten API */}
          <div className={styles.apiCard} style={{ marginBottom: 24 }}>
            <div className={styles.apiMethod}>
              <span className={styles.methodBadge}>POST</span>
              <code className={styles.apiEndpoint}>/api/shorten</code>
            </div>
            <p className={styles.apiDescription}>Create a new short link</p>

            <div className={styles.parametersTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Parameter</div>
                <div className={styles.tableCell}>Description</div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>url</code>
                  <span className={styles.required}>required</span>
                </div>
                <div className={styles.tableCell}>
                  The URL to shorten (must be HTTP or HTTPS)
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>customSlug</code>
                  <span className={styles.optional}>optional</span>
                </div>
                <div className={styles.tableCell}>
                  Custom slug for the short link (letters, numbers, hyphens, underscores only)
                </div>
              </div>
            </div>

            <div className={styles.exampleBox}>
              <div className={styles.exampleHeader}>
                <div className={styles.exampleTabs}>
                  <button
                    className={`${styles.exampleTab} ${shortenExampleTab === 'curl' ? styles.exampleTabActive : ''}`}
                    onClick={() => setShortenExampleTab('curl')}
                  >
                    cURL
                  </button>
                  <button
                    className={`${styles.exampleTab} ${shortenExampleTab === 'js' ? styles.exampleTabActive : ''}`}
                    onClick={() => setShortenExampleTab('js')}
                  >
                    JavaScript
                  </button>
                </div>
                <button className={styles.exampleCopy} onClick={copyShortenExample}>
                  {shortenExampleCopied ? '✓' : 'Copy'}
                </button>
              </div>
              <div className={styles.exampleCode}>
                <code>{shortenExampleCode[shortenExampleTab]}</code>
              </div>
            </div>
          </div>

          {/* Stats API */}
          <div className={styles.apiCard} style={{ marginBottom: 24 }}>
            <div className={styles.apiMethod}>
              <span className={styles.methodBadge}>GET</span>
              <code className={styles.apiEndpoint}>/api/s/{'{slug}'}/stats</code>
            </div>
            <p className={styles.apiDescription}>Get analytics and statistics for a short link</p>

            <div className={styles.parametersTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Parameter</div>
                <div className={styles.tableCell}>Description</div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>slug</code>
                  <span className={styles.required}>required</span>
                </div>
                <div className={styles.tableCell}>
                  The slug of the short link (path parameter)
                </div>
              </div>
            </div>

            <div className={styles.exampleBox}>
              <div className={styles.exampleHeader}>
                <div className={styles.exampleTabs}>
                  <button
                    className={`${styles.exampleTab} ${statsExampleTab === 'curl' ? styles.exampleTabActive : ''}`}
                    onClick={() => setStatsExampleTab('curl')}
                  >
                    cURL
                  </button>
                  <button
                    className={`${styles.exampleTab} ${statsExampleTab === 'js' ? styles.exampleTabActive : ''}`}
                    onClick={() => setStatsExampleTab('js')}
                  >
                    JavaScript
                  </button>
                </div>
                <button className={styles.exampleCopy} onClick={copyStatsExample}>
                  {statsExampleCopied ? '✓' : 'Copy'}
                </button>
              </div>
              <div className={styles.exampleCode}>
                <code>{statsExampleCode[statsExampleTab]}</code>
              </div>
            </div>
          </div>

          {/* Redirect/Track API */}
          <div className={styles.apiCard}>
            <div className={styles.apiMethod}>
              <span className={styles.methodBadge}>GET</span>
              <code className={styles.apiEndpoint}>/s/{'{slug}'}</code>
            </div>
            <p className={styles.apiDescription}>Redirect to the original URL and track the click</p>

            <div className={styles.parametersTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Parameter</div>
                <div className={styles.tableCell}>Description</div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>slug</code>
                  <span className={styles.required}>required</span>
                </div>
                <div className={styles.tableCell}>
                  The slug of the short link (path parameter). Automatically tracks click analytics and redirects to the original URL.
                </div>
              </div>
            </div>

            <div className={styles.exampleBox}>
              <div className={styles.exampleHeader}>
                <div className={styles.exampleTabs}>
                  <button
                    className={`${styles.exampleTab} ${trackExampleTab === 'curl' ? styles.exampleTabActive : ''}`}
                    onClick={() => setTrackExampleTab('curl')}
                  >
                    cURL
                  </button>
                  <button
                    className={`${styles.exampleTab} ${trackExampleTab === 'js' ? styles.exampleTabActive : ''}`}
                    onClick={() => setTrackExampleTab('js')}
                  >
                    JavaScript
                  </button>
                </div>
                <button className={styles.exampleCopy} onClick={copyTrackExample}>
                  {trackExampleCopied ? '✓' : 'Copy'}
                </button>
              </div>
              <div className={styles.exampleCode}>
                <code>{trackExampleCode[trackExampleTab]}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}>

            </span>
            Features
          </h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Instant Shortening</h3>
              <p className={styles.featureDescription}>
                Create short links instantly at the edge
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Real-time Analytics</h3>
              <p className={styles.featureDescription}>
                Track clicks, referrers, and more in real-time
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="#F97316" d="M11 22v-6h2v2h8v2h-8v2h-2Zm-8-2v-2h6v2H3Zm3.425-6H8.5l1.1-3.075h4.825L15.5 14h2.075l-4.5-12h-2.15l-4.5 12ZM10.2 9.2l1.75-4.975h.1L13.8 9.2h-3.6Z" /></svg>
              </div>
              <h3 className={styles.featureTitle}>Custom Slugs</h3>
              <p className={styles.featureDescription}>
                Create branded, memorable short links
              </p>
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
