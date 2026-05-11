'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { projects } from '@/lib/projects';
import styles from '@/styles/components/project-nav.module.css';

export default function ProjectNav() {
  const pathname = usePathname();

  const match = pathname.match(/^\/projects\/([^/]+)$/);
  if (!match) return null;

  const slug = match[1];
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;
  const current = projects[index];

  return (
    <div className={styles.bar}>

      {/* Logo home link */}
      <Link href="/" className={styles.logo}>
        <svg width="20" height="20" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
          <path fill="#F97316" d="M33.9 9.7l14.6 26.4L35.1 60.2a7.75 7.75 0 000 7.5l13.4 24.2-14.6 26.4a15.5 15.5 0 01-6.6-6.2L4.1 71.7a15.6 15.6 0 010-15.5l23.3-40.4a15.5 15.5 0 016.5-6.1z"/>
          <path fill="#F97316" d="M100.7 15.8l23.2 40.4a15.5 15.5 0 010 15.5L100.7 112a15.5 15.5 0 01-13.4 7.8H64l28.9-52.1a7.75 7.75 0 000-7.5L64 8.1h23.3a15.5 15.5 0 0113.4 7.7z"/>
          <path fill="#FBBF24" d="M40.7 119.9c-2.4 0-4.8-.6-6.9-1.6l28.7-51.7a5.35 5.35 0 000-5.2L33.9 9.7a15.5 15.5 0 016.9-1.6h23.3l28.9 52.1a7.75 7.75 0 010 7.5l-28.9 52.1H40.7z"/>
        </svg>
        <span className={styles.logoText}>wcd</span>
      </Link>

      <div className={styles.divider} />

      {/* Prev */}
      <div className={styles.side}>
        {prev ? (
          <Link href={`/projects/${prev.slug}`} className={styles.navBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className={styles.navBtnInner}>
              <span className={styles.navBtnDay}>Day {prev.day}</span>
              <span className={styles.navBtnName}>{prev.name}</span>
            </span>
          </Link>
        ) : <span />}
      </div>

      {/* Counter */}
      <Link href="/projects" className={styles.counter}>
        <span>{current.day}</span>
        <span className={styles.counterSep}>/</span>
        <span>{projects.length}</span>
      </Link>

      {/* Next */}
      <div className={`${styles.side} ${styles.sideRight}`}>
        {next ? (
          <Link href={`/projects/${next.slug}`} className={`${styles.navBtn} ${styles.navBtnRight}`}>
            <span className={styles.navBtnInner}>
              <span className={styles.navBtnDay}>Day {next.day}</span>
              <span className={styles.navBtnName}>{next.name}</span>
            </span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        ) : <span />}
      </div>

    </div>
  );
}
