'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import layout from '@/styles/components/split-layout.module.css';

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
        remaining: 60
    });

    const [requestCount, setRequestCount] = useState(0);
    const [requestsInWindow, setRequestsInWindow] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const simulationInterval = useRef<NodeJS.Timeout | null>(null);

    const [config, setConfig] = useState({
        trustedLimit: 90,
        normalLimit: 60,
        botLimit: 10,
        windowDuration: 10,
        trustedThreshold: 65,
        botThreshold: 35
    });
    const [showConfig, setShowConfig] = useState(false);

    const stateRef = useRef({
        score: 50,
        requestsInWindow: 0,
        windowStart: Date.now(),
        lastRequestTime: 0
    });
    const configRef = useRef(config);

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const WORKER_URL = 'https://apithrottle.workerscando.workers.dev';

    const makeRequest = () => {
        setLoading(true);
        const startTime = Date.now();
        const now = Date.now();

        const timeDelta = stateRef.current.lastRequestTime > 0
            ? now - stateRef.current.lastRequestTime
            : 1000;
        stateRef.current.lastRequestTime = now;

        const windowMs = configRef.current.windowDuration * 1000;
        if (now - stateRef.current.windowStart > windowMs) {
            stateRef.current.windowStart = now;
            stateRef.current.requestsInWindow = 0;
        }

        let newScore = stateRef.current.score;
        if (timeDelta < 300) newScore = Math.max(0, newScore - 12);
        else if (timeDelta < 800) newScore = Math.max(0, newScore - 5);
        else if (timeDelta > 2000) newScore = Math.min(100, newScore + 8);
        else newScore = Math.min(100, newScore + 2);

        stateRef.current.score = newScore;
        const cfg = configRef.current;
        let classification = 'normal';
        if (newScore >= cfg.trustedThreshold) classification = 'trusted';
        else if (newScore < cfg.botThreshold) classification = 'bot';

        const limit = classification === 'bot' ? cfg.botLimit
            : classification === 'trusted' ? cfg.trustedLimit : cfg.normalLimit;

        let decision: 'allow' | 'soft' | 'block' = 'allow';
        if (newScore < 10) decision = 'block';
        else if (stateRef.current.requestsInWindow >= limit) decision = 'block';
        else if (stateRef.current.requestsInWindow >= limit * 0.8) decision = 'soft';

        stateRef.current.requestsInWindow++;
        const currentReqs = stateRef.current.requestsInWindow;
        setRequestsInWindow(currentReqs);

        const newHeaders = {
            'x-throttle-status': decision,
            'x-throttle-score': newScore.toString(),
            'x-throttle-classification': classification,
            'x-throttle-remaining': Math.max(0, limit - currentReqs).toString()
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
                status: "Success",
                title: "delectus aut autem",
                _metadata: {
                    latency: `${Date.now() - startTime}ms`,
                    windowRemaining: `${Math.ceil((windowMs - (now - stateRef.current.windowStart)) / 1000)}s`
                }
            });
        }

        setRequestCount(prev => prev + 1);
        setLoading(false);
    };

    const startSimulation = (speed: 'fast' | 'normal' | 'slow') => {
        if (simulationInterval.current) clearInterval(simulationInterval.current);
        stateRef.current = { score: 50, requestsInWindow: 0, windowStart: Date.now(), lastRequestTime: 0 };
        setThrottleState({ decision: 'allow', score: 50, classification: 'normal', remaining: 60 });
        setRequestsInWindow(0);
        setIsSimulating(true);

        const intervalMs = speed === 'fast' ? 150 : speed === 'normal' ? 1200 : 3500;
        makeRequest();
        simulationInterval.current = setInterval(makeRequest, intervalMs);
    };

    const stopSimulation = () => {
        if (simulationInterval.current) clearInterval(simulationInterval.current);
        setIsSimulating(false);
    };

    useEffect(() => {
        return () => { if (simulationInterval.current) clearInterval(simulationInterval.current); };
    }, []);

    const [copied, setCopied] = useState(false);

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
                        <span className={layout.liveTag}>
                            <span className={layout.liveDot} /> Live
                        </span>
                    </div>
                    
                    <h1 className={layout.title}>{project.name}</h1>
                    <p className={layout.description}>
                        Intelligent rate limiting with behavioral scoring. Automatically detects and blocks bots while giving trusted users higher limits.
                    </p>
                </div>

                <div className={layout.leftBody}>
                    <div className={layout.field}>
                        <label className={layout.label}>Target API URL</label>
                        <input
                            className={layout.input}
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                        />
                    </div>

                    <button 
                        className={layout.primaryBtn} 
                        onClick={() => makeRequest()}
                        disabled={loading || isSimulating}
                    >
                        {loading ? 'Sending Request...' : 'Send Single Request'}
                    </button>

                    <div style={{ padding: '24px 0', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', marginTop: '16px' }}>
                        <h3 className={layout.label} style={{ marginBottom: '12px', fontSize: '13px' }}>Traffic Simulator</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                            <button 
                                onClick={() => startSimulation('fast')}
                                style={{ padding: '8px', background: isSimulating ? '#F3F4F6' : '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                            >Bot (200ms)</button>
                            <button 
                                onClick={() => startSimulation('normal')}
                                style={{ padding: '8px', background: isSimulating ? '#F3F4F6' : '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                            >Normal (1s)</button>
                            <button 
                                onClick={() => startSimulation('slow')}
                                style={{ padding: '8px', background: isSimulating ? '#F3F4F6' : '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                            >Slow (3s)</button>
                        </div>

                        {isSimulating && (
                            <button 
                                className={layout.secondaryBtn} 
                                onClick={stopSimulation}
                                style={{ color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
                            >
                                Stop Simulation
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <button 
                            className={layout.secondaryBtn} 
                            onClick={() => setShowConfig(!showConfig)}
                            style={{ background: showConfig ? '#F3F4F6' : 'transparent', border: 'none', justifyContent: 'flex-start', padding: 0 }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" />
                            </svg>
                            {showConfig ? 'Hide Configuration' : 'Show Configuration'}
                        </button>

                        {showConfig && (
                            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className={layout.field}>
                                    <label className={layout.label} style={{ fontSize: '11px', color: '#10B981' }}>Trusted Limit (reqs)</label>
                                    <input type="number" className={layout.input} value={config.trustedLimit} onChange={(e) => setConfig({ ...config, trustedLimit: parseInt(e.target.value) || 90 })} disabled={isSimulating}/>
                                </div>
                                <div className={layout.field}>
                                    <label className={layout.label} style={{ fontSize: '11px', color: '#F59E0B' }}>Normal Limit (reqs)</label>
                                    <input type="number" className={layout.input} value={config.normalLimit} onChange={(e) => setConfig({ ...config, normalLimit: parseInt(e.target.value) || 60 })} disabled={isSimulating}/>
                                </div>
                                <div className={layout.field}>
                                    <label className={layout.label} style={{ fontSize: '11px', color: '#EF4444' }}>Bot Limit (reqs)</label>
                                    <input type="number" className={layout.input} value={config.botLimit} onChange={(e) => setConfig({ ...config, botLimit: parseInt(e.target.value) || 10 })} disabled={isSimulating}/>
                                </div>
                                <div className={layout.field}>
                                    <label className={layout.label} style={{ fontSize: '11px' }}>Window (sec)</label>
                                    <input type="number" className={layout.input} value={config.windowDuration} onChange={(e) => setConfig({ ...config, windowDuration: parseInt(e.target.value) || 10 })} disabled={isSimulating}/>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </aside>

            {/* ── RIGHT PANEL ── */}
            <main className={layout.rightPanel}>
                <header className={layout.rightHeader}>
                    <span>Live Telemetry</span>
                    <span>{requestCount} Total Requests</span>
                </header>

                <div className={layout.rightBody}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        
                        {/* Reputation Card */}
                        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '16px' }}>Reputation Score</div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1, color: throttleState.score < 35 ? '#DC2626' : throttleState.score < 65 ? '#D97706' : '#059669' }}>
                                    {Math.round(throttleState.score)}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                                    {throttleState.classification}
                                </span>
                            </div>
                            <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    background: throttleState.score < 35 ? '#DC2626' : throttleState.score < 65 ? '#D97706' : '#059669', 
                                    width: `${throttleState.score}%` 
                                }} />
                            </div>
                            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '12px' }}>
                                Used {requestsInWindow} of {throttleState.classification === 'bot' ? config.botLimit : throttleState.classification === 'trusted' ? config.trustedLimit : config.normalLimit} inside {config.windowDuration}s window
                            </div>
                        </div>

                        {/* Decision Card */}
                        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '16px' }}>Traffic Decision</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ padding: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 600, borderRadius: '4px', background: throttleState.decision === 'allow' ? '#ECFDF5' : '#F9FAFB', color: throttleState.decision === 'allow' ? '#059669' : '#9CA3AF' }}>ALLOW</div>
                                <div style={{ padding: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 600, borderRadius: '4px', background: throttleState.decision === 'soft' ? '#FFFBEB' : '#F9FAFB', color: throttleState.decision === 'soft' ? '#D97706' : '#9CA3AF' }}>SOFT LIMIT</div>
                                <div style={{ padding: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 600, borderRadius: '4px', background: throttleState.decision === 'block' ? '#FEF2F2' : '#F9FAFB', color: throttleState.decision === 'block' ? '#DC2626' : '#9CA3AF' }}>BLOCK</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                            Response Preview
                            <span style={{ color: '#6B7280', fontWeight: 400 }}>{response ? (response.error ? 'Blocked 429' : 'Success 200') : 'Idle'}</span>
                        </div>
                        <div style={{ padding: '16px', background: '#F9FAFB', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#374151' }}>
                            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                                <div style={{ color: '#6B7280', marginBottom: '8px' }}>// Injected Throttle Headers</div>
                                x-throttle-status: {throttleState.decision}<br/>
                                x-throttle-score: {Math.round(throttleState.score)}<br/>
                                x-throttle-classification: {throttleState.classification}<br/>
                                x-throttle-remaining: {throttleState.remaining}<br/>
                            </div>
                            
                            <div style={{ color: '#6B7280', marginBottom: '8px' }}>// JSON Payload</div>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                {response ? JSON.stringify(response, null, 2) : 'No requests yet...'}
                            </pre>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
