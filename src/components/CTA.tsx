import React from 'react';
import styles from '@/styles/components/cta.module.css';

const CTA: React.FC = () => {
  return (
    <>
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Our Roadmap</p>
      </div>
      <div className={styles.commitList}>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>01</p>
          <p className={styles.ciTitle}>One Tool A Day</p>
          <p className={styles.ciTag}>Pacing</p>
        </div>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>02</p>
          <p className={styles.ciTitle}>Zero Authentication Required</p>
          <p className={styles.ciTag}>Frictionless</p>
        </div>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>03</p>
          <p className={styles.ciTitle}>Open Source Always</p>
          <p className={styles.ciTag}>Community</p>
        </div>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>04</p>
          <p className={styles.ciTitle}>Edge Deployed Native</p>
          <p className={styles.ciTag}>Performance</p>
        </div>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>05</p>
          <p className={styles.ciTitle}>Free Forever</p>
          <p className={styles.ciTag}>Accessibility</p>
        </div>
      </div>
    </>
  );
};

export default CTA;