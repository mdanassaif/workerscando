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
         
          <h1 className={`animate-fade-in delay-1 ${styles.heroHeadline}`}>
            Tiny tools, built on<br/>
            <em>Cloudflare Workers</em>
          </h1>
          
          <p className={`animate-fade-in delay-2 ${styles.heroSub}`}>
            A collection of 100 micro-tools powered by the edge. 
          
            Currently live: <strong>{liveCount} / 100</strong>
          </p>
          
          <div className={`animate-fade-in delay-3 ${styles.heroActions}`}>
            <Link href="/projects" className={styles.btnPrimary}>
              Explore Tools 
            </Link>
            <Link href="/docs" className={styles.btnSecondary}>
              Read Docs 
            </Link>
          </div>
        </div>

        <div className={`animate-fade-in delay-4 ${styles.heroGlobeContainer}`}>
          <Globe />
        </div>
      </div>
    </section>
  );
};

export default Hero;