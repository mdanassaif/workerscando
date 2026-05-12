'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ToolStudio } from '@/components';
import { Project } from '@/types';
import layout from '@/styles/components/split-layout.module.css';
import styles from './doctomd.module.css';

const WORKER_URL = 'https://doctomd.brogee9o9.workers.dev';

const FORMAT_GROUPS = [
  { label: 'Documents', formats: ['PDF', 'DOCX', 'XLSX', 'XLS', 'ODS', 'ODT', 'CSV'] },
  { label: 'Images', formats: ['JPEG', 'PNG', 'WebP', 'SVG'] },
  { label: 'Web', formats: ['HTML', 'XML'] },
];

const ACCEPT = [
  '.pdf', '.docx', '.xlsx', '.xls', '.xlsm', '.xlsb', '.et',
  '.ods', '.odt', '.numbers', '.csv',
  '.jpeg', '.jpg', '.png', '.webp', '.svg',
  '.html', '.htm', '.xml',
].join(',');

interface ConvertResult {
  markdown: string;
  name: string;
  mimeType: string;
  elapsed: number;
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function DocToMDClient({ project }: { project: Project }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'raw' | 'preview'>('raw');

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch(WORKER_URL, { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `Worker returned ${res.status}`);
      setResult(data as ConvertResult);
      setView('raw');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const base = file?.name.replace(/\.[^.]+$/, '') ?? 'output';
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderPreview = (md: string) => {
    return md
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/^(?!<[hul])(.+)$/gm, (m) => m.trim() ? m : '')
      .replace(/^([^<\n].+)$/gm, '$1');
  };

  const fileSizeLabel = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ToolStudio>
      <div className={layout.wrapper}>

        {/* ── LEFT PANEL ── */}
        <aside className={layout.leftPanel}>
          <div className={layout.leftHeader}>
            <Link href="/projects" className={layout.backLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
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
              Drop any file and get clean Markdown back — powered by Workers AI <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'var(--muted)', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)' }}>AI.toMarkdown()</code>
            </p>
          </div>

          <div className={layout.leftBody}>
            {/* Drop zone */}
            <div
              className={`${styles.dropZone} ${dragging ? styles.dropZoneDragging : ''} ${file ? styles.dropZoneHasFile : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className={styles.hiddenInput}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {file ? (
                <div className={styles.fileChosen}>
                  <span className={styles.fileIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileMeta}>{fileSizeLabel(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.clearFile}
                    onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setError(null); }}
                    aria-label="Remove file"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className={styles.dropPrompt}>
                  <span className={styles.dropIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <span className={styles.dropTitle}>Drop a file or click to browse</span>
                  <span className={styles.dropSub}>PDF, Word, Excel, images, HTML, CSV…</span>
                </div>
              )}
            </div>

            <button
              className={layout.primaryBtn}
              onClick={convert}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinnerInline} />
                  Converting…
                </>
              ) : 'Convert to Markdown'}
            </button>

            {/* Supported formats */}
            <div className={layout.toolSection}>
              <h3 className={layout.toolSectionTitle}>Supported formats</h3>
              <div className={styles.formatGroups}>
                {FORMAT_GROUPS.map(group => (
                  <div key={group.label} className={styles.formatGroup}>
                    <span className={styles.formatGroupLabel}>{group.label}</span>
                    <div className={styles.formatChips}>
                      {group.formats.map(f => (
                        <span key={f} className={styles.formatChip}>{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className={layout.toolSection}>
              <h3 className={layout.toolSectionTitle}>How it works</h3>
              <div className={layout.apiDocBox} style={{ fontSize: 12, lineHeight: 1.6 }}>
                <span style={{ color: 'var(--muted-foreground)' }}>// Cloudflare Worker</span>{'\n'}
                {'const result = await env.AI.toMarkdown(file);\n'}
                {'return Response.json({ markdown: result[0].data });'}
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className={layout.rightPanel}>
          <header className={layout.rightHeader}>
            <span>Markdown Output</span>
            {result && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  className={`${styles.viewToggle} ${view === 'raw' ? styles.viewToggleOn : ''}`}
                  onClick={() => setView('raw')}
                >Raw</button>
                <button
                  type="button"
                  className={`${styles.viewToggle} ${view === 'preview' ? styles.viewToggleOn : ''}`}
                  onClick={() => setView('preview')}
                >Preview</button>
              </div>
            )}
          </header>

          <div className={layout.rightBody}>
            {error && <div className={layout.errorBanner}>{error}</div>}

            {/* Empty state */}
            {!result && !loading && !error && (
              <div className={layout.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="12" y2="17" />
                </svg>
                <div className={layout.emptyTitle}>Drop a file to convert</div>
                <div className={layout.emptyText}>
                  Your Markdown will appear here — ready to copy or download as a <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>.md</code> file.
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className={layout.emptyState}>
                <div className={styles.spinner} />
                <div className={layout.emptyTitle} style={{ marginTop: 16 }}>Converting…</div>
                <div className={layout.emptyText}>Workers AI is reading your file and generating Markdown.</div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={styles.resultWrap}>
                {/* Stats bar */}
                <div className={styles.statsRow}>
                  <div className={styles.statPill}>
                    <span className={styles.statPillLabel}>Words</span>
                    <span className={styles.statPillVal}>{wordCount(result.markdown).toLocaleString()}</span>
                  </div>
                  <div className={styles.statPill}>
                    <span className={styles.statPillLabel}>Characters</span>
                    <span className={styles.statPillVal}>{result.markdown.length.toLocaleString()}</span>
                  </div>
                  <div className={styles.statPill}>
                    <span className={styles.statPillLabel}>Time</span>
                    <span className={styles.statPillVal}>{result.elapsed}ms</span>
                  </div>
                  <div className={styles.statPillActions}>
                    <button type="button" className={styles.actionBtn} onClick={copyMarkdown}>
                      {copied ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                    <button type="button" className={styles.actionBtn} onClick={downloadMarkdown}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download .md
                    </button>
                  </div>
                </div>

                {/* Raw markdown */}
                {view === 'raw' && (
                  <div className={styles.mdOutput}>
                    <pre className={styles.mdPre}>{result.markdown}</pre>
                  </div>
                )}

                {/* Rendered preview */}
                {view === 'preview' && (
                  <div
                    className={styles.mdPreview}
                    dangerouslySetInnerHTML={{ __html: renderPreview(result.markdown) }}
                  />
                )}
              </div>
            )}
          </div>
        </main>

      </div>
    </ToolStudio>
  );
}
