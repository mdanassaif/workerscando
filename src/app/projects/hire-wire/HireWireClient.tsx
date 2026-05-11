'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ToolStudio } from '@/components';
import { Project } from '@/types';
import layout from '@/styles/components/split-layout.module.css';

interface HireWireClientProps {
  project: Project;
}

interface Result {
  userId: string;
  scriptUrl: string;
}

export default function HireWireClient({ project }: HireWireClientProps) {
  const [name, setName] = useState('');
  const [webhook, setWebhook] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'tsx' | 'jsx' | 'html'>('tsx');
  const [copied, setCopied] = useState(false);

  const WORKER_URL = 'https://hire-wire.brogee9o9.workers.dev';

  const handleGenerate = async () => {
    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : `Registration failed (${res.status})`);
        return;
      }
      if (!data.userId || !data.scriptUrl) {
        setError('Unexpected response from worker.');
        return;
      }
      setResult(data);
    } catch (e) {
      setError('Failed to generate widget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <div style={{ color: '#10B981', marginTop: 8, fontSize: 13, fontWeight: 500 }}>Message sent! You can send another in a moment.</div>
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
    <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
      <h2 style={{ fontFamily: 'sans-serif', marginTop: 0 }}>Hire Me</h2>
      <input 
        type="email" 
        placeholder="Email"
        required
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'sending' || sent}
      />
      <textarea 
        placeholder="Message"
        required
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        disabled={status === 'sending' || sent}
      />
      <button type="submit" style={{ padding: '10px 20px', background: '#111827', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 600 }} disabled={status === 'sending' || sent}>
        {status === 'sending' ? 'Sending...' : sent ? 'Sent!' : 'Send Message'}
      </button>
      {sent && (
        <div style={{ color: '#10B981', marginTop: 8, fontSize: 13, fontWeight: 500 }}>Message sent! You can send another in a moment.</div>
      )}
    </form>
  );
}` : '';

  const htmlSnippet = result ? `<script src="${result.scriptUrl}"></script>

<div class="contact-card" style="padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px; font-family: sans-serif; max-width: 400px;">
  <h2 style="margin-top: 0">Hire Me</h2>
  <input type="email" id="email" placeholder="Email" style="display: block; width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #D1D5DB; box-sizing: border-box; border-radius: 4px;">
  <textarea id="msg" placeholder="Message" style="display: block; width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #D1D5DB; box-sizing: border-box; border-radius: 4px; min-height: 100px;"></textarea>
  <button id="sendBtn" onclick="sendHire()" style="width: 100%; padding: 12px; background: #111827; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Send Message</button>
  <div id="sentMsg" style="display:none; color:#10B981; margin-top:12px; font-weight:500; font-size: 13px;">Message sent! You can send another in a moment.</div>
</div>

