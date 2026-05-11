import React from 'react';
import Link from 'next/link';
import styles from '@/styles/components/footer.module.css';

const otherProducts = [
  { name: 'BruhGrow', url: 'https://bruhgrow.com' },
  { name: 'ListYourIdea', url: 'https://listyouridea.com' },
  { name: 'PPTs', url: 'https://ppts.app' },
  { name: 'TrustSEO', url: 'https://trustseo.me' },
  { name: 'WorkTracks', url: 'https://worktracks.xyz' },
  { name: 'MarketingDB', url: 'https://marketingdb.live' },
  { name: 'HalfBill', url: 'https://halfbill.xyz' },
  { name: 'EarlyGrad', url: 'https://earlygrad.network' },
  { name: 'IconsRoom', url: 'https://iconsroom.com' },
  { name: 'TwitterX', url: 'https://twitterx.tech' },
  { name: 'Portfolio', url: 'https://mdanassaif.me' },
];

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.brandLink}>
              <span className={styles.brandMark} aria-hidden>
                <svg width="24" height="24" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#F97316" d="M33.9 9.7l14.6 26.4L35.1 60.2a7.75 7.75 0 000 7.5l13.4 24.2-14.6 26.4a15.5 15.5 0 01-6.6-6.2L4.1 71.7a15.6 15.6 0 010-15.5l23.3-40.4a15.5 15.5 0 016.5-6.1z"/>
                  <path fill="#F97316" d="M100.7 15.8l23.2 40.4a15.5 15.5 0 010 15.5L100.7 112a15.5 15.5 0 01-13.4 7.8H64l28.9-52.1a7.75 7.75 0 000-7.5L64 8.1h23.3a15.5 15.5 0 0113.4 7.7z"/>
                  <path fill="#FBBF24" d="M40.7 119.9c-2.4 0-4.8-.6-6.9-1.6l28.7-51.7a5.35 5.35 0 000-5.2L33.9 9.7a15.5 15.5 0 016.9-1.6h23.3l28.9 52.1a7.75 7.75 0 010 7.5l-28.9 52.1H40.7z"/>
                </svg>
              </span>
              <span className={styles.brandName}>
                workers<span className={styles.brandAccent}>can</span>do
              </span>
            </Link>
            <p className={styles.tagline}>
              Tiny tools on Cloudflare Workers—fast, free, open source.
            </p>
            <div className={styles.socialRow}>
              <span className={styles.socialLabel}>Socials</span>
              <div className={styles.socialIcons}>
                <a
                  href="https://x.com/mdanassaif"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  aria-label="X (Twitter)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/mdanassaif/workerscando"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  aria-label="GitHub"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <nav className={styles.col} aria-labelledby="footer-links-heading">
            <h2 id="footer-links-heading" className={styles.colTitle}>
              Links
            </h2>
            <ul className={styles.list}>
              <li>
                <Link href="/" className={styles.listLink}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/projects" className={styles.listLink}>
                  Tools
                </Link>
              </li>
              <li>
                <Link href="/docs" className={styles.listLink}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.listLink}>
                  About
                </Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.col} aria-labelledby="footer-products-heading">
            <h2 id="footer-products-heading" className={styles.colTitle}>
              Other products
            </h2>
            <ul className={styles.list}>
              {otherProducts.map((product) => (
                <li key={product.name}>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.listLink}
                  >
                    {product.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-labelledby="footer-company-heading">
            <h2 id="footer-company-heading" className={styles.colTitle}>
              Company
            </h2>
            <ul className={styles.list}>
              <li>
                <a href="mailto:iamanassaif@gmail.com" className={styles.listLink}>
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/mdanassaif/workerscando/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.listLink}
                >
                  Feedback
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>© WorkersCanDo {year}</p>
          <p className={styles.attribution}>Edge · Open source</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
