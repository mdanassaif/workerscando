'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import { API } from '@/lib/api';
import styles from './url-metadata.module.css';

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
  const [showFullImage, setShowFullImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exampleTab, setExampleTab] = useState<'html' | 'curl' | 'js'>('curl');
  const [exampleCopied, setExampleCopied] = useState(false);

  const exampleCode = {
    html: `<meta property="og:url" content="https://workerscando.com/api/metadata?url=https://example.com" />`,
    curl: `curl "https://workerscando.com/api/metadata?url=https://example.com"`,
    js: `fetch('https://workerscando.com/api/metadata?url=' + encodeURIComponent('https://example.com'))
  .then(res => res.json())
  .then(data => console.log(data));`
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
      // Add https:// protocol if URL doesn't have a protocol
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
            Extract Open Graph data, Twitter cards, favicons, and more from any URL. Perfect for link previews.
          </p>
        </div>
      </section>

      <section className={styles.demoSection}>
        <div className={styles.container}>
          <div className={styles.demoCard}>
            <h2 className={styles.demoTitle}>Try it out</h2>

            <div className={styles.inputGroup}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className={styles.urlInput}
                onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
              />
              <button
                onClick={handleExtract}
                disabled={loading}
                className={styles.extractButton}
              >
                {loading ? 'Extracting...' : 'Extract'}
              </button>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {response && (
              <>
                {/* Link Preview Card */}
                <div className={styles.previewCard}>
                  {response.image || response.openGraph?.image ? (
                    <div className={styles.previewImageWrapper}>
                      <img
                        src={response.openGraph?.image || response.image}
                        alt={response.title || 'Preview'}
                        className={`${styles.previewImage} ${showFullImage ? styles.previewImageFull : styles.previewImageCropped}`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <button
                        onClick={() => setShowFullImage(!showFullImage)}
                        className={styles.imageToggle}
                        title={showFullImage ? 'Show cropped preview' : 'Show full image'}
                      >
                        {showFullImage ? (
                          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 717 717">
                            <path fill="currentColor" d="M591 526h126v65H591v126h-66V591H126V192H0v-66h126V0h65v126h374l74-73l35 35l-83 83v355zm-400-26l309-308H191v308zm334-263L237 526h288V237z" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 666 680">
                            <path fill="currentColor" d="m338 272l70 69c4 4 8 6 14 6c5 0 9-2 13-6l119-118l72 72c23 22 40 13 40-18V51c0-19-16-37-38-37H402c-32 0-40 17-17 40l72 72l-119 118c-3 4-5 9-5 14c0 6 2 10 5 14zM0 416v227c0 19 16 37 38 37h225c32 0 41-17 18-40l-72-72l119-119c3-4 5-8 5-14c0-5-2-9-5-13l-70-70c-4-3-8-5-14-5c-5 0-10 2-14 5L112 471l-72-72c-23-22-40-14-40 17z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ) : null}
                  <div className={styles.previewContent}>
                    <div className={styles.previewHeader}>
                      {(response.favicon || response.favicons?.icon) && (
                        <img
                          src={response.favicons?.icon || response.favicon}
                          alt=""
                          className={styles.previewFavicon}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className={styles.previewSite}>
                        {response.openGraph?.siteName || response.siteName || new URL(response.url).hostname}
                      </span>
                    </div>
                    <h3 className={styles.previewTitle}>
                      {response.openGraph?.title || response.title || 'No title'}
                    </h3>
                    <p className={styles.previewDescription}>
                      {response.openGraph?.description || response.description || 'No description available'}
                    </p>
                  </div>
                </div>

                {/* JSON Response */}
                <div className={styles.responseContainer}>
                  <div className={styles.responseHeader}>
                    <span className={styles.responseLabel}>Response</span>
                    <button onClick={handleCopy} className={styles.copyButton}>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className={styles.responseContent}>
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {!response && !error && (
              <div className={styles.placeholder}>
                {'// Enter a URL and click Extract'}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.apiSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>API Reference</h2>

          <div className={styles.apiCard}>
            <div className={styles.apiMethod}>
              <span className={styles.methodBadge}>GET</span>
              <code className={styles.apiEndpoint}>/api/metadata?url={'{url}'}</code>
            </div>

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
                  The URL to extract metadata from (must be URL-encoded)
                </div>
              </div>
            </div>

            {/* Example Usage - simplified */}
            <div className={styles.exampleBox}>
              <div className={styles.exampleHeader}>
                <div className={styles.exampleTabs}>
                  <button
                    className={`${styles.exampleTab} ${exampleTab === 'curl' ? styles.exampleTabActive : ''}`}
                    onClick={() => setExampleTab('curl')}
                  >
                    cURL
                  </button>
                  <button
                    className={`${styles.exampleTab} ${exampleTab === 'js' ? styles.exampleTabActive : ''}`}
                    onClick={() => setExampleTab('js')}
                  >
                    JavaScript
                  </button>
                  <button
                    className={`${styles.exampleTab} ${exampleTab === 'html' ? styles.exampleTabActive : ''}`}
                    onClick={() => setExampleTab('html')}
                  >
                    HTML
                  </button>
                </div>
                <button className={styles.exampleCopy} onClick={copyExample}>
                  {exampleCopied ? '✓' : 'Copy'}
                </button>
              </div>
              <div className={styles.exampleCode}>
                <code>{exampleCode[exampleTab]}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                  <path fill="#F97316" fillRule="evenodd" d="M3.75 4c-.23 0-.35 0-.45.01c-.67.09-1.2.62-1.29 1.29c-.01.1-.01.21-.01.45v2.5c0 .23 0 .35.01.45c.09.67.62 1.2 1.29 1.29c.1.01.21.01.45.01s.35 0 .45-.01c.67-.09 1.2-.62 1.29-1.29c.01-.1.01-.21.01-.45v-2.5c0-.23 0-.35-.01-.45c-.09-.67-.62-1.2-1.29-1.29C4.1 4 3.99 4 3.75 4m.32 1c.22.03.4.21.43.43v3.14a.51.51 0 0 1-.43.43h-.64A.51.51 0 0 1 3 8.57V5.43c.03-.22.21-.4.43-.43zm4.38 2.01c.25.04.45.14.6.27c.08-.16.25-.28.45-.28c.28 0 .5.22.5.5v3c0 .83-.67 1.5-1.5 1.5H7c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.5c.28 0 .5-.22.5-.5v-.74c-.15.11-.33.19-.55.23c-.03.01-.38.02-.7.02c-.24 0-.35 0-.45-.02c-.54-.09-.96-.51-1.04-1.04c-.02-.1-.02-.21-.02-.45s0-.35.02-.45c.09-.54.51-.96 1.04-1.04c.1-.02.22-.02.45-.02c.245 0 .507.012.631.017zM8.5 8H7.45c-.1.01-.18.1-.2.2v.6c.01.1.1.18.2.2H8.5c.38 0 .5-.09.5-.5S8.88 8 8.5 8m4.5-.72a1.2 1.2 0 0 0-.6-.27l-.07-.003a15 15 0 0 0-.63-.017c-.23 0-.35 0-.45.02c-.53.08-.95.5-1.04 1.04c-.02.1-.02.21-.02.45s0 .35.02.45c.08.53.5.95 1.04 1.04c.1.02.21.02.45.02c.32 0 .67-.01.7-.02c.22-.04.4-.12.55-.23v.74c0 .28-.22.5-.5.5h-1.5c-.28 0-.5.22-.5.5s.22.5.5.5h1.5c.83 0 1.5-.67 1.5-1.5v-3c0-.28-.22-.5-.5-.5c-.2 0-.37.12-.45.28m-.55.72c.38 0 .5.09.5.5s-.12.5-.5.5H11.4c-.1-.02-.19-.1-.2-.2v-.6c.02-.1.1-.19.2-.2z" clipRule="evenodd" />
                  <path fill="#F97316" d="M5 11.5c0-.28-.22-.5-.5-.5H3c-.28 0-.5.22-.5.5s.22.5.5.5h1.5c.28 0 .5-.22.5-.5" />
                  <path fill="#F97316" fillRule="evenodd" d="M.22 3.09C0 3.52 0 4.08 0 5.2v5.6c0 1.12 0 1.68.22 2.11c.19.38.5.68.87.87c.43.22.99.22 2.11.22h9.6c1.12 0 1.68 0 2.11-.22c.38-.19.68-.5.87-.87c.22-.43.22-.99.22-2.11V5.2c0-1.12 0-1.68-.22-2.11c-.19-.38-.5-.68-.87-.87C14.48 2 13.92 2 12.8 2H3.2c-1.12 0-1.68 0-2.11.22c-.38.19-.68.5-.87.87M12.82 3h-9.6c-.58 0-.95 0-1.23.02c-.27.02-.37.06-.42.09c-.19.1-.34.25-.44.44c-.03.05-.06.15-.09.42c-.02.28-.02.66-.02 1.23v5.6c0 .58 0 .95.02 1.23c.02.27.06.37.09.42c.1.19.25.34.44.44c.05.03.15.06.42.09c.28.02.66.02 1.23.02h9.6c.58 0 .95 0 1.23-.02c.27-.02.37-.06.42-.09c.19-.1.34-.25.44-.44c.03-.05.06-.15.09-.42c.02-.28.02-.66.02-1.23V5.2c0-.58 0-.95-.02-1.23c-.02-.27-.06-.37-.09-.42c-.1-.19-.25-.34-.44-.44c-.05-.03-.15-.06-.42-.09C13.77 3 13.39 3 12.82 3" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Open Graph</h3>
              <p className={styles.featureDescription}>
                Title, description, image, type, and more
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="#F97316" d="M22 5h1v1h-1zm0-2h1v1h-1zm-1 2v1h1v1h-1v5h-1v2h-1v2h-1v1h-1v1h-1v1h-2v1h-3v1H4v-1H2v-1H1v-1h2v1h3v-1h1v-1H5v-1H4v-1H3v-1h2v-1H3v-1H2v-2h2V9H3V8H2V4h1v1h1v1h1v1h2v1h3v1h2V5h1V4h1V3h5v1h3v1z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Twitter Cards</h3>
              <p className={styles.featureDescription}>
                Card type, creator, site handle
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                  <g fill="none" stroke="#F97316" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                    <path d="M2 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zm4 2v4" />
                    <path d="M11 10a2 2 0 1 0 0 4m3-2a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
                  </g>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Favicons</h3>
              <p className={styles.featureDescription}>
                Site icons and apple-touch-icons
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
