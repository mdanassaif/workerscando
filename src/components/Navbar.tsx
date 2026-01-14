'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/components/navbar.module.css';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/about', label: 'About' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logoLink}>
        <svg width="28" height="28" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
          <path fill="#F97316" d="M33.9 9.7l14.6 26.4L35.1 60.2a7.75 7.75 0 000 7.5l13.4 24.2-14.6 26.4a15.5 15.5 0 01-6.6-6.2L4.1 71.7a15.6 15.6 0 010-15.5l23.3-40.4a15.5 15.5 0 016.5-6.1z"/>
          <path fill="#F97316" d="M100.7 15.8l23.2 40.4a15.5 15.5 0 010 15.5L100.7 112a15.5 15.5 0 01-13.4 7.8H64l28.9-52.1a7.75 7.75 0 000-7.5L64 8.1h23.3a15.5 15.5 0 0113.4 7.7z"/>
          <path fill="#FBBF24" d="M40.7 119.9c-2.4 0-4.8-.6-6.9-1.6l28.7-51.7a5.35 5.35 0 000-5.2L33.9 9.7a15.5 15.5 0 016.9-1.6h23.3l28.9 52.1a7.75 7.75 0 010 7.5l-28.9 52.1H40.7z"/>
        </svg>
        <span className={styles.logoText}>
          workers<span className={styles.logoAccent}>can</span>do
        </span>
      </Link>
      
      {/* Desktop Navigation */}
      <div className={styles.desktopNav}>
        {navLinks.map((link) => (
          <Link 
            key={link.href}
            href={link.href} 
            className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
          >
            {link.label}
            {pathname === link.href && (
              <span className={styles.navLinkIndicator} />
            )}
          </Link>
        ))}
        <a 
          href="https://github.com/mdanassaif/workerscando" 
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubButton}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={styles.mobileMenuButton}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round">
          {mobileMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={styles.mobileNav}>
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`${styles.mobileNavLink} ${pathname === link.href ? styles.mobileNavLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <a 
            href="https://github.com/mdanassaif/workerscando" 
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileNavButton}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;