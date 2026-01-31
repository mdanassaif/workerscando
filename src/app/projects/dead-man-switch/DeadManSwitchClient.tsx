'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import { Navbar, Footer, LinksSection } from '@/components';

// --- STYLES ---
// (Normally we'd use CSS modules, but for speed and consistency with requested "niceness", I'll inline standard styles or use a new module)
import styles from './dead-man-switch.module.css';

interface DeadManSwitchClientProps {
    project: Project;
}

export default function DeadManSwitchClient({ project }: DeadManSwitchClientProps) {
    // State
    const [step, setStep] = useState<'arm' | 'armed'>('arm');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{
        message: string;
        workflowId: string;
        checkInUrl: string;
    } | null>(null);

    // Form Data
    const [secret, setSecret] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [nextOfKinEmail, setNextOfKinEmail] = useState('');
    const [delay, setDelay] = useState('7 days');

    // Hardcoded for demo - usually env var
    const WORKER_URL = 'https://dead-man-switch.brogee9o9.workers.dev'; // Prod URL

    const handleArm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // In a real app, you'd proxy this through Next.js API or enable CORS on Worker
            const res = await fetch(`${WORKER_URL}/arm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret,
                    userEmail,
                    nextOfKinEmail,
                    checkInDelay: delay,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to arm switch');
            }

            const data = await res.json();
            setResult(data);
            setStep('armed');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to connect to the Dead Man Switch Worker.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (result) {
            navigator.clipboard.writeText(result.checkInUrl);
            alert('Check-in URL copied!');
        }
    };

    return (
        <main>
            <Navbar />

            <section className={styles.heroSection}>
                <div className={styles.container}>
                    <div className={styles.badgesContainer}>
                        <span className={styles.dayBadge}>Day {project.day}</span>
                    </div>

                    <h1 className={styles.title}>{project.name}</h1>

                    <p className={styles.description}>
                        A serverless dead man's switch. Encrypts your secrets and emails them to your next of kin only if you don't check in. Powered by Cloudflare Workflows.
                    </p>
                </div>
            </section>

            <section className={styles.demoSection}>
                <div className={styles.container}>
                    <div className={styles.demoCard}>

                        {step === 'arm' && (
                            <form onSubmit={handleArm} className={styles.form}>
                                <h2 className={styles.cardTitle}>Arm the Switch</h2>

                                <div className={styles.inputGroup}>
                                    <label>Your Secret</label>
                                    <textarea
                                        required
                                        value={secret}
                                        onChange={(e) => setSecret(e.target.value)}
                                        placeholder="My bitcoin private key is..."
                                        className={styles.textarea}
                                    />
                                    <span className={styles.hint}>This is stored securely and only revealed if you disappear.</span>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label>Your Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={userEmail}
                                            onChange={(e) => setUserEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Recipient Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={nextOfKinEmail}
                                            onChange={(e) => setNextOfKinEmail(e.target.value)}
                                            placeholder="friend@example.com"
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Check In Every</label>
                                    <select
                                        value={delay}
                                        onChange={(e) => setDelay(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="1 minute">1 Minute (For Testing)</option>
                                        <option value="1 hour">1 Hour</option>
                                        <option value="1 day">1 Day</option>
                                        <option value="7 days">7 Days</option>
                                        <option value="30 days">30 Days</option>
                                    </select>
                                </div>

                                {error && <div className={styles.error}>{error}</div>}

                                <button type="submit" disabled={isLoading} className={styles.primaryButton}>
                                    {isLoading ? 'Arming System...' : 'Arm Switch'}
                                </button>
                            </form>
                        )}

                        {step === 'armed' && result && (
                            <div className={styles.resultView}>
                                <div className={styles.successIcon}>✅</div>
                                <h2 className={styles.cardTitle}>System Armed</h2>
                                <p className={styles.resultText}>
                                    The Dead Man's Switch is active. We will wait <strong>{delay}</strong> for you to check in.
                                </p>

                                <div className={styles.urlBox}>
                                    <label>Your Check-In URL</label>
                                    <div className={styles.codeBlock}>
                                        <code>{result.checkInUrl}</code>
                                        <button onClick={handleCopyLink} className={styles.copyBtn}>Copy</button>
                                    </div>
                                    <p className={styles.hint}>
                                        We've also emailed this to you. Visit this link to prove you're alive.
                                    </p>
                                </div>

                                <button onClick={() => setStep('arm')} className={styles.secondaryButton}>
                                    Create Another
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.howItWorks}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>How it works</h2>
                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <span className={styles.stepNum}>1</span>
                            <h3>Values Privacy</h3>
                            <p>We believe your data is yours. Using Cloudflare's localized encryption, your secrets are encrypted before storage.</p>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.stepNum}>2</span>
                            <h3>Stateful Sleep</h3>
                            <p>Unlike a cron job, the Worker literally "sleeps" for days using <code>await step.sleep()</code>. No compute cost.</p>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.stepNum}>3</span>
                            <h3>Event Waiting</h3>
                            <p>It wakes up and waits for a specific <code>user_checked_in</code> event using <code>waitForEvent</code>.</p>
                        </div>
                        <div className={styles.step}>
                            <span className={styles.stepNum}>4</span>
                            <h3>Trigger</h3>
                            <p>If the event never comes, the timeout logic runs and releases the secret key to the recipient.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.apiSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>API Reference</h2>

                    {/* Arm Endpoint */}
                    <div className={styles.apiCard}>
                        <div className={styles.apiMethod}>
                            <span className={styles.methodBadge}>POST</span>
                            <code className={styles.apiEndpoint}>{WORKER_URL}/arm</code>
                        </div>
                        <p className={styles.apiDescription}>Arm a new Dead Man&apos;s Switch and start the countdown</p>

                        <div className={styles.parametersTable}>
                            <div className={styles.tableHeader}>
                                <div className={styles.tableCell}>Parameter</div>
                                <div className={styles.tableCell}>Description</div>
                            </div>
                            <div className={styles.tableRow}>
                                <div className={styles.tableCell}>
                                    <code className={styles.paramName}>secret</code>
                                    <span className={styles.required}>required</span>
                                </div>
                                <div className={styles.tableCell}>The secret message to encrypt and send if you don&apos;t check in</div>
                            </div>
                            <div className={styles.tableRow}>
                                <div className={styles.tableCell}>
                                    <code className={styles.paramName}>userEmail</code>
                                    <span className={styles.required}>required</span>
                                </div>
                                <div className={styles.tableCell}>Your email address (receives check-in URL)</div>
                            </div>
                            <div className={styles.tableRow}>
                                <div className={styles.tableCell}>
                                    <code className={styles.paramName}>nextOfKinEmail</code>
                                    <span className={styles.required}>required</span>
                                </div>
                                <div className={styles.tableCell}>Recipient&apos;s email (receives secret if triggered)</div>
                            </div>
                            <div className={styles.tableRow}>
                                <div className={styles.tableCell}>
                                    <code className={styles.paramName}>checkInDelay</code>
                                    <span className={styles.optional}>optional</span>
                                </div>
                                <div className={styles.tableCell}>How long to wait before triggering (e.g., &quot;7 days&quot;, &quot;1 hour&quot;)</div>
                            </div>
                        </div>

                        <div className={styles.exampleBox}>
                            <div className={styles.exampleHeader}>
                                <div className={styles.exampleTabs}>
                                    <span className={`${styles.exampleTab} ${styles.exampleTabActive}`}>cURL</span>
                                </div>
                            </div>
                            <div className={styles.exampleCode}>
                                <code>{`curl -X POST "${WORKER_URL}/arm" \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret": "My secret message",
    "userEmail": "you@example.com",
    "nextOfKinEmail": "friend@example.com",
    "checkInDelay": "7 days"
  }'`}</code>
                            </div>
                        </div>
                    </div>

                    {/* Check-in Endpoint */}
                    <div className={styles.apiCard}>
                        <div className={styles.apiMethod}>
                            <span className={styles.methodBadge}>GET</span>
                            <code className={styles.apiEndpoint}>{WORKER_URL}/check-in/{'{workflowId}'}</code>
                        </div>
                        <p className={styles.apiDescription}>Check in to reset the countdown timer</p>

                        <div className={styles.parametersTable}>
                            <div className={styles.tableHeader}>
                                <div className={styles.tableCell}>Parameter</div>
                                <div className={styles.tableCell}>Description</div>
                            </div>
                            <div className={styles.tableRow}>
                                <div className={styles.tableCell}>
                                    <code className={styles.paramName}>workflowId</code>
                                    <span className={styles.required}>required</span>
                                </div>
                                <div className={styles.tableCell}>The workflow ID returned when arming (path parameter)</div>
                            </div>
                        </div>

                        <div className={styles.exampleBox}>
                            <div className={styles.exampleHeader}>
                                <div className={styles.exampleTabs}>
                                    <span className={`${styles.exampleTab} ${styles.exampleTabActive}`}>cURL</span>
                                </div>
                            </div>
                            <div className={styles.exampleCode}>
                                <code>{`curl "${WORKER_URL}/check-in/abc123-def456"`}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <LinksSection />

            <Footer />
        </main>
    );
}
