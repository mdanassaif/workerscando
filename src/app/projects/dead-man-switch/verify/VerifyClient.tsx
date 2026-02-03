'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../dead-man-switch.module.css';

const API_URL = 'https://dead-man-switch.brogee9o9.workers.dev';

// SVG Icons
const CheckIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const AlertIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export default function VerifyClient() {
    const searchParams = useSearchParams();
    const switchId = searchParams.get('id');
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [switchData, setSwitchData] = useState<{ checkInterval?: number } | null>(null);

    useEffect(() => {
        async function verify() {
            if (!switchId || !token) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/verify/${token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ switchId })
                });

                const data = await response.json();

                if (data.success) {
                    // Get switch details
                    const checkResponse = await fetch(`${API_URL}/api/check/${switchId}`);
                    const checkData = await checkResponse.json();
                    setSwitchData(checkData);

                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch {
                setStatus('error');
                setMessage('Network error. Please try again.');
            }
        }

        verify();
    }, [switchId, token]);

    return (
        <section className={styles.formSection} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
            <div className={styles.container}>
                <div className={styles.formCard} style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
                    {status === 'loading' && (
                        <>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                border: '3px solid #E5E5E5',
                                borderTop: '3px solid #F97316',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 24px'
                            }} />
                            <p style={{ color: '#71717A', fontSize: '16px' }}>Verifying...</p>
                            <style jsx>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: '#ECFDF5',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                color: '#059669'
                            }}>
                                <CheckIcon />
                            </div>
                            <h2 className={styles.formTitle}>Verified Successfully</h2>
                            <p className={styles.formDescription}>
                                Your Dead Man&apos;s Switch is still active and your secret remains safe.
                            </p>

                            <div style={{
                                background: '#ECFDF5',
                                border: '1px solid #D1FAE5',
                                borderRadius: '8px',
                                padding: '20px',
                                textAlign: 'left',
                                marginTop: '24px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', marginBottom: '12px' }}>
                                    <ShieldIcon />
                                    <strong>Your secret is safe</strong>
                                </div>
                                {switchData?.checkInterval && (
                                    <p style={{ color: '#71717A', fontSize: '14px', margin: '8px 0' }}>
                                        Next check-in: Every {switchData.checkInterval} minute(s)
                                    </p>
                                )}
                                <p style={{ color: '#71717A', fontSize: '14px', margin: 0 }}>
                                    Missed checks: <strong style={{ color: '#18181B' }}>0 of 2</strong>
                                </p>
                            </div>

                            <a
                                href="/projects/dead-man-switch"
                                className={styles.submitButton}
                                style={{ display: 'inline-block', marginTop: '24px', textDecoration: 'none' }}
                            >
                                Back to Dead Man&apos;s Switch
                            </a>
                        </>
                    )}

                    {status === 'error' && (
                        <>
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
                            <h2 className={styles.formTitle}>Verification Failed</h2>
                            <div className={`${styles.alert} ${styles.alertError}`}>
                                {message}
                            </div>

                            <a
                                href="/projects/dead-man-switch"
                                className={styles.closeButton}
                                style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none', padding: '12px 24px' }}
                            >
                                Go Back
                            </a>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
