import React from 'react';
import styles from '@/styles/components/why-workers.module.css';

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: 'Lightning Fast',
    desc: 'Sub-millisecond cold starts',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Global Edge',
    desc: '300+ locations worldwide',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'Cost Effective',
    desc: 'Pay only for what you use',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Secure by Default',
    desc: 'Built-in DDoS protection',
  },
];

const WhyWorkers: React.FC = () => {
  return (
    <div className={styles.section}>
      <div className={styles.inner}>

        <div className={styles.introBlock}>
          <p className={styles.label}>The platform</p>
          <h2 className={styles.title}>Why the edge</h2>
          <p className={styles.desc}>
            Workers run close to users—low latency, no servers to babysit. Each
            tool here is small, focused, and deployed on Cloudflare Workers so
            you can try ideas in minutes, not days.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.feature}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.challengeBlock}>
          <div className={styles.cbDecor} aria-hidden />
          <div className={styles.cbContent}>
            <div className={styles.cbText}>
              <p className={styles.cbLabel}>Open source</p>
              <h2 className={styles.cbTitle}>Contribute</h2>
              <p className={styles.cbDesc}>
                Suggest a tool or open a PR—good ideas ship as part of the hundred.
              </p>
            </div>

            <div className={styles.cbActions}>
              <a
                href="https://github.com/mdanassaif/workerscando/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Suggest a tool
              </a>

              <a
                href="https://github.com/mdanassaif/workerscando"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnSecondary}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                </svg>
                Repository
              </a>

              <a
                href="https://x.com/mdanassaif"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnSecondary}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Updates
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WhyWorkers;
