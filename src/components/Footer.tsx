import React from 'react';
import Link from 'next/link';
import styles from '@/styles/components/footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <svg width="28" height="28" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <path fill="#F97316" d="M33.9 9.7l14.6 26.4L35.1 60.2a7.75 7.75 0 000 7.5l13.4 24.2-14.6 26.4a15.5 15.5 0 01-6.6-6.2L4.1 71.7a15.6 15.6 0 010-15.5l23.3-40.4a15.5 15.5 0 016.5-6.1z"/>
            <path fill="#F97316" d="M100.7 15.8l23.2 40.4a15.5 15.5 0 010 15.5L100.7 112a15.5 15.5 0 01-13.4 7.8H64l28.9-52.1a7.75 7.75 0 000-7.5L64 8.1h23.3a15.5 15.5 0 0113.4 7.7z"/>
            <path fill="#FBBF24" d="M40.7 119.9c-2.4 0-4.8-.6-6.9-1.6l28.7-51.7a5.35 5.35 0 000-5.2L33.9 9.7a15.5 15.5 0 016.9-1.6h23.3l28.9 52.1a7.75 7.75 0 010 7.5l-28.9 52.1H40.7z"/>
          </svg>
          <span className={styles.logoText}>workerscando.com</span>
        </Link>
        
        <div className={styles.builtWith}>
          Built with
          <span className={styles.iconWrapper}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className={styles.icon}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"><path d="M2 20c0 12.15 6 22 18 22s18-9.85 18-22H2Z" clipRule="evenodd"/><path d="M20 14V6m10 8v-4m-20 4v-4m26.19 20.623c.99-2.584 1.574-5.486 1.752-8.572c.345-.034.698-.051 1.058-.051c3.866 0 7 2.015 7 4.5S42.866 31 39 31c-1 0-1.95-.135-2.81-.377Z"/></g></svg>
          </span>
          and Cloudflare Workers
        </div>
        
        <div className={styles.socialLinks}>
          <a href="https://x.com/mdanassaif" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X (Twitter)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://github.com/mdanassaif/workerscando" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;