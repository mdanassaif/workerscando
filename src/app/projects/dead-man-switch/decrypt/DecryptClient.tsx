'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = 'https://dead-man-switch.brogee9o9.workers.dev';

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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E5E5E5'
            }}>
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
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h1 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#DC2626',
                                marginBottom: '12px'
                            }}>
                                🔓 Dead Man&apos;s Switch Triggered
                            </h1>
                        </div>

                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <p style={{ color: '#991B1B', fontSize: '14px' }}>
                                <strong>⚠️ IMPORTANT:</strong> This secret was released because the owner failed to respond to multiple check-ins.
                            </p>
                        </div>

                        <div style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '24px'
                        }}>
                            <p style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#64748B',
                                textTransform: 'uppercase',
                                marginBottom: '12px'
                            }}>
                                The Secret:
                            </p>
                            <div style={{
                                background: '#18181B',
                                color: '#10B981',
                                padding: '20px',
                                borderRadius: '8px',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                lineHeight: '1.8',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {secret}
                            </div>
                        </div>

                        <button
                            onClick={copySecret}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: copied ? '#10B981' : '#DC2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
                        </button>

                        <p style={{
                            textAlign: 'center',
                            marginTop: '24px',
                            fontSize: '13px',
                            color: '#71717A'
                        }}>
                            💡 This secret has been entrusted to you. Please handle it responsibly.
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#FEF2F2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '40px'
                        }}>
                            ❌
                        </div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#18181B',
                            marginBottom: '12px'
                        }}>
                            Error
                        </h1>
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '12px',
                            padding: '20px',
                            color: '#991B1B',
                            fontSize: '14px'
                        }}>
                            {errorMessage}
                        </div>

                        <a
                            href="/projects/dead-man-switch"
                            style={{
                                display: 'inline-block',
                                marginTop: '24px',
                                padding: '12px 24px',
                                background: '#F1F5F9',
                                color: '#64748B',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}
                        >
                            Go Back
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
