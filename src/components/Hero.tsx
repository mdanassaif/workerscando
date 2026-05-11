import React from 'react';
import Link from 'next/link';
import { getLiveProjects } from '@/lib/projects';
import Globe from './Globe';
import styles from '@/styles/components/hero.module.css';

const Hero: React.FC = () => {
  const liveCount = getLiveProjects().length;
  
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroWrap}>
        <div className={`animate-fade-in ${styles.heroText}`}>
          <p className={`animate-fade-in delay-1 ${styles.heroEyebrow}`}>
            Edge · Open source · Free to use
          </p>

          <h1 className={`animate-fade-in delay-2 ${styles.heroHeadline}`}>
            Small utilities,
            <br />
            <span className={styles.heroEmphasis}>running worldwide</span>
          </h1>

          <p className={`animate-fade-in delay-3 ${styles.heroSub}`}>
            WorkersCanDo ships focused tools on Cloudflare Workers—fast,
            serverless, and easy to try. Live today:{' '}
            <span className={styles.heroCount}>
              {liveCount}
              <span className={styles.heroCountSep}>/</span>100
            </span>
          </p>
          
          <div className={`animate-fade-in delay-4 ${styles.heroActions}`}>
            <Link href="/projects" className={styles.btnPrimary}>
              Browse tools
            </Link>
            <Link href="/docs" className={styles.btnSecondary}>
              Documentation
            </Link>
          </div>
        </div>

        <div className={`animate-fade-in delay-5 ${styles.heroGlobeContainer}`}>
          <Globe />
        </div>
      </div>
    </section>
  );
};

export default Hero;