import React from 'react';
import styles from './LinksSection.module.css';

interface LinksSectionProps {
    className?: string;
}

export default function LinksSection({ className }: LinksSectionProps) {
    return (
        <section className={`${styles.linksSection} ${className || ''}`}>
            <div className={styles.container}>
                <div className={styles.linksContent}>
                    <p className={styles.linkLine}>
                        Wanna contribute or learn?{' '}
                        <a
                            href="https://github.com/mdanassaif/workerscando"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.inlineLink}
                        >
                            Here&apos;s the code
                        </a>
                    </p>
                    <p className={styles.linkLine}>
                        Support me on{' '}
                        <a
                            href="https://x.com/mdanassaif"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.inlineLink}
                        >
                            Twitter
                        </a>{' '}
                        for daily updates
                    </p>
                    <p className={styles.linkLine}>
                        Wanna learn why it&apos;s the best solution?{' '}
                        <a href="/docs" className={styles.inlineLink}>
                            Read the docs
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
