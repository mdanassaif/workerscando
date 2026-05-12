"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components';
import styles from '@/styles/pages/docs.module.css';

const W = {
  SHORTENER:  'https://urlshortener.brogee9o9.workers.dev',
  METADATA:   'https://url-metadata-api.brogee9o9.workers.dev',
  OG:         'https://og-image-generator.brogee9o9.workers.dev',
  DEAD:       'https://dead-man-switch.brogee9o9.workers.dev',
  REDIRECT:   'https://redirect-chain.brogee9o9.workers.dev',
  THROTTLE:   'https://apithrottle.workerscando.workers.dev',
  WEBDIGEST:  'https://webdigest.brogee9o9.workers.dev',
  DOCTOMD:    'https://doctomd.brogee9o9.workers.dev',
};

function Badge({ method }: { method: 'GET' | 'POST' | 'DELETE' }) {
  return <span className={`${styles.methodBadge} ${styles['method' + method]}`}>{method}</span>;
}

function CodeBlock({ label, children }: { label?: string; children: string }) {
  return (
    <div className={styles.codeBlock}>
      {label && <div className={styles.codeLabel}>{label}</div>}
      <pre>{children.trim()}</pre>
    </div>
  );
}

function EndpointRow({ method, path }: { method: 'GET' | 'POST' | 'DELETE'; path: string }) {
  return (
    <div className={styles.endpointRow}>
      <Badge method={method} />
      <code className={styles.endpointPath}>{path}</code>
    </div>
  );
}

function ParamTable({ rows }: { rows: [string, string, string?][] }) {
  return (
    <div className={styles.paramTable}>
      {rows.map(([name, desc, required]) => (
        <div key={name} className={styles.paramRow}>
          <div className={styles.paramName}>
            <code>{name}</code>
            {required === 'required' && <span className={styles.required}>required</span>}
          </div>
          <div className={styles.paramDesc}>{desc}</div>
        </div>
      ))}
    </div>
  );
}

interface Section { id: string; title: string; group: string; content: React.ReactNode }

