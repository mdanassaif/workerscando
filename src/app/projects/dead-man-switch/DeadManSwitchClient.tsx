'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import layout from '@/styles/components/split-layout.module.css';

interface DeadManSwitchClientProps {
    project: Project;
}

interface FormData {
    secret: string;
    ownerEmail: string;
    recipientEmail: string;
    checkInterval: number;
}

interface SuccessData {
    switchId: string;
    message: string;
}

const API_URL = 'https://dead-man-switch.brogee9o9.workers.dev';

export default function DeadManSwitchClient({ project }: DeadManSwitchClientProps) {
    const [formData, setFormData] = useState<FormData>({
        secret: '',
        ownerEmail: '',
        recipientEmail: '',
        checkInterval: 43200, 
    });
    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState<SuccessData | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function deriveKey(password: string, salt: ArrayBuffer) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function encryptSecret(secret: string, password: string) {
        const encoder = new TextEncoder();
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(password, salt.buffer as ArrayBuffer);

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
            key,
            encoder.encode(secret)
        );

        return {
            encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
            salt: btoa(String.fromCharCode(...salt)),
            iv: btoa(String.fromCharCode(...iv))
        };
    }

    function generatePassword(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const password = generatePassword();
            const { encrypted, salt, iv } = await encryptSecret(formData.secret, password);

            const encryptedPackage = btoa(JSON.stringify({
                encryptedSecret: encrypted,
                password: password,
                salt: salt,
                iv: iv
            }));

            const response = await fetch(`${API_URL}/api/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    encryptedSecret: encryptedPackage,
                    ownerEmail: formData.ownerEmail,
                    recipientEmail: formData.recipientEmail,
                    checkInterval: formData.checkInterval,
                    salt,
                    iv
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData({
                    switchId: data.switchId,
                    message: data.message
                });
            } else {
                setError(data.error || 'Failed to create switch');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'checkInterval' ? parseInt(value) : value
        }));
    }

    const [copied, setCopied] = useState(false);
    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function createAnother() {
        setSuccessData(null);
        setFormData({ secret: '', ownerEmail: '', recipientEmail: '', checkInterval: 43200 });
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
                        <span className={layout.dayTag}>Day {project.day}</span>
                        <span className={layout.liveTag} style={{ color: '#0284C7' }}>
                            <span className={layout.liveDot} style={{ background: '#0EA5E9' }} /> 100% Client-Side Crypto
                        </span>
                    </div>
                    
                    <h1 className={layout.title}>{project.name}</h1>
                    <p className={layout.description}>
                        A serverless dead man&apos;s switch. Automatically delivers securely encrypted secrets if you fail to respond to regular check-ins.
                    </p>
                </div>

                <div className={layout.leftBody}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className={layout.field}>
                            <label className={layout.label}>Your Email (Owner)</label>
                            <input
                                type="email"
                                name="ownerEmail"
                                className={layout.input}
                                placeholder="you@example.com"
                                value={formData.ownerEmail}
                                onChange={handleInputChange}
                                required
                            />
                            <span className={layout.hint}>Check-ins will be sent here to prove you are active.</span>
                        </div>

                        <div className={layout.field}>
                            <label className={layout.label}>Recipient&apos;s Email</label>
                            <input
                                type="email"
                                name="recipientEmail"
                                className={layout.input}
                                placeholder="trusted@person.com"
                                value={formData.recipientEmail}
                                onChange={handleInputChange}
                                required
                            />
                            <span className={layout.hint}>They receive the decrypted secret if the switch triggers.</span>
                        </div>

                        <div className={layout.field}>
                            <label className={layout.label}>Check Interval</label>
                            <select
                                name="checkInterval"
                                className={layout.input}
                                value={formData.checkInterval}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="1">Every Minute (Testing Only)</option>
                                <option value="60">Hourly</option>
                                <option value="1440">Daily</option>
                                <option value="10080">Weekly</option>
                                <option value="43200">Monthly</option>
                            </select>
                        </div>

                        <div className={layout.field}>
                            <label className={layout.label}>Your Secret Payload</label>
                            <textarea
                                name="secret"
                                className={layout.input}
                                style={{ minHeight: '120px', resize: 'vertical' }}
                                placeholder="Bitcoin seed, passwords, or final words."
                                value={formData.secret}
                                onChange={handleInputChange}
                                required
                            />
                            <span className={layout.hint} style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                Locally encrypted with AES-GCM-256 before leaving your device. We cannot read this.
                            </span>
                        </div>

                        <button 
                            type="submit"
                            className={layout.primaryBtn} 
                            disabled={isLoading || successData !== null}
                            style={{ marginTop: '8px' }}
                        >
                            {isLoading ? 'Encrypting & Arming Switch...' : successData ? 'Armed Successfully' : 'Encrypt & Arm Switch'}
                        </button>
                    </form>
                </div>
            </aside>

            {/* ── RIGHT PANEL ── */}
            <main className={layout.rightPanel}>
                <header className={layout.rightHeader}>
                    <span>Switch Status</span>
                </header>

                <div className={layout.rightBody}>
                    {error && <div className={layout.errorBanner}>{error}</div>}

                    {!successData && !isLoading && !error && (
                        <div className={layout.emptyState}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <div className={layout.emptyTitle}>Switch Inactive</div>
                            <div className={layout.emptyText}>Fill out the form on the left. The switch will remain completely dormant on the edge until triggered.</div>
                        </div>
                    )}

                    {isLoading && (
                        <div className={layout.emptyState} style={{ color: '#6B7280' }}>
                            Generating PBKDF2 keys and encrypting blob...
                        </div>
                    )}

                    {successData && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            
                            <div style={{ background: '#ECFDF5', border: '1px solid #D1FAE5', padding: '32px', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#10B981', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#064E3B', margin: 0 }}>Arming Sequence Initiated</h2>
                                        <div style={{ fontSize: '13px', color: '#047857' }}>{successData.message}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '16px' }}>Your Unique Switch ID</h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                    <code style={{ flex: 1, padding: '12px 16px', background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '15px', color: '#111827', wordBreak: 'break-all' }}>
                                        {successData.switchId}
                                    </code>
                                    <button 
                                        onClick={() => copyToClipboard(successData.switchId)}
                                        className={layout.secondaryBtn}
                                        style={{ width: 'auto', padding: '12px 24px', flexShrink: 0 }}
                                    >
                                        {copied ? '✓ Copied' : 'Copy ID'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '24px', borderRadius: '8px' }}>
                                <h3 style={{ fontSize: '14px', color: '#B45309', fontWeight: 600, marginBottom: '8px' }}>Important Next Step</h3>
                                <p style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5, margin: 0 }}>
                                    Check your email ({formData.ownerEmail}) immediately for a verification link. 
                                    <strong> The switch will NOT activate until you click the initial verification link.</strong>
                                </p>
                            </div>

                            <button onClick={createAnother} className={layout.secondaryBtn}>
                                Reset Form & Create Another
                            </button>

                        </div>
                    )}

                    <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #E5E7EB' }}>
                        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '16px' }}>Architecture & Security</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
                                <strong style={{ color: '#111827', display: 'block', marginBottom: '4px' }}>1. Client-Side Encryption</strong>
                                Your secret is encrypted locally in your browser using AES-GCM-256 with a randomly generated 256-bit PBKDF2 derived key. The key never leaves the browser. We only send the cyphertext to the database.
                            </div>
                            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
                                <strong style={{ color: '#111827', display: 'block', marginBottom: '4px' }}>2. Cloudflare Edge Chron</strong>
                                A distributed cron trigger wakes up every minute. If 2 consecutive intervals miss a check-in ping, the trigger fires automatically.
                            </div>
                            <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
                                <strong style={{ color: '#111827', display: 'block', marginBottom: '4px' }}>3. Asymmetric Decryption Transfer</strong>
                                When triggered, the raw cyphertext is emailed to the recipient with an access link. The decryption happens strictly locally in the recipient's browser.
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
