'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../dead-man-switch.module.css';

const API_URL = 'https://dead-man-switch.brogee9o9.workers.dev';

// SVG Icons
const UnlockIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
);

const AlertIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const CopyIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function DecryptClient() {
    const searchParams = useSearchParams();
    const switchId = searchParams.get('id');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [secret, setSecret] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState('');
    const [copied, setCopied] = useState(false);

    // Decrypt the secret
    async function decryptSecret(encryptedData: string, password: string, salt: string, iv: string) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
        const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
        const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Derive key
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: saltBytes.buffer as ArrayBuffer,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );

        // Decrypt
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivBytes.buffer as ArrayBuffer },
            key,
            encryptedBytes
        );

        return decoder.decode(decryptedData);
    }

    useEffect(() => {
        async function init() {
            if (!switchId) {
                setStatus('error');
                setErrorMessage('No switch ID provided.');
                return;
            }

            try {
                // Fetch encrypted data from API
                const response = await fetch(`${API_URL}/api/decrypt/${switchId}`);
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to load secret');
                }

                // Parse the encrypted package
                const packageData = JSON.parse(atob(data.encryptedSecret));

                // Decrypt the secret
                const decryptedSecret = await decryptSecret(
                    packageData.encryptedSecret,
                    packageData.password,
                    packageData.salt,
                    packageData.iv
                );

                setSecret(decryptedSecret);
                setStatus('success');
            } catch (error) {
                console.error('Error:', error);
                setStatus('error');
                setErrorMessage(error instanceof Error ? error.message : 'Failed to decrypt secret');
            }
        }

        init();
    }, [switchId]);

    function copySecret() {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <section className={styles.formSection} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
            <div className={styles.container}>
                <div className={styles.formCard} style={{ maxWidth: '560px', margin: '0 auto' }}>
                    {status === 'loading' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                border: '3px solid #E5E5E5',
                                borderTop: '3px solid #DC2626',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 24px'
                            }} />
                            <p style={{ color: '#71717A', fontSize: '16px' }}>Decrypting secret...</p>
                            <style jsx>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    )}

                    {status === 'success' && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: '#FEF2F2',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    color: '#DC2626'
                                }}>
                                    <UnlockIcon />
                                </div>
                                <h2 className={styles.formTitle} style={{ color: '#DC2626' }}>
                                    Secret Released
                                </h2>
                            </div>

                            <div className={`${styles.alert} ${styles.alertError}`}>
                                <strong>Important:</strong> This secret was released because the owner failed to respond to multiple check-ins.
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                <label className={styles.label}>The Secret:</label>
                                <div style={{
                                    background: '#18181B',
                                    color: '#10B981',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    lineHeight: '1.8',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    marginTop: '8px'
                                }}>
                                    {secret}
                                </div>
                            </div>

                            <button
                                onClick={copySecret}
                                className={styles.submitButton}
                                style={{
                                    marginTop: '24px',
                                    background: copied ? '#10B981' : '#DC2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy to Clipboard</>}
                            </button>

                            <p style={{
                                textAlign: 'center',
                                marginTop: '24px',
                                fontSize: '13px',
                                color: '#71717A'
                            }}>
                                This secret has been entrusted to you. Please handle it responsibly.
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: '#FEF2F2',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                color: '#DC2626'
                            }}>
                                <AlertIcon />
                            </div>
                            <h2 className={styles.formTitle}>Error</h2>
                            <div className={`${styles.alert} ${styles.alertError}`}>
                                {errorMessage}
                            </div>

                            <a
                                href="/projects/dead-man-switch"
                                className={styles.closeButton}
                                style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none', padding: '12px 24px' }}
                            >
                                Go Back
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
