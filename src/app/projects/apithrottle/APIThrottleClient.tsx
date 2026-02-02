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
    const [isSimulating, setIsSimulating] = useState(false);
    const simulationInterval = useRef<NodeJS.Timeout | null>(null);

    // Configurable rate limits
    const [config, setConfig] = useState({
        trustedLimit: 90,    // requests per window for trusted users
        normalLimit: 60,     // requests per window for normal users
        botLimit: 10,        // requests per window for bots
        windowDuration: 10,  // window duration in seconds (demo mode)
        trustedThreshold: 65, // score threshold for trusted status
        botThreshold: 35      // score threshold below which = bot
    });
    const [showConfig, setShowConfig] = useState(false);

    // Use refs to track mutable state that needs to be accessed from setInterval
    const stateRef = useRef({
        score: 50,
        requestsInWindow: 0,
        windowStart: Date.now(),
        lastRequestTime: 0
    });
    const configRef = useRef(config); // Store config in ref for setInterval access

    // Keep configRef in sync with config state
    useEffect(() => {
        configRef.current = config;
    }, [config]);

    // Tab states
    const [apiExampleTab, setApiExampleTab] = useState<'curl' | 'js'>('curl');
    const [copied, setCopied] = useState(false);

    const WORKER_URL = 'https://apithrottle.workerscando.workers.dev';

    const makeRequest = () => {
        setLoading(true);
        const startTime = Date.now();
        const now = Date.now();

        // Use ref for time tracking to avoid stale closures
        const timeDelta = stateRef.current.lastRequestTime > 0
            ? now - stateRef.current.lastRequestTime
            : 1000; // Default to normal on first request
        stateRef.current.lastRequestTime = now;

        // Manage Window using configurable duration
        const windowMs = configRef.current.windowDuration * 1000;
        if (now - stateRef.current.windowStart > windowMs) {
            stateRef.current.windowStart = now;
            stateRef.current.requestsInWindow = 0;
        }

        let newScore = stateRef.current.score;
        // Simple simulation logic mirroring the worker
        if (timeDelta < 300) {
            newScore = Math.max(0, newScore - 12); // Penalize fast requests
        } else if (timeDelta < 800) {
            newScore = Math.max(0, newScore - 5); // Slight penalty for somewhat fast
        } else if (timeDelta > 2000) {
            newScore = Math.min(100, newScore + 8); // Reward slow/human-like
        } else {
            newScore = Math.min(100, newScore + 2); // Slight reward for normal pace
        }

        stateRef.current.score = newScore;

        // Classification based on configurable thresholds
        const cfg = configRef.current;
        let classification = 'normal';
        if (newScore >= cfg.trustedThreshold) classification = 'trusted';
        else if (newScore < cfg.botThreshold) classification = 'bot';

        // Adaptive Limit based on classification (using configurable limits)
        const limit = classification === 'bot'
            ? cfg.botLimit
            : classification === 'trusted'
                ? cfg.trustedLimit
                : cfg.normalLimit;

        // Decision
        let decision: 'allow' | 'soft' | 'block' = 'allow';

        // Block if score is too low OR limit exceeded
        if (newScore < 10) decision = 'block';
        else if (stateRef.current.requestsInWindow >= limit) decision = 'block';
        else if (stateRef.current.requestsInWindow >= limit * 0.8) decision = 'soft';

        // Increment for this request
        stateRef.current.requestsInWindow++;
        const currentReqs = stateRef.current.requestsInWindow;
        setRequestsInWindow(currentReqs); // Update UI display

        const newHeaders = {
            'x-throttle-status': decision,
            'x-throttle-score': newScore.toString(),
            'x-throttle-classification': classification,
            'x-throttle-remaining': Math.max(0, limit - currentReqs).toString(),
            'content-type': 'application/json'
        };

        setHeaders(newHeaders);
        setThrottleState({
            decision,
            score: newScore,
            classification,
            remaining: Math.max(0, limit - currentReqs)
        });

        if (decision === 'block') {
            setResponse({
                error: "Too Many Requests",
                message: `Rate limit exceeded. You used ${currentReqs}/${limit} requests in this window.`,
                retryAfter: Math.ceil((windowMs - (now - stateRef.current.windowStart)) / 1000) + "s"
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
                    windowRemaining: `${Math.ceil((windowMs - (now - stateRef.current.windowStart)) / 1000)}s`
                }
            });
        }

        setRequestCount(prev => prev + 1);
        setLoading(false);
    };

    const startSimulation = (speed: 'fast' | 'normal' | 'slow') => {
        // Stop any existing simulation
        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
        }

        // Reset state for new simulation
        stateRef.current = {
            score: 50,
            requestsInWindow: 0,
            windowStart: Date.now(),
            lastRequestTime: 0
        };
        setThrottleState({
            decision: 'allow',
            score: 50,
            classification: 'normal',
            remaining: 60
        });
        setRequestsInWindow(0);

        setIsSimulating(true);

        const intervalMs = speed === 'fast' ? 150 : speed === 'normal' ? 1200 : 3500;

        // Make first request immediately
        makeRequest();

        // Then continue at interval
        simulationInterval.current = setInterval(() => {
            makeRequest();
        }, intervalMs);
    };

    const stopSimulation = () => {
        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
            simulationInterval.current = null;
        }
        setIsSimulating(false);
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
                            <button
                                className={styles.simulationBtn}
                                onClick={() => setShowConfig(!showConfig)}
                                style={{ marginLeft: 'auto', background: showConfig ? 'var(--accent)' : '', color: showConfig ? 'white' : '', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                                </svg>
                                Configure
                            </button>
                        </div>

                        {/* Configuration Panel */}
                        {showConfig && (
                            <div style={{
                                marginTop: '20px',
                                padding: '24px',
                                background: '#F8FAFC',
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                                        </svg>
                                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#18181B', margin: 0 }}>
                                            Custom Rate Limits
                                        </h4>
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#71717A' }}>
                                        Adjust limits to test different throttling configurations
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                                    {/* Trusted Limit */}
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            Trusted
                                            <span title="Max requests allowed for trusted users (high score) per time window" style={{ marginLeft: 'auto', cursor: 'help', width: '14px', height: '14px', borderRadius: '50%', background: '#E2E8F0', color: '#64748B', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>?</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="500"
                                            value={config.trustedLimit}
                                            onChange={(e) => setConfig({ ...config, trustedLimit: parseInt(e.target.value) || 90 })}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #D4D4D8',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                background: '#FAFAFA'
                                            }}
                                            disabled={isSimulating}
                                        />
                                        <span style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '4px', display: 'block' }}>requests</span>
                                    </div>

                                    {/* Normal Limit */}
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            Normal
                                            <span title="Max requests allowed for normal users (average score) per time window" style={{ marginLeft: 'auto', cursor: 'help', width: '14px', height: '14px', borderRadius: '50%', background: '#E2E8F0', color: '#64748B', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>?</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="300"
                                            value={config.normalLimit}
                                            onChange={(e) => setConfig({ ...config, normalLimit: parseInt(e.target.value) || 60 })}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #D4D4D8',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                background: '#FAFAFA'
                                            }}
                                            disabled={isSimulating}
                                        />
                                        <span style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '4px', display: 'block' }}>requests</span>
                                    </div>

                                    {/* Bot Limit */}
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="10" rx="2" />
                                                <circle cx="12" cy="5" r="2" />
                                                <path d="M12 7v4" />
                                                <line x1="8" y1="16" x2="8" y2="16" />
                                                <line x1="16" y1="16" x2="16" y2="16" />
                                            </svg>
                                            Suspicious
                                            <span title="Max requests allowed for bots/suspicious users (low score) per time window" style={{ marginLeft: 'auto', cursor: 'help', width: '14px', height: '14px', borderRadius: '50%', background: '#E2E8F0', color: '#64748B', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>?</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={config.botLimit}
                                            onChange={(e) => setConfig({ ...config, botLimit: parseInt(e.target.value) || 10 })}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #D4D4D8',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                background: '#FAFAFA'
                                            }}
                                            disabled={isSimulating}
                                        />
                                        <span style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '4px', display: 'block' }}>requests</span>
                                    </div>

                                    {/* Window Duration */}
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#6366F1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            Window
                                            <span title="Time window in seconds. Requests are counted within this period and reset after" style={{ marginLeft: 'auto', cursor: 'help', width: '14px', height: '14px', borderRadius: '50%', background: '#E2E8F0', color: '#64748B', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>?</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="60"
                                            value={config.windowDuration}
                                            onChange={(e) => setConfig({ ...config, windowDuration: parseInt(e.target.value) || 10 })}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #D4D4D8',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                background: '#FAFAFA'
                                            }}
                                            disabled={isSimulating}
                                        />
                                        <span style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '4px', display: 'block' }}>seconds</span>
                                    </div>

                                    {/* Trusted Threshold */}
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                                <polyline points="16 7 22 7 22 13" />
                                            </svg>
                                            Trusted ≥
                                            <span title="Users with score at or above this value are classified as 'Trusted' and get higher limits" style={{ marginLeft: 'auto', cursor: 'help', width: '14px', height: '14px', borderRadius: '50%', background: '#E2E8F0', color: '#64748B', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>?</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="50"
                                            max="100"
                                            value={config.trustedThreshold}
                                            onChange={(e) => setConfig({ ...config, trustedThreshold: parseInt(e.target.value) || 65 })}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #D4D4D8',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                background: '#FAFAFA'
                                            }}
                                            disabled={isSimulating}
                                        />
                                        <span style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '4px', display: 'block' }}>min score</span>
                                    </div>

                                    {/* Bot Threshold */}
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                                                <polyline points="16 17 22 17 22 11" />
                                            </svg>
                                            Bot &lt;
                                            <span title="Users with score below this value are classified as 'Bot/Suspicious' and get stricter limits" style={{ marginLeft: 'auto', cursor: 'help', width: '14px', height: '14px', borderRadius: '50%', background: '#E2E8F0', color: '#64748B', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>?</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="50"
                                            value={config.botThreshold}
                                            onChange={(e) => setConfig({ ...config, botThreshold: parseInt(e.target.value) || 35 })}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #D4D4D8',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                background: '#FAFAFA'
                                            }}
                                            disabled={isSimulating}
                                        />
                                        <span style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '4px', display: 'block' }}>max score</span>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    <span>Requests: <strong>{requestsInWindow}</strong> / {throttleState.classification === 'bot' ? config.botLimit : throttleState.classification === 'trusted' ? config.trustedLimit : config.normalLimit} ({config.windowDuration}s window)</span>
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
                            <p className={styles.featureDescription}>Trusted users get higher limits (90 req/min), while bots get strict limits (18 req/min).</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* API Reference Section */}
            <section className={styles.apiSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>API Reference</h2>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {/* Endpoint 1: Throttle Proxy */}
                        <div className={styles.apiCard} style={{ background: 'white', border: '1px solid #E5E5E5' }}>
                            <div className={styles.apiMethod}>
                                <span className={styles.methodBadge} style={{ background: '#10B981' }}>GET/POST</span>
                                <code className={styles.apiEndpoint}>/api/throttle?url=...</code>
                            </div>
                            <p className={styles.apiDescription}>Proxy your API request with intelligent rate limiting. All headers are forwarded to the target.</p>
                            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#64748B' }}>
                                <strong>Response Headers:</strong><br />
                                <code style={{ color: '#F97316' }}>X-Throttle-Status</code>: allow | soft | block<br />
                                <code style={{ color: '#F97316' }}>X-Throttle-Score</code>: 0-100 (client trust score)<br />
                                <code style={{ color: '#F97316' }}>X-Throttle-Classification</code>: trusted | normal | suspicious | bot<br />
                                <code style={{ color: '#F97316' }}>X-Throttle-Remaining</code>: requests remaining in window
                            </div>
                        </div>

                        {/* Endpoint 2: Check Status */}
                        <div className={styles.apiCard} style={{ background: 'white', border: '1px solid #E5E5E5' }}>
                            <div className={styles.apiMethod}>
                                <span className={styles.methodBadge} style={{ background: '#3B82F6' }}>GET</span>
                                <code className={styles.apiEndpoint}>/api/check</code>
                            </div>
                            <p className={styles.apiDescription}>Check your current throttle status without making a proxied request. Useful for monitoring.</p>
                        </div>

                        {/* Endpoint 3: Stats */}
                        <div className={styles.apiCard} style={{ background: 'white', border: '1px solid #E5E5E5' }}>
                            <div className={styles.apiMethod}>
                                <span className={styles.methodBadge} style={{ background: '#8B5CF6' }}>GET</span>
                                <code className={styles.apiEndpoint}>/api/stats</code>
                            </div>
                            <p className={styles.apiDescription}>View rate limit configuration and global analytics (if enabled).</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deploy Your Own Section */}
            <section className={styles.featuresSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Deploy Your Own</h2>
                    <p style={{ color: '#52525B', marginBottom: '32px', fontSize: '16px', lineHeight: '1.7' }}>
                        Want to run this on your own Cloudflare account? Here&apos;s how to deploy your own API Throttle worker in minutes:
                    </p>

                    <div style={{ display: 'grid', gap: '16px', maxWidth: '800px' }}>
                        {/* Step 1 */}
                        <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '24px', display: 'flex', gap: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>1</div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#18181B', marginBottom: '8px' }}>Clone the Worker</h4>
                                <div style={{ background: '#1a1a2e', padding: '12px 16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', color: '#E4E4E7' }}>
                                    git clone https://github.com/workerscando/apithrottle<br />
                                    cd apithrottle
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '24px', display: 'flex', gap: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>2</div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#18181B', marginBottom: '8px' }}>Create KV Namespace</h4>
                                <div style={{ background: '#1a1a2e', padding: '12px 16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', color: '#E4E4E7' }}>
                                    npx wrangler kv:namespace create &quot;THROTTLE_KV&quot;
                                </div>
                                <p style={{ fontSize: '13px', color: '#71717A', marginTop: '8px' }}>Copy the returned ID and paste it in <code style={{ color: 'var(--accent)' }}>wrangler.toml</code></p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '24px', display: 'flex', gap: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>3</div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#18181B', marginBottom: '8px' }}>Deploy to Cloudflare</h4>
                                <div style={{ background: '#1a1a2e', padding: '12px 16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', color: '#E4E4E7' }}>
                                    npx wrangler deploy
                                </div>
                                <p style={{ fontSize: '13px', color: '#71717A', marginTop: '8px' }}>Your worker will be live at <code style={{ color: 'var(--accent)' }}>https://apithrottle.YOUR-SUBDOMAIN.workers.dev</code></p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div style={{ background: 'white', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '24px', display: 'flex', gap: '16px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>✓</div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#18181B', marginBottom: '8px' }}>Use It!</h4>
                                <p style={{ fontSize: '14px', color: '#52525B', lineHeight: '1.6' }}>
                                    Replace your direct API calls with the throttle proxy. Your APIs are now protected from spam, bots, and abuse—completely free on Cloudflare&apos;s edge network.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rate Limit Summary */}
                    <div style={{ marginTop: '40px', background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)', border: '1px solid #FED7AA', borderRadius: '16px', padding: '32px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#18181B', marginBottom: '20px' }}>Default Rate Limits</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>90</div>
                                <div style={{ fontSize: '13px', color: '#52525B' }}>req/min • Trusted</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B' }}>60</div>
                                <div style={{ fontSize: '13px', color: '#52525B' }}>req/min • Normal</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#EF4444' }}>18</div>
                                <div style={{ fontSize: '13px', color: '#52525B' }}>req/min • Bot/Suspicious</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: '#71717A', marginTop: '20px', textAlign: 'center' }}>
                            Customize these values in the <code style={{ color: 'var(--accent)' }}>LIMITS</code> config in <code style={{ color: 'var(--accent)' }}>src/index.ts</code>
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
