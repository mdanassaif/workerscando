'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import styles from './dead-man-switch.module.css';

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

// SVG Icons
const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const ZapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const DollarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const KeyIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);

const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function DeadManSwitchClient({ project }: DeadManSwitchClientProps) {
    const [formData, setFormData] = useState<FormData>({
        secret: '',
        ownerEmail: '',
        recipientEmail: '',
        checkInterval: 43200, // Monthly default
    });
    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState<SuccessData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Generate encryption key from password
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
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Encrypt secret
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

    // Generate random password for encryption
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
            // Generate encryption password and encrypt secret
            const password = generatePassword();
            const { encrypted, salt, iv } = await encryptSecret(formData.secret, password);

            // Store password in encrypted secret (this is sent to recipient)
            const encryptedPackage = btoa(JSON.stringify({
                encryptedSecret: encrypted,
                password: password,
                salt: salt,
                iv: iv
            }));

            // Send to API
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

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    function createAnother() {
        setSuccessData(null);
        setFormData({
            secret: '',
            ownerEmail: '',
            recipientEmail: '',
            checkInterval: 43200,
        });
    }

    return (
        <>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.container}>
                    <div className={styles.badgesContainer}>
                        <span className={styles.dayBadge}>Day {project.day}</span>
                        <span className={styles.freeBadge}>100% FREE</span>
                    </div>

                    <h1 className={styles.title}>{project.name}</h1>
                    <p className={styles.description}>
                        A secure, serverless dead man&apos;s switch that automatically delivers encrypted secrets to designated recipients if you fail to respond to regular check-ins.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className={styles.formSection}>
                <div className={styles.container}>
                    <div className={styles.formCard}>
                        <h2 className={styles.formTitle}>Create Your Switch</h2>
                        <p className={styles.formDescription}>
                            Set up a secret that will be automatically delivered if you fail to respond to regular check-ins.
                        </p>

                        {error && (
                            <div className={`${styles.alert} ${styles.alertError}`}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                {/* Owner Email */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Your Email</label>
                                    <input
                                        type="email"
                                        name="ownerEmail"
                                        className={styles.input}
                                        placeholder="you@example.com"
                                        value={formData.ownerEmail}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <span className={styles.hint}>
                                        Check-in emails will be sent here
                                    </span>
                                </div>

                                {/* Recipient Email */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Recipient&apos;s Email</label>
                                    <input
                                        type="email"
                                        name="recipientEmail"
                                        className={styles.input}
                                        placeholder="trusted@person.com"
                                        value={formData.recipientEmail}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <span className={styles.hint}>
                                        This person will receive your secret
                                    </span>
                                </div>

                                {/* Check Interval */}
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.label}>Check Interval</label>
                                    <select
                                        name="checkInterval"
                                        className={styles.select}
                                        value={formData.checkInterval}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="1">Every Minute (Testing)</option>
                                        <option value="60">Hourly</option>
                                        <option value="1440">Daily</option>
                                        <option value="10080">Weekly</option>
                                        <option value="43200">Monthly</option>
                                    </select>
                                </div>

                                {/* Secret */}
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <div className={styles.secretBox}>
                                        <div className={styles.secretLabel}>
                                            <KeyIcon />
                                            <span>Your Secret</span>
                                        </div>
                                        <textarea
                                            name="secret"
                                            className={`${styles.input} ${styles.textarea}`}
                                            placeholder="Bitcoin private key, password, confession, or any secret you want to protect..."
                                            value={formData.secret}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <div className={styles.encryptionNote}>
                                            <LockIcon />
                                            <span>Encrypted in your browser using AES-256-GCM before being sent</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>Creating...</>
                                ) : (
                                    <>
                                        <LockIcon />
                                        <span>Activate Switch</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.featuresSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Features</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><LockIcon /></div>
                            <h3 className={styles.featureTitle}>End-to-End Encrypted</h3>
                            <p className={styles.featureDescription}>
                                Your secret is encrypted in your browser using AES-256-GCM. We never see your plaintext data.
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><MailIcon /></div>
                            <h3 className={styles.featureTitle}>Regular Check-Ins</h3>
                            <p className={styles.featureDescription}>
                                We&apos;ll email you at your chosen interval to verify you&apos;re alive and well.
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><ZapIcon /></div>
                            <h3 className={styles.featureTitle}>Auto-Trigger</h3>
                            <p className={styles.featureDescription}>
                                After 2 missed checks, your secret is automatically sent to your designated recipient.
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><GlobeIcon /></div>
                            <h3 className={styles.featureTitle}>Cloudflare Edge</h3>
                            <p className={styles.featureDescription}>
                                Runs on Cloudflare&apos;s global network for maximum reliability and low latency.
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><DollarIcon /></div>
                            <h3 className={styles.featureTitle}>100% Free</h3>
                            <p className={styles.featureDescription}>
                                Uses Cloudflare Workers FREE tier + external cron. No paid plans needed!
                            </p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><EyeOffIcon /></div>
                            <h3 className={styles.featureTitle}>Zero Knowledge</h3>
                            <p className={styles.featureDescription}>
                                The server never sees your unencrypted secret. True privacy by design.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className={styles.howItWorksSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>How It Works</h2>
                    <div className={styles.stepsContainer}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <div className={styles.stepContent}>
                                <h4>Create Your Switch</h4>
                                <p>Enter your secret, recipient details, and choose a check-in interval. Your secret is encrypted in your browser before being sent.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <div className={styles.stepContent}>
                                <h4>Regular Check-Ins</h4>
                                <p>You&apos;ll receive periodic emails asking you to check in. Simply click the link to confirm you&apos;re still active.</p>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <div className={styles.stepContent}>
                                <h4>Automatic Delivery</h4>
                                <p>If you miss 2 consecutive check-ins, your encrypted secret is automatically sent to your designated recipient.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* API Section */}
            <section className={styles.apiSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>API Endpoints</h2>

                    <div className={styles.apiCard}>
                        <div className={styles.apiMethod}>
                            <span className={`${styles.methodBadge} ${styles.methodPost}`}>POST</span>
                            <code className={styles.apiEndpoint}>/api/create</code>
                        </div>
                        <p className={styles.apiDescription}>Create a new dead man&apos;s switch</p>
                    </div>

                    <div className={styles.apiCard}>
                        <div className={styles.apiMethod}>
                            <span className={`${styles.methodBadge} ${styles.methodPost}`}>POST</span>
                            <code className={styles.apiEndpoint}>/api/verify/:token</code>
                        </div>
                        <p className={styles.apiDescription}>Verify check-in (proof of life)</p>
                    </div>

                    <div className={styles.apiCard}>
                        <div className={styles.apiMethod}>
                            <span className={`${styles.methodBadge} ${styles.methodGet}`}>GET</span>
                            <code className={styles.apiEndpoint}>/api/check/:id</code>
                        </div>
                        <p className={styles.apiDescription}>Get switch status</p>
                    </div>

                    <div className={styles.apiCard}>
                        <div className={styles.apiMethod}>
                            <span className={`${styles.methodBadge} ${styles.methodGet}`}>GET</span>
                            <code className={styles.apiEndpoint}>/api/decrypt/:id</code>
                        </div>
                        <p className={styles.apiDescription}>Get encrypted data for client-side decryption</p>
                    </div>

                    <div className={styles.apiCard}>
                        <div className={styles.apiMethod}>
                            <span className={`${styles.methodBadge} ${styles.methodPost}`}>POST</span>
                            <code className={styles.apiEndpoint}>/api/cron-check-all</code>
                        </div>
                        <p className={styles.apiDescription}>External cron trigger (requires auth)</p>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            {successData && (
                <div className={styles.successOverlay}>
                    <div className={styles.successModal}>
                        <div className={styles.successIcon}><CheckIcon /></div>
                        <h2 className={styles.successTitle}>Switch Activated!</h2>
                        <p className={styles.successMessage}>
                            Your Dead Man&apos;s Switch has been created successfully.
                        </p>

                        <div className={styles.infoBox}>
                            <div className={styles.infoLabel}>Switch ID</div>
                            <div className={styles.infoValue}>{successData.switchId}</div>
                        </div>

                        <div className={styles.warningBox}>
                            Check your email ({formData.ownerEmail}) for a verification link to confirm your switch is active.
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.copyButton}
                                onClick={() => copyToClipboard(successData.switchId)}
                            >
                                Copy ID
                            </button>
                            <button
                                className={styles.closeButton}
                                onClick={createAnother}
                            >
                                Create Another
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
