import React from 'react';
import Link from 'next/link';
import { getLiveProjects } from '@/lib/projects';
import styles from '@/styles/components/featured.module.css';

const FeaturedProjects: React.FC = () => {
  const allProjects = getLiveProjects();
  const latestNews = allProjects.slice(0, 3);

  if (latestNews.length === 0) return null;

  return (
    <>
      <div className={styles.sectionTopZero} style={{ paddingTop: '96px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <p className={styles.sectionLabel} style={{ marginBottom: 0 }}>Latest Releases</p>
          <Link href="/projects" style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#4F46E5', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            View all tools <span>→</span>
          </Link>
        </div>
        <div className={styles.newsGrid}>
          {latestNews.map((proj) => (
            <Link key={proj.id} href={`/projects/${proj.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.newsCard}>
                <div>
                  <span className={styles.ncTag}>Day {proj.day} / {proj.tag}</span>
                  <p className={styles.ncTitle}><b>{proj.name}</b> — {proj.description}</p>
                </div>
                <div className={styles.ncFooter}>
                  <span className={styles.ncDate}>Explore this tool</span>
                  <span>↗</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default FeaturedProjects;