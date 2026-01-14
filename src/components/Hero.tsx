import React from 'react';
import Link from 'next/link';
import styles from '@/styles/components/hero.module.css';

interface Stat {
  number: string;
  label: string;
}

const Hero: React.FC = () => {
  const stats: Stat[] = [
    { number: "100", label: "Tools Planned" },
    { number: "2", label: "Live Now" },
    { number: "98", label: "Days to Go" }
  ];

  return (
    <section className={styles.heroSection}>
      <div className={styles.gradientCircle1} />
      <div className={styles.gradientCircle2} />
      
      <div className={`animate-fade-in ${styles.content}`}>
        <div className={styles.badge}>
          <span className={`${styles.liveDot} live-dot`} />
          <span className={styles.badgeText}>
            100 TOOLS IN 100 DAYS
          </span>
        </div>
        
        <h1 className={`animate-fade-in delay-1 ${styles.title}`}>
          Tiny tools, built on<br/>
          <span className={styles.titleGradient}>Cloudflare Workers</span>
        </h1>
        
        <p className={`animate-fade-in delay-2 ${styles.subtitle}`}>
          A collection of 100 micro-tools powered by the edge. 
          One new tool, every single day.
        </p>
        
        <div className={`animate-fade-in delay-3 ${styles.actionsContainer}`}>
          <Link 
            href="/projects"
            className={`btn-primary ${styles.primaryButton}`}
          >
            Explore Tools
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link 
            href="/docs"
            className={styles.secondaryButton}
          >
            Read Docs
          </Link>
        </div>
      </div>

      <div className={`animate-fade-in delay-4 ${styles.statsContainer}`}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <div className={styles.statNumber}>{stat.number}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;