<script>
  let sending = false;
  async function sendHire() {
    if (sending) return;
    sending = true;
    const email = document.getElementById('email').value;
    const msg = document.getElementById('msg').value;
    const btn = document.getElementById('sendBtn');
    
    if(!email || !msg) {
        alert("Please fill out both fields.");
        sending = false;
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Sending...';
    btn.style.opacity = '0.7';

    // The Magic Line ⚡
    const res = await HireWire.send(email, msg);
    
    if(res.sent) {
      btn.textContent = 'Sent!';
      document.getElementById('sentMsg').style.display = 'block';
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        btn.style.opacity = '1';
        document.getElementById('sentMsg').style.display = 'none';
        sending = false;
      }, 2000);
    } else {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      btn.style.opacity = '1';
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
            A backend-as-a-service for your portfolio. Create a fully functional contact form that sends messages directly to Discord. Zero server setup required.
          </p>
        </div>

        <div className={layout.leftBody}>
          {!result ? (
            <>
              <div className={layout.field}>
                <label className={layout.label}>Project Name</label>
                <input
                  className={layout.input}
                  placeholder="e.g. My Next.js Portfolio"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className={layout.field} style={{ marginTop: '16px' }}>
                <label className={layout.label}>Discord Webhook URL</label>
                <input
                  className={layout.input}
                  type="password"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={webhook}
                  onChange={e => setWebhook(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                />
                <span className={layout.hint}>
                  Messages submitted on your site will securely forward directly to this Discord channel.
                </span>
              </div>

              <button 
                className={layout.primaryBtn} 
                onClick={handleGenerate} 
                disabled={!name.trim() || !webhook.trim() || loading}
                style={{ marginTop: '24px' }}
              >
                {loading ? 'Generating Code…' : 'Get integration code'}
              </button>
            </>
          ) : (
            <>
              <div className={layout.successBanner}>
                <div className={layout.successBannerTitle}>Widget configured</div>
                <div className={layout.successBannerText}>Your endpoint is active and ready for form submissions.</div>
              </div>

              <button 
                className={layout.secondaryBtn} 
                onClick={() => setResult(null)} 
              >
                Configure New Widget
              </button>

              <div className={layout.endpointHintBox}>
                <h3 className={layout.endpointHintTitle}>API endpoint</h3>
                <div className={layout.endpointHintCode}>
                  <span className={layout.methodPost}>POST</span> {WORKER_URL}/send?id={result.userId}
                  <br />
                  <br />
                  Body: <code>{`{ "email": "...", "message": "..." }`}</code>
                </div>
              </div>
            </>
          )}

        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className={layout.rightPanel}>
        <header className={layout.rightHeader}>
          <span>Integration Code</span>
        </header>

        <div className={layout.rightBody}>
          {error && <div className={layout.errorBanner}>{error}</div>}

          {!result && !loading && !error && (
            <div className={layout.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8l-6-6Z"/>
                <path d="M14 2v6h6"/>
                <path d="m10 13-2 2 2 2"/>
                <path d="m14 17 2-2-2-2"/>
              </svg>
              <div className={layout.emptyTitle}>Enter your Webhook</div>
              <div className={layout.emptyText}>Provide a Discord webhook URL to generate drop-in contact form components for your site.</div>
            </div>
          )}

          {result && (
            <div className={layout.flexColGap} style={{ height: '100%' }}>
              <div className={layout.embedTabRow}>
                <button
                  type="button"
                  onClick={() => setTab('tsx')}
                  className={`${layout.embedTabBtn} ${tab === 'tsx' ? layout.embedTabBtnOn : ''}`}
                >
                  React / Next (TSX)
                </button>
                <button
                  type="button"
                  onClick={() => setTab('jsx')}
                  className={`${layout.embedTabBtn} ${tab === 'jsx' ? layout.embedTabBtnOn : ''}`}
                >
                  React (JSX)
                </button>
                <button
                  type="button"
                  onClick={() => setTab('html')}
                  className={`${layout.embedTabBtn} ${tab === 'html' ? layout.embedTabBtnOn : ''}`}
                >
                  Plain HTML
                </button>
              </div>

              <div className={layout.embedCard}>
                <div className={layout.embedCardHead}>
                  <span className={layout.embedCardTitle}>
                    {tab === 'tsx' && 'ContactForm.tsx'}
                    {tab === 'jsx' && 'ContactForm.jsx'}
                    {tab === 'html' && 'HTML + script'}
                  </span>
                  <button type="button" onClick={handleCopy} className={layout.embedCopyBtn}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className={layout.embedPreScroll}>
                  <pre className={layout.embedPre}>{getCode()}</pre>
                </div>
              </div>

              <div className={layout.embedCallout}>
                <div className={layout.embedCalloutTitle}>Usage</div>
                <div className={layout.embedCalloutBody}>
                  {tab === 'tsx' || tab === 'jsx' ? (
                    <>
                      Drop in the <code>ContactForm</code> component on any page.
                    </>
                  ) : (
                    <>Paste the snippet in your page body—the script loads the widget helpers.</>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </ToolStudio>
  );
}