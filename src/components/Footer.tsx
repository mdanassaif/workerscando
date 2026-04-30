import React from 'react';
import styles from '@/styles/components/footer.module.css';

const otherProducts = [
  { name: 'BruhGrow', url: 'https://bruhgrow.com' },
  { name: 'ListYourIdea', url: 'https://listyouridea.com' },
  { name: 'PPTs', url: 'https://ppts.app' },
  { name: 'TrustSEO', url: 'https://trustseo.me' },
  { name: 'WorkTracks', url: 'https://worktracks.xyz' },
  { name: 'MarketingDB', url: 'https://marketingdb.live' },
  { name: 'WorkersCanDo', url: 'https://workerscando.com' },
  { name: 'HalfBill', url: 'https://halfbill.xyz' },
  { name: 'EarlyGrad', url: 'https://earlygrad.network' },
  { name: 'IconsRoom', url: 'https://iconsroom.com' },
  { name: 'TwitterX', url: 'https://twitterx.tech' },
  { name: 'portfolio', url: 'https://mdanassaif.me' },
];

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.productsBlock}>
          <p className={styles.productsTitle}>Other Products:</p>
          <div className={styles.productsList}>
            {otherProducts.map((product) => (
              <a
                key={product.name}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.productLink}
              >
                {product.name}
              </a>
            ))}
          </div>
        </div>

        <div className={styles.bottomRow}>
          <p className={styles.copyright}>
            © {year} WorkersCanDo. All rights reserved.
          </p>
          <div className={styles.metaLinks}>
            <a href="/docs" className={styles.metaLink}>
              Docs
            </a>
            <a href="/about" className={styles.metaLink}>
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;