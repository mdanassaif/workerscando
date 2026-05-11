import React from 'react';
import Link from 'next/link';
import { getLiveProjects } from '@/lib/projects';
import styles from '@/styles/components/featured.module.css';

const FeaturedProjects: React.FC = () => {
  const allProjects = getLiveProjects();
  const latestNews = allProjects.slice(0, 3);

  if (latestNews.length === 0) return null;

  const pct = Math.min(100, (allProjects.length / 100) * 100);

  return (
    <section className={styles.section} aria-labelledby="featured-heading">
      <div className={styles.inner}>
        <div className={styles.progressBlock}>
          <div className={styles.progressHeader}>
            <div>
              <h2 id="featured-heading" className={styles.progressTitle}>
                Building in public
              </h2>
              <p className={styles.progressSub}>
                One tool at a time on Cloudflare Workers
              </p>
            </div>
            <div className={styles.progressMeta} aria-live="polite">
              <span className={styles.progressCount}>{allProjects.length}</span>
              <span className={styles.progressTotal}>/ 100</span>
            </div>
          </div>
          <div className={styles.progressTrack} role="progressbar" aria-valuenow={allProjects.length} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className={styles.toolbar}>
          <p className={styles.sectionLabel}>Latest</p>
          <Link href="/projects" className={styles.viewAll}>
            View all tools
            <span className={styles.viewAllIcon} aria-hidden>→</span>
          </Link>
        </div>

        <div className={styles.newsGrid}>
          {latestNews.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.slug}`}
              className={styles.cardLink}
            >
              <article className={styles.newsCard}>
                <div>
                  <span className={styles.ncTag}>
                    Day {proj.day} · {proj.tag}
                  </span>
                  <p className={styles.ncTitle}>
                    <span className={styles.ncName}>{proj.name}</span>
                    <span className={styles.ncDesc}>{proj.description}</span>
                  </p>
                </div>
                <div className={styles.ncFooter}>
                  <span className={styles.ncCta}>Open tool</span>
                  <span className={styles.ncArrow} aria-hidden>↗</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
