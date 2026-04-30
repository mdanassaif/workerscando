import React from 'react';
import Link from 'next/link';
import styles from '@/styles/components/why-workers.module.css';

const WhyWorkers: React.FC = () => {
  return (
    <div className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.introBlock}>
          <p className={styles.label}>About This Project</p>
          <h2 className={styles.title}>Why Workers?</h2>
          <p className={styles.desc}>
            Cloudflare Workers run at the edge — closer to users, faster than traditional servers. 
            This project explores what&apos;s possible when you build tiny, focused tools that leverage 
            the power of edge computing.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.feature}>
            <h3>Lightning Fast</h3>
            <p>Sub-millisecond cold starts</p>
          </div>
          <div className={styles.feature}>
            <h3>Global Edge</h3>
            <p>300+ locations worldwide</p>
          </div>
          <div className={styles.feature}>
            <h3>Cost Effective</h3>
            <p>Pay only for what you use</p>
          </div>
          <div className={styles.feature}>
            <h3>Secure by Default</h3>
            <p>Built-in DDoS protection</p>
          </div>
        </div>

        <div className={styles.challengeBlock}>
          <div className={styles.cbText}>
            <h2>Join The Challenge</h2>
            <p>Want to contribute? Have an idea for a Worker-powered tool? Submit your suggestion and it might become one of the 100!</p>
          </div>
          <div className={styles.cbActions}>
            <a href="https://github.com/mdanassaif/workerscando/issues/new" target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              Suggest a Tool →
            </a>
            <a href="https://github.com/mdanassaif/workerscando" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
              View on GitHub ↗
            </a>
            <a href="https://x.com/mdanassaif" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
              Follow Updates ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyWorkers;