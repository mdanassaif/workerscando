'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project } from '@/types';
import styles from './apithrottle.module.css';

interface APIThrottleClientProps {
    project: Project;
}

interface ThrottleState {
    decision: 'allow' | 'soft' | 'block';
    score: number;
    classification: string;
    remaining: number;
}

export default function APIThrottleClient({ project }: APIThrottleClientProps) {
    const [targetUrl, setTargetUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [headers, setHeaders] = useState<Record<string, string>>({});
    const [throttleState, setThrottleState] = useState<ThrottleState>({
        decision: 'allow',
        score: 50,
        classification: 'normal',
        remaining: 60 // 60 req/min base
    });

    const [requestCount, setRequestCount] = useState(0);
    const [requestsInWindow, setRequestsInWindow] = useState(0);
    const [windowStart, setWindowStart] = useState(Date.now());
    const [isSimulating, setIsSimulating] = useState(false);
    const simulationInterval = useRef<NodeJS.Timeout | null>(null);

    // Tab states
    const [apiExampleTab, setApiExampleTab] = useState<'curl' | 'js'>('curl');
    const [copied, setCopied] = useState(false);

    const WORKER_URL = 'https://apithrottle.workerscando.workers.dev';

    const makeRequest = async () => {
        setLoading(true);
        const startTime = Date.now();

        // In a real scenario, this would hit the worker
        // For demo purposes, we'll simulate the logic if the worker isn't deployed

        // Simulate network delay
        await new Promise(r => setTimeout(r, Math.random() * 200 + 100));

        // Calculate simulated results based on speed
        const now = Date.now();
        const timeDelta = now - (window as any).lastRequestTime || 0;
        (window as any).lastRequestTime = now;

        // Manage Window (10s demo window representing 1 minute)
        let currentWindowStart = windowStart;
        let currentReqs = requestsInWindow;

        if (now - currentWindowStart > 10000) {
            currentWindowStart = now;
            currentReqs = 0;
            setWindowStart(now);
            // We'll update the state below with the new count
        }

        let newScore = throttleState.score;
        // Simple simulation logic mirroring the worker
        if (timeDelta < 200) newScore = Math.max(0, newScore - 15); // Penalize fast requests heavily
        else if (timeDelta > 3000) newScore = Math.min(100, newScore + 5);

        // Classification
        let classification = 'normal';
        if (newScore >= 65) classification = 'trusted';
        else if (newScore < 35) classification = 'bot';

        // Adaptive Limit based on classification
        // Bot: 10 req/window (very strict)
        // Trusted: 90 req/window (lenient)
        // Normal: 60 req/window (standard)
        const limit = classification === 'bot' ? 10 : classification === 'trusted' ? 90 : 60;

        // Decision
        let decision: 'allow' | 'soft' | 'block' = 'allow';

        // Block if score is too low OR limit exceeded
        if (newScore < 10) decision = 'block';
        if (currentReqs >= limit) decision = 'block';
        else if (currentReqs >= limit * 0.8) decision = 'soft';

        // Increment for this request
        const nextReqs = currentReqs + 1;
        setRequestsInWindow(nextReqs);

        const newHeaders = {
            'x-throttle-status': decision,
            'x-throttle-score': newScore.toString(),
            'x-throttle-classification': classification,
            'x-throttle-remaining': Math.max(0, limit - nextReqs).toString(),
            'content-type': 'application/json'
        };

        setHeaders(newHeaders);
        setThrottleState({
            decision,
            score: newScore,
            classification,
            remaining: Math.max(0, limit - nextReqs)
        });

        if (decision === 'block') {
            setResponse({
                error: "Too Many Requests",
                message: `Rate limit exceeded. You used ${nextReqs}/${limit} requests in this window.`,
                retryAfter: Math.ceil((10000 - (Date.now() - currentWindowStart)) / 1000) + "s"
            });
        } else {
            setResponse({
                userId: 1,
                id: 1,
                title: "delectus aut autem",
                completed: false,
                _metadata: {
                    latency: `${Date.now() - startTime}ms`,
                    servedBy: "Cloudflare Workers",
                    windowRemaining: `${Math.ceil((10000 - (Date.now() - currentWindowStart)) / 1000)}s`
                }
            });
        }

        setRequestCount(prev => prev + 1);
        setLoading(false);
    };

    const startSimulation = (speed: 'fast' | 'normal' | 'slow') => {
        if (simulationInterval.current) clearInterval(simulationInterval.current);
        setIsSimulating(true);

        const intervalMs = speed === 'fast' ? 200 : speed === 'normal' ? 1000 : 3000;

        simulationInterval.current = setInterval(() => {
            makeRequest();
        }, intervalMs);
    };

    const stopSimulation = () => {
        if (simulationInterval.current) clearInterval(simulationInterval.current);
        setIsSimulating(false);
        simulationInterval.current = null;
    };

    useEffect(() => {
        return () => {
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        };
    }, []);

    const copyExample = () => {
        const code = apiExampleTab === 'curl'
            ? `curl "${WORKER_URL}/api/throttle?url=${targetUrl}"`
            : `fetch("${WORKER_URL}/api/throttle?url=${targetUrl}")`;

        navigator.clipboard.writeText(code);
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
                        Intelligent rate limiting with behavioral scoring. Automatically detects and blocks bots while giving trusted users higher limits.
                    </p>
                </div>
            </section>

            <section className={styles.demoSection}>
                <div className={styles.container}>
                    <div className={styles.demoCard}>
                        <h2 className={styles.demoTitle}>Interactive Demo</h2>
                        <p style={{ color: '#52525B', marginBottom: '24px' }}>
                            Simulate API traffic to see how the scoring engine adapts to block bots and suspicious behavior.
                        </p>

                        <div className={styles.inputGroup}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#52525B', marginBottom: '8px' }}>Target API URL</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="text"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    className={styles.urlInput}
                                    placeholder="https://api.example.com/data"
                                />
                                <button
                                    className={styles.actionButton}
                                    onClick={() => makeRequest()}
                                    disabled={loading || isSimulating}
                                >
                                    {loading ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </div>

                        <div className={styles.simulationControls}>
                            <span className={styles.simulationLabel}>
                                Test Pattern:
                            </span>
                            <button
                                className={`${styles.simulationBtn} ${isSimulating && simulationInterval.current && (simulationInterval.current as any)._idleTimeout < 500 ? styles.simulationBtnActive : ''}`}
                                onClick={() => startSimulation('fast')}
                            >
                                Bot (200ms)
                            </button>
                            <button className={styles.simulationBtn} onClick={() => startSimulation('normal')}>
                                Normal (1s)
                            </button>
                            <button className={styles.simulationBtn} onClick={() => startSimulation('slow')}>
                                Slow (3s)
                            </button>
                            {isSimulating && (
                                <button
                                    className={`${styles.simulationBtn} ${styles.stopBtn}`}
                                    onClick={stopSimulation}
                                >
                                    Stop
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '32px' }}>

                            {/* Score Card */}
                            <div className={styles.resultCardComputed} style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '16px' }}>Client Reputation</h3>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '15px', color: '#334155' }}>Trust Score</span>
                                    <span style={{ fontSize: '24px', fontWeight: 700, color: throttleState.score < 35 ? '#EF4444' : throttleState.score < 65 ? '#F59E0B' : '#10B981' }}>
                                        {Math.round(throttleState.score)}/100
                                    </span>
                                </div>

                                <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
                                    <div style={{
                                        height: '100%',
                                        background: throttleState.score < 35 ? '#EF4444' : throttleState.score < 65 ? '#F59E0B' : '#10B981',
                                        width: `${throttleState.score}%`,
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
                                    <span>Status: <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>{throttleState.classification}</strong></span>
                                    <span>Requests: <strong>{requestsInWindow}</strong> / {throttleState.classification === 'bot' ? 10 : throttleState.classification === 'trusted' ? 90 : 60} (1m)</span>
                                </div>
                            </div>

                            {/* Decision Card */}
                            <div className={styles.resultCardComputed} style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '16px' }}>Current Decision</h3>

                                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                    <span className={`${styles.badge} ${styles.badgeAllow} ${throttleState.decision !== 'allow' ? styles.badgeInactive : ''}`}>ALLOW</span>
                                    <span className={`${styles.badge} ${styles.badgeSoft} ${throttleState.decision !== 'soft' ? styles.badgeInactive : ''}`}>SOFT LIMIT</span>
                                    <span className={`${styles.badge} ${styles.badgeBlock} ${throttleState.decision !== 'block' ? styles.badgeInactive : ''}`}>BLOCK</span>
                                </div>

                                <div style={{ fontSize: '13px', color: '#64748B' }}>
                                    <p style={{ marginBottom: '8px' }}>Response Header:</p>
                                    <code style={{ background: '#E2E8F0', padding: '4px 8px', borderRadius: '4px', display: 'block', color: '#334155' }}>
                                        X-Throttle-Status: {throttleState.decision}
                                    </code>
                                </div>
                            </div>

                        </div>

                        {/* Response Preview */}
                        <div style={{ marginTop: '24px' }}>
                            <div className={styles.resultHeader} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderBottom: 'none', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                                <span className={styles.resultLabel}>Response Preview</span>
                                <span style={{ fontSize: '12px', color: '#64748B' }}>{response ? '200 OK' : 'Waiting...'}</span>
                            </div>
                            <div className={styles.jsonBlock} style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                                {response ? JSON.stringify(response, null, 2) : '// Response will appear here...'}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <section className={styles.apiSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Integration</h2>

                    <div className={styles.apiCard}>
                        <div className={styles.apiMethod}>
                            <span className={styles.methodBadge}>PROXY</span>
                            <code className={styles.apiEndpoint}>{WORKER_URL}/api/throttle</code>
                        </div>

                        <p className={styles.apiDescription}>Wrap your API calls with the throttle proxy to get instant protection.</p>

                        <div className={styles.exampleBox}>
                            <div className={styles.exampleHeader}>
                                <div className={styles.exampleTabs}>
                                    <button
                                        className={`${styles.exampleTab} ${apiExampleTab === 'curl' ? styles.exampleTabActive : ''}`}
                                        onClick={() => setApiExampleTab('curl')}
                                    >
                                        cURL
                                    </button>
                                    <button
                                        className={`${styles.exampleTab} ${apiExampleTab === 'js' ? styles.exampleTabActive : ''}`}
                                        onClick={() => setApiExampleTab('js')}
                                    >
                                        JavaScript / Node
                                    </button>
                                </div>
                                <button className={styles.exampleCopy} onClick={copyExample}>
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className={styles.exampleCode}>
                                <code>
                                    {apiExampleTab === 'curl' ?
                                        `curl "${WORKER_URL}/api/throttle?url=https://your-api.com/users" \\
  -H "X-API-Key: your-key"` :
                                        `// Change this:
// fetch("https://your-api.com/users")

// To this:
fetch("${WORKER_URL}/api/throttle?url=https://your-api.com/users", {
  method: "GET",
  headers: {
    "Authorization": "Bearer token" 
  }
})`}
                                </code>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <section className={styles.featuresSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>How it works</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20" /><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" /><path d="M12 2v10" /><path d="M16 7l-4-5-4 5" /></svg>
                            </div>
                            <h3 className={styles.featureTitle}>Bot Fingerprinting</h3>
                            <p className={styles.featureDescription}>Analyzes IP, JA3 (TLS), and User-Agent to create a unique fingerprint for every client.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            </div>
                            <h3 className={styles.featureTitle}>Behavioral Scoring</h3>
                            <p className={styles.featureDescription}>Assigns a trust score (0-100) based on request frequency patterns and regularity.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            </div>
                            <h3 className={styles.featureTitle}>Adaptive Limits</h3>
                            <p className={styles.featureDescription}>Trusted users get higher limits (300 req/5m), while bots get strict limits (90 req/5m).</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
