"use client";

import React from 'react';
import { Navbar, Footer } from '@/components';
import styles from '@/styles/pages/about.module.css';

export default function AboutClient() {
  return (
    <main>
      <Navbar />
      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <span className={styles.label}>About</span>
          <h1 className={styles.title}>
            The 100 Days Challenge
          </h1>
          <p className={styles.description}>
            Building 100 micro-tools powered by Cloudflare Workers. 
            ...existing code...
          </p>
        </div>
      </section>
      {/* ...existing code... */}
      <Footer />
    </main>
  );
}