const sections: Section[] = [
  {
    id: 'getting-started', title: 'Quick start', group: 'Guide',
    content: (
      <div>
        <h2 className={styles.sectionTitle}>Quick start</h2>
        <p className={styles.lead}>Nine tools, all public. No API keys. CORS open on every endpoint.</p>
        <CodeBlock label="All Worker base URLs">{`
# Day 1 — URL Shortener
${W.SHORTENER}/api/shorten

# Day 2 — Dead Man's Switch
${W.DEAD}/api/create

# Day 3 — OG Image Generator
${W.OG}/api/og?title={title}

# Day 4 — HireWire contact form
https://hire-wire.brogee9o9.workers.dev/register

# Day 5 — URL Metadata
${W.METADATA}/api/metadata?url={url}

# Day 6 — Redirect Chain Tracer
${W.REDIRECT}/api/trace?url={url}

# Day 7 — API Throttle
${W.THROTTLE}/api/check

# Day 8 — Web Digest
${W.WEBDIGEST}

# Day 9 — DocToMD
${W.DOCTOMD}
        `}</CodeBlock>
        <CodeBlock label="Quick example — convert a file to Markdown">{`
const form = new FormData();
form.append('file', fileInput.files[0]);

const { markdown } = await fetch('${W.DOCTOMD}', {
  method: 'POST',
  body: form,
}).then(r => r.json());
        `}</CodeBlock>
      </div>
    ),
  },
  {
    id: 'url-metadata-api', title: 'URL Metadata', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>URL Metadata</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>Extracts title, description, OG tags, Twitter cards, and favicon from any URL.</p>
        <EndpointRow method="GET" path={`${W.METADATA}/api/metadata?url={url}`} />
        <ParamTable rows={[['url', 'URL to fetch metadata from (URL-encoded)', 'required']]} />
        <CodeBlock label="JavaScript">{`
const meta = await fetch(
  '${W.METADATA}/api/metadata?url=' + encodeURIComponent('https://github.com')
).then(r => r.json());
        `}</CodeBlock>
        <CodeBlock label="Response">{`
{
  "success": true,
  "title": "GitHub",
  "description": "Where the world builds software",
  "favicon": "https://github.com/favicon.ico",
  "openGraph": {
    "image": "https://github.githubassets.com/images/og-image.png",
    "type": "website"
  }
}
        `}</CodeBlock>
        <Link href="/projects/url-metadata-api" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'og-image-generator', title: 'OG Images', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>OG Image Generator</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>Returns a dynamic SVG image. Drop it straight into a meta tag.</p>
        <EndpointRow method="GET" path={`${W.OG}/api/og`} />
        <ParamTable rows={[
          ['title',    'Main heading text', 'required'],
          ['subtitle', 'Secondary line below title'],
          ['author',   'Author name'],
          ['domain',   'Domain shown in footer'],
          ['theme',    'midnight · sunset · ocean · forest · minimal · rose'],
          ['layout',   'standard · centered · split · minimal · bold'],
          ['emoji',    'Decorative emoji'],
        ]} />
        <CodeBlock label="HTML meta tag">{`
<meta property="og:image"
  content="${W.OG}/api/og?title=My+Post&theme=midnight&layout=bold" />
        `}</CodeBlock>
        <Link href="/projects/dynamic-og-images" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'url-shortener', title: 'URL Shortener', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>URL Shortener</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>Create short links, track clicks, redirect visitors.</p>

        <h3 className={styles.h3}>Create a link</h3>
        <EndpointRow method="POST" path={`${W.SHORTENER}/api/shorten`} />
        <ParamTable rows={[
          ['url',  'URL to shorten', 'required'],
          ['slug', 'Custom slug (optional)'],
        ]} />
        <CodeBlock label="Response">{`{ "slug": "abc123", "shortUrl": "https://workerscando.com/s/abc123" }`}</CodeBlock>

        <h3 className={styles.h3}>Analytics</h3>
        <EndpointRow method="GET" path={`${W.SHORTENER}/api/stats/{slug}`} />
        <CodeBlock label="Response">{`
{
  "total_clicks": 42,
  "last_24h": 15,
  "countries": { "US": 20, "UK": 12 },
  "devices": { "Mobile": 25, "Desktop": 17 }
}
        `}</CodeBlock>

        <h3 className={styles.h3}>Redirect</h3>
        <EndpointRow method="GET" path={`${W.SHORTENER}/{slug}`} />
        <p className={styles.note}>Returns 302 and increments the click counter.</p>

        <Link href="/projects/url-shortener" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'hire-wire', title: 'HireWire', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>HireWire</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>Embeddable "hire me" form. Submissions go straight to your Discord via webhook — no backend.</p>

        <h3 className={styles.h3}>Register</h3>
        <EndpointRow method="POST" path="https://hire-wire.brogee9o9.workers.dev/register" />
        <ParamTable rows={[
          ['name',       'Project name'],
          ['webhookUrl', 'Discord webhook URL'],
        ]} />
        <CodeBlock label="Response">{`
{
  "userId": "abc123",
  "scriptUrl": "https://hire-wire.brogee9o9.workers.dev/widget.js?id=abc123"
}
        `}</CodeBlock>

        <h3 className={styles.h3}>Embed</h3>
        <CodeBlock label="HTML">{`<script src="https://hire-wire.brogee9o9.workers.dev/widget.js?id=YOUR_ID"></script>`}</CodeBlock>
        <p className={styles.note}>Exposes <code className={styles.inlineCode}>window.HireWire.send(email, message)</code>.</p>

        <h3 className={styles.h3}>Send message</h3>
        <EndpointRow method="POST" path="https://hire-wire.brogee9o9.workers.dev/send?id={userId}" />
        <ParamTable rows={[
          ['email',   "Sender's email"],
          ['message', 'Message body'],
        ]} />

        <Link href="/projects/hire-wire" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'dead-man-switch', title: 'Dead Switch', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>Dead Man&apos;s Switch</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>
          Periodically sends check-in emails. If you stop checking in, an encrypted secret is delivered to a recipient.
          Secrets are encrypted in the browser (AES-256-GCM) — the worker never sees plaintext.
        </p>

        <h3 className={styles.h3}>Create a switch</h3>
        <EndpointRow method="POST" path={`${W.DEAD}/api/create`} />
        <ParamTable rows={[
          ['encryptedSecret', 'Base64 AES-256-GCM encrypted payload', 'required'],
          ['ownerEmail',      'Your email for check-in reminders', 'required'],
          ['recipientEmail',  "Recipient's email if triggered", 'required'],
          ['checkInterval',   'Minutes between check-ins'],
        ]} />

        <h3 className={styles.h3}>Other endpoints</h3>
        <div className={styles.endpointList}>
          <EndpointRow method="POST" path="/api/verify/:token" />
          <EndpointRow method="GET"  path="/api/check/:id" />
          <EndpointRow method="GET"  path="/api/decrypt/:id" />
        </div>
        <p className={styles.note}>
          Scheduling uses <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>cron-job.org</a> (free tier). Cron endpoint is gated with <code className={styles.inlineCode}>CRON_SECRET</code>.
        </p>

        <Link href="/projects/dead-man-switch" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'apithrottle', title: 'APIThrottle', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>APIThrottle</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>
          Edge proxy that scores requests by timing patterns, classifies traffic (trusted / normal / bot),
          and applies adaptive rate limits.
        </p>

        <h3 className={styles.h3}>Scoring signals</h3>
        <ParamTable rows={[
          ['< 300ms between requests', 'Score drops — bot-like'],
          ['1–3s between requests',    'Score rises — human-like'],
          ['Consistent timing',        'Flagged as automated'],
        ]} />

        <h3 className={styles.h3}>Classifications</h3>
        <ParamTable rows={[
          ['Trusted (65–100)', '90 req/window'],
          ['Normal (35–64)',   '60 req/window'],
          ['Bot (0–34)',       '10 req/window'],
        ]} />

        <CodeBlock label="Response headers">{`
x-throttle-status: allow | soft | block
x-throttle-score: 72
x-throttle-classification: trusted
x-throttle-remaining: 18
        `}</CodeBlock>

        <Link href="/projects/apithrottle" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'redirect-chain-tracer', title: 'Redirect Tracer', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>Redirect Chain Tracer</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>Follows every redirect hop from a URL — up to 20 deep. Reports status codes, per-hop latency, protocol downgrades, and added/removed query params.</p>
        <EndpointRow method="GET" path={`${W.REDIRECT}/api/trace?url={url}`} />
        <ParamTable rows={[['url', 'Starting URL to trace (URL-encoded)', 'required']]} />
        <CodeBlock label="Response">{`
{
  "originalUrl": "https://bit.ly/example",
  "finalUrl": "https://example.com/page",
  "totalHops": 3,
  "totalTime": "245ms",
  "chain": [
    { "hop": 1, "url": "https://bit.ly/example", "status": 301, "latency": "42ms" },
    { "hop": 2, "url": "https://t.co/redirect",  "status": 302, "latency": "89ms" },
    { "hop": 3, "url": "https://example.com/page","status": 200, "latency": "114ms" }
  ],
  "warnings": ["Protocol downgrade at hop 2"]
}
        `}</CodeBlock>
        <Link href="/projects/redirect-chain-tracer" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'web-digest', title: 'Web Digest', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>Web Digest</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>Pass any public URL and get back an AI-generated summary and bullet-point takeaways. Uses BART for summarization and Llama 3 for key points — both running on Workers AI.</p>
        <EndpointRow method="POST" path={W.WEBDIGEST} />
        <ParamTable rows={[
          ['url',   'Public webpage URL to summarize', 'required'],
          ['brief', 'Set true for a shorter summary (default false)'],
        ]} />
        <CodeBlock label="JavaScript">{`
const { summary, takeaways } = await fetch('${W.WEBDIGEST}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://blog.cloudflare.com/agents-week-in-review/' }),
}).then(r => r.json());
        `}</CodeBlock>
        <CodeBlock label="Response">{`
{
  "url": "https://blog.cloudflare.com/agents-week-in-review/",
  "summary": "Cloudflare's Agents Week introduced sandboxes, Durable Object facets...",
  "takeaways": "- Sandboxes give AI agents persistent, isolated environments\\n- Workflows v2 supports 50,000 concurrent runs\\n- Voice Pipeline adds real-time voice in ~30 lines"
}
        `}</CodeBlock>
        <p className={styles.note}>Pages with paywalls or heavy JavaScript may not extract well. Works best on article and blog pages.</p>
        <Link href="/projects/webdigest" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'doctomd', title: 'DocToMD', group: 'Workers',
    content: (
      <div>
        <div className={styles.titleRow}>
          <h2 className={styles.sectionTitle}>DocToMD</h2>
          <span className={styles.liveBadge}>Live</span>
        </div>
        <p className={styles.lead}>
          Upload any file and get clean Markdown back. Powered by <code className={styles.inlineCode}>env.AI.toMarkdown()</code> — a native Workers AI binding that handles the conversion entirely on the edge.
        </p>

        <h3 className={styles.h3}>Supported formats</h3>
        <ParamTable rows={[
          ['PDF',           'Full text extraction including metadata'],
          ['DOCX',          'Word documents with headings and tables'],
          ['XLSX / XLS',    'Spreadsheets converted to Markdown tables'],
          ['ODS / ODT',     'OpenDocument Spreadsheet and Text'],
          ['CSV',           'Tabular data as a Markdown table'],
          ['HTML / XML',    'Markup stripped to clean Markdown'],
          ['JPEG / PNG / WebP / SVG', 'Images described via Workers AI vision models'],
        ]} />

        <h3 className={styles.h3}>Convert a file</h3>
        <EndpointRow method="POST" path={W.DOCTOMD} />
        <ParamTable rows={[
          ['file', 'File to convert, sent as multipart/form-data', 'required'],
        ]} />
        <CodeBlock label="JavaScript — browser">{`
const form = new FormData();
form.append('file', document.querySelector('input[type=file]').files[0]);

const { markdown, mimeType, elapsed } = await fetch('${W.DOCTOMD}', {
  method: 'POST',
  body: form,
}).then(r => r.json());

console.log(\`Converted in \${elapsed}ms\`);
        `}</CodeBlock>
        <CodeBlock label="curl">{`
curl -X POST ${W.DOCTOMD} \\
  -F "file=@report.pdf"
        `}</CodeBlock>
        <CodeBlock label="Response">{`
{
  "markdown": "# Report\\n\\n## Summary\\n\\nThis quarter...",
  "name": "report.pdf",
  "mimeType": "application/pdf",
  "elapsed": 512
}
        `}</CodeBlock>
        <CodeBlock label="Error response">{`
{
  "error": "File too large. Maximum size is 10 MB"
}
        `}</CodeBlock>
        <p className={styles.note}>Max file size is 10 MB. Image conversion uses Workers AI vision models and may take 2–5s depending on complexity.</p>
        <Link href="/projects/doctomd" className={styles.tryLink}>Try the tool →</Link>
      </div>
    ),
  },
  {
    id: 'contributing', title: 'Contribute', group: 'More',
    content: (
      <div>
        <h2 className={styles.sectionTitle}>Contribute</h2>
        <p className={styles.lead}>
          PRs and ideas welcome on{' '}
          <a href="https://github.com/mdanassaif/workerscando" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
            github.com/mdanassaif/workerscando
          </a>.
        </p>
        <p className={styles.lead}>
          Prefer small, focused tools — one job, no auth, free to use. Follow along at{' '}
          <a href="https://x.com/mdanassaif" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
            @mdanassaif
          </a>.
        </p>
      </div>
    ),
  },
];

const GROUPS = ['Guide', 'Workers', 'More'];

export default function DocsClient() {
  const [active, setActive] = useState('getting-started');
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSection = sections.find(s => s.id === active);

  return (
    <div className={styles.page}>
      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Docs</h1>
          <p className={styles.heroSub}>Worker endpoints and examples — no keys required.</p>
        </div>
      </header>

      <div className={styles.layout}>

        {/* Mobile toggle */}
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(o => !o)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          {activeSection?.title ?? 'Menu'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mobileOpen ? styles.chevronUp : styles.chevronDown}>
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>

        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
          <nav>
            {GROUPS.map(group => {
              const items = sections.filter(s => s.group === group);
              return (
                <div key={group} className={styles.navGroup}>
                  <span className={styles.navGroupLabel}>{group}</span>
                  {items.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setActive(s.id); setMobileOpen(false); }}
                      className={`${styles.navItem} ${active === s.id ? styles.navItemActive : ''}`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className={styles.content}>
          <article className={styles.article}>
            {activeSection?.content}
          </article>
        </main>

      </div>
    </div>
  );
}
