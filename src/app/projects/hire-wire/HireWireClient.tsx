'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import styles from './hire-wire.module.css';

interface HireWireClientProps {
  project: Project;
}

export default function HireWireClient({ project }: HireWireClientProps) {
  const [name, setName] = useState('');
  const [webhook, setWebhook] = useState('');
  const [loading, setLoading] = useState(false);
  interface Result {
    userId: string;
    scriptUrl: string;
    // Add other properties returned by your API if needed
  }
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'tsx' | 'jsx' | 'html'>('tsx');
  const [copied, setCopied] = useState(false);

  const WORKER_URL = 'https://hire-wire.brogee9o9.workers.dev';

  const handleGenerate = async () => {
    if (!webhook.includes('discord.com')) {
      setError('Please enter a valid Discord Webhook URL');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${WORKER_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, webhookUrl: webhook })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Failed to generate widget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- CODE SNIPPETS ---
  const tsxSnippet = result ? `// 📋 components/ContactForm.tsx
'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // 👇 Your Unique API Endpoint
      await fetch('${WORKER_URL}/send?id=${result.userId}', {
        method: 'POST',
        body: JSON.stringify({ email, message: msg })
      });
      setStatus('success');
      setSent(true);
      setEmail('');
      setMsg('');
      setTimeout(() => {
        setStatus('idle');
        setSent(false);
      }, 2000);
    } catch (err) {
      alert('Failed to send');
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-white">
      <h2 className="text-xl font-bold">Hire Me</h2>
      <input 
        type="email" 
        placeholder="Email"
        required
        className="w-full p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'sending' || sent}
      />
      <textarea 
        placeholder="Message"
        required
        className="w-full p-2 border rounded"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        disabled={status === 'sending' || sent}
      />
      <button 
        type="submit" 
        disabled={status === 'sending' || sent}
        className="w-full bg-black text-white p-3 rounded font-bold"
      >
        {status === 'sending' ? 'Sending...' : sent ? 'Sent!' : 'Send Message'}
      </button>
      {sent && (
        <div style={{ color: '#16a34a', marginTop: 8, fontWeight: 500 }}>Message sent! You can send another in a moment.</div>
      )}
    </form>
  );
}` : '';

  const jsxSnippet = result ? `// 📋 components/ContactForm.jsx
import { useState } from 'react';

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('idle');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await fetch('${WORKER_URL}/send?id=${result.userId}', {
        method: 'POST',
        body: JSON.stringify({ email, message: msg })
      });
      setStatus('success');
      setSent(true);
      setEmail('');
      setMsg('');
      setTimeout(() => {
        setStatus('idle');
        setSent(false);
      }, 2000);
    } catch (err) {
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ddd' }}>
      <h2>Hire Me</h2>
      <input 
        type="email" 
        placeholder="Email"
        required
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'sending' || sent}
      />
      <textarea 
        placeholder="Message"
        required
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        disabled={status === 'sending' || sent}
      />
      <button type="submit" style={{ padding: '10px 20px', background: 'black', color: 'white' }} disabled={status === 'sending' || sent}>
        {status === 'sending' ? 'Sending...' : sent ? 'Sent!' : 'Send Message'}
      </button>
      {sent && (
        <div style={{ color: '#16a34a', marginTop: 8, fontWeight: 500 }}>Message sent! You can send another in a moment.</div>
      )}
    </form>
  );
}` : '';

  const htmlSnippet = result ? `<script src="${result.scriptUrl}"></script>

<div class="contact-card">
  <h2>Hire Me</h2>
  <input type="email" id="email" placeholder="Email">
  <textarea id="msg" placeholder="Message"></textarea>
  <button id="sendBtn" onclick="sendHire()">Send</button>
  <div id="sentMsg" style="display:none;color:#16a34a;margin-top:8px;font-weight:500;">Message sent! You can send another in a moment.</div>
</div>

<script>
  let sending = false;
  async function sendHire() {
    if (sending) return;
    sending = true;
    const email = document.getElementById('email').value;
    const msg = document.getElementById('msg').value;
    const btn = document.getElementById('sendBtn');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    // The Magic Line ⚡
    const res = await HireWire.send(email, msg);
    if(res.sent) {
      btn.textContent = 'Sent!';
      document.getElementById('sentMsg').style.display = 'block';
      setTimeout(() => {
        btn.textContent = 'Send';
        btn.disabled = false;
        document.getElementById('sentMsg').style.display = 'none';
        sending = false;
      }, 2000);
    } else {
      btn.textContent = 'Send';
      btn.disabled = false;
      sending = false;
    }
  }
</script>` : '';

  const getCode = () => {
    if (tab === 'tsx') return tsxSnippet;
    if (tab === 'jsx') return jsxSnippet;
    return htmlSnippet;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.badgesContainer}>
            <span className={styles.dayBadge}>Day {project.day}</span>
           
          </div>

          <h1 className={styles.title}>{project.name}</h1>

          <p className={styles.description}>
            A backend-as-a-service for your portfolio. Create a fully functional contact form that sends messages directly to Discord. Zero server setup required.
          </p>
        </div>
      </section>

      <section className={styles.demoSection}>
        <div className={styles.container}>
          <div className={styles.demoCard}>
            <h2 className={styles.demoTitle}>Create your Widget</h2>

            {!result ? (
              // --- INPUT FORM ---
              <>
                <div className={styles.inputGroup} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Project Name (e.g. My Portfolio)"
                    className={styles.urlInput}
                    style={{ marginBottom: '12px' }}
                  />
                  <input
                    type="password"
                    value={webhook}
                    onChange={(e) => setWebhook(e.target.value)}
                    placeholder="Discord Webhook URL"
                    className={styles.urlInput}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={styles.extractButton}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  {loading ? 'Generating...' : 'Get Integration Code 🚀'}
                </button>
              </>
            ) : (
              // --- RESULT AREA (Matches your "Response" styling) ---
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #E5E5E5' }}>
                  <button onClick={() => setTab('tsx')} className={`${styles.tabButton} ${tab === 'tsx' ? styles.tabButtonActive : ''}`}>React (TSX)</button>
                  <button onClick={() => setTab('jsx')} className={`${styles.tabButton} ${tab === 'jsx' ? styles.tabButtonActive : ''}`}>React (JSX)</button>
                  <button onClick={() => setTab('html')} className={`${styles.tabButton} ${tab === 'html' ? styles.tabButtonActive : ''}`}>HTML</button>
                </div>

                <div className={styles.responseContainer}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #E5E5E5' }}>
                    <button onClick={() => setTab('tsx')} className={`${styles.tabButton} ${tab === 'tsx' ? styles.tabButtonActive : ''}`}>React (TSX)</button>
                    <button onClick={() => setTab('jsx')} className={`${styles.tabButton} ${tab === 'jsx' ? styles.tabButtonActive : ''}`}>React (JSX)</button>
                    <button onClick={() => setTab('html')} className={`${styles.tabButton} ${tab === 'html' ? styles.tabButtonActive : ''}`}>HTML</button>
                  </div>
                  {tab === 'tsx' && (
                    <div>
                      <div className={styles.responseHeader}>
                        <span className={styles.responseLabel}>TSX Component</span>
                        <button onClick={() => {navigator.clipboard.writeText(tsxSnippet); setCopied(true); setTimeout(() => setCopied(false), 2000);}} className={styles.copyButton}>
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className={styles.responseContent} style={{ maxHeight: 180, overflow: 'auto', fontSize: 13, background: 'transparent', borderRadius: 0, padding: '16px 0 16px 16px', border: 'none' }}>
                        {tsxSnippet}
                      </pre>
                      <div style={{ margin: '8px 0', fontSize: 12, color: '#888', paddingLeft: 12, paddingTop: 8, borderLeft: '3px solid #F97316', background: 'transparent', lineHeight: 1.7 }}>
                        <span style={{ fontWeight: 500 }}>Usage:</span> Place <code>ContactForm</code> in any page or component.<br />
                        <span style={{ color: '#F97316', fontWeight: 500 }}>Example:</span> <code style={{ background: 'none', color: '#18181B' }}>{'<ContactForm />'}</code> in your portfolio/contact page.
                      </div>
                    </div>
                  )}
                  {tab === 'jsx' && (
                    <div>
                      <div className={styles.responseHeader}>
                        <span className={styles.responseLabel}>JSX Component</span>
                        <button onClick={() => {navigator.clipboard.writeText(jsxSnippet); setCopied(true); setTimeout(() => setCopied(false), 2000);}} className={styles.copyButton}>
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className={styles.responseContent} style={{ maxHeight: 180, overflow: 'auto', fontSize: 13, background: 'transparent', borderRadius: 0, padding: '16px 0 16px 16px', border: 'none' }}>
                        {jsxSnippet}
                      </pre>
                      <div style={{ margin: '8px 0', fontSize: 12, color: '#888', paddingLeft: 2, borderLeft: '3px solid #F97316', background: 'transparent', lineHeight: 1.7 }}>
                        <span style={{ fontWeight: 500 }}>Usage:</span> Place <code>ContactForm</code> in any React/JSX page.<br />
                        <span style={{ color: '#F97316', fontWeight: 500 }}>Example:</span> <code style={{ background: 'none', color: '#18181B' }}>{'<ContactForm />'}</code> in your portfolio/contact page.
                      </div>
                    </div>
                  )}
                  {tab === 'html' && (
                    <div>
                      <div className={styles.responseHeader}>
                        <span className={styles.responseLabel}>HTML Integration</span>
                        <button onClick={() => {navigator.clipboard.writeText(htmlSnippet); setCopied(true); setTimeout(() => setCopied(false), 2000);}} className={styles.copyButton}>
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className={styles.responseContent} style={{ maxHeight: 180, overflow: 'auto', fontSize: 13, background: 'transparent', borderRadius: 0, padding: '16px 0 16px 16px', border: 'none' }}>
                        {htmlSnippet}
                      </pre>
                      <div style={{ margin: '8px 0', fontSize: 12, color: '#888', paddingLeft: 2, borderLeft: '3px solid #F97316', background: 'transparent', lineHeight: 1.7 }}>
                        <span style={{ fontWeight: 500 }}>Usage:</span> Add the script and markup to any HTML page.
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setResult(null)}
                  className={styles.inlineLink}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '20px', fontSize: '14px' }}
                >
                  ← Create another widget
                </button>
              </div>
            )}

            {error && (
              <div className={styles.errorMessage} style={{ marginTop: '24px' }}>
                {error}
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
              <span className={styles.methodBadge}>POST</span>
              <code className={styles.apiEndpoint}>{WORKER_URL}/send</code>
            </div>

            <div className={styles.parametersTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Parameter</div>
                <div className={styles.tableCell}>Description</div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>id</code>
                  <span className={styles.required}>required</span>
                </div>
                <div className={styles.tableCell}>
                  Your unique User ID (generated above).
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>email</code>
                  <span className={styles.required}>required</span>
                </div>
                <div className={styles.tableCell}>
                  The email address of the person contacting you.
                </div>
              </div>
              <div className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <code className={styles.paramName}>message</code>
                  <span className={styles.required}>required</span>
                </div>
                <div className={styles.tableCell}>
                  The content of the message.
                </div>
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Copy & Paste</h3>
              <p className={styles.featureDescription}>
                Get a fully working component. No need to install npm packages or configure servers.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Instant Discord Alerts</h3>
              <p className={styles.featureDescription}>
                Receive messages directly in your private Discord server via Webhook.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Framework Ready</h3>
              <p className={styles.featureDescription}>
                Native support for React, Next.js, and standard HTML/JS websites.
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