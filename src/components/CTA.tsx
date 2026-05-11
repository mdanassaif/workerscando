import React from 'react';
import styles from '@/styles/components/cta.module.css';

const CTA: React.FC = () => {
  return (
    <section className={styles.wrap} aria-labelledby="principles-heading">
      <p id="principles-heading" className={styles.sectionLabel}>
        Principles
      </p>
      <div className={styles.commitList}>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>01</p>
          <p className={styles.ciTitle}>One tool a day</p>
          <p className={styles.ciTag}>Pacing</p>
        </div>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>02</p>
          <p className={styles.ciTitle}>No sign-in required</p>
          <p className={styles.ciTag}>Frictionless</p>
        </div>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>03</p>
          <p className={styles.ciTitle}>Open source</p>
          <p className={styles.ciTag}>Community</p>
        </div>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>04</p>
          <p className={styles.ciTitle}>Edge-native</p>
          <p className={styles.ciTag}>Performance</p>
        </div>
        <div className={styles.commitItem}>
          <p className={styles.ciNum}>05</p>
          <p className={styles.ciTitle}>Free to use</p>
          <p className={styles.ciTag}>Access</p>
        </div>
      </div>
    </section>
  );
};

export default CTA;