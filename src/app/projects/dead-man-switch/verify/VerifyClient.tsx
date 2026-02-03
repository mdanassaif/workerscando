'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from '../dead-man-switch.module.css';

const API_URL = 'https://dead-man-switch.brogee9o9.workers.dev';

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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E5E5E5'
            }}>
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
                            width: '80px',
                            height: '80px',
                            background: '#ECFDF5',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '40px'
                        }}>
                            ✅
                        </div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#18181B',
                            marginBottom: '12px'
                        }}>
                            Verified Successfully!
                        </h1>
                        <p style={{
                            color: '#71717A',
                            fontSize: '16px',
                            marginBottom: '32px'
                        }}>
                            Your Dead Man&apos;s Switch is still active.
                        </p>

                        <div style={{
                            background: '#ECFDF5',
                            border: '1px solid #D1FAE5',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'left'
                        }}>
                            <p style={{ color: '#059669', fontWeight: '600', marginBottom: '12px' }}>
                                ✓ Your secret is safe
                            </p>
                            {switchData?.checkInterval && (
                                <p style={{ color: '#71717A', fontSize: '14px', marginBottom: '8px' }}>
                                    Next check-in: Every {switchData.checkInterval} minute(s)
                                </p>
                            )}
                            <p style={{ color: '#71717A', fontSize: '14px' }}>
                                Missed checks: <strong style={{ color: '#18181B' }}>0/2</strong>
                            </p>
                        </div>

                        <a
                            href="/projects/dead-man-switch"
                            style={{
                                display: 'inline-block',
                                marginTop: '24px',
                                padding: '12px 24px',
                                background: '#F97316',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}
                        >
                            Back to Dead Man&apos;s Switch
                        </a>
                    </>
                )}

                {status === 'error' && (
                    <>
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
                            Verification Failed
                        </h1>
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '12px',
                            padding: '20px',
                            color: '#991B1B',
                            fontSize: '14px'
                        }}>
                            {message}
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
                    </>
                )}
            </div>
        </div>
    );
}
