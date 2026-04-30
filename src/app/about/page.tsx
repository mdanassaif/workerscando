import type { Metadata } from 'next';
import React from 'react';
import { Navbar, Footer } from '@/components';
import styles from '@/styles/pages/about.module.css';

export const metadata: Metadata = {
  title: 'About WorkersCanDo',
  description: '100 tools in 100 days. Each tool is a micro-service built on Cloudflare Workers, designed to solve a specific problem quickly and efficiently at the edge.',
  openGraph: {
    title: 'About WorkersCanDo - Building 100 Tools with Cloudflare Workers',
    description: '100 tools in 100 days. Each tool is a micro-service built on Cloudflare Workers, designed to solve a specific problem quickly and efficiently.',
    url: 'https://workerscando.com/about',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About WorkersCanDo',
    description: '100 tools in 100 days powered by Cloudflare Workers',
  },
  alternates: {
    canonical: 'https://workerscando.com/about',
  },
};

export default function AboutPage() {
  const process = [
    { step: "01", title: "Ideate", desc: "Come up with a useful micro-tool idea" },
    { step: "02", title: "Build", desc: "Code and deploy to Cloudflare Workers" },
    { step: "03", title: "Ship", desc: "Launch and share with the world" }
  ];

  const techStack = [
    { name: "Cloudflare Workers", color: "#F97316" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "Hono", color: "#E36002" },
    { name: "Next.js", color: "#000000" },
  ];

  return (
    <main className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.badge}>About</span>
            <h1 className={styles.heroTitle}>The 100 Days Challenge</h1>
            <p className={styles.heroSub}>
              Building 100 micro-tools powered by Cloudflare Workers. 
              One tool every day for 100 days straight.
            </p>
          </div>
        </section>

        {/* The Story */}
        <section className={styles.story}>
          <div className={styles.storyInner}>
            <h2 className={styles.sectionTitle}>The Story</h2>
            <div className={styles.storyText}>
              <p>
                It started with a simple idea: &quot;Get this domain workerscando.com and build 100 tiny tools based on Workers.&quot;
              </p>
              <p>
                The challenge? Ship one tool every single day for the next 100 days. No excuses, no breaks, just building.
              </p>
              <p>
                Each tool is designed to be small, focused, and useful. From URL metadata extractors to dynamic image generators, 
                every project explores what&apos;s possible when you build at the edge.
              </p>
              <p>
                This isn&apos;t just about building tools — it&apos;s about learning in public, pushing boundaries, 
                and proving that consistent small efforts lead to something big.
              </p>
            </div>
          </div>
        </section>

        {/* The Process */}
        <section className={styles.process}>
          <div className={styles.processInner}>
            <div className={styles.processTitleWrap}>
              <h2 className={styles.sectionTitle}>The Process</h2>
            </div>
            <div className={styles.processGrid}>
              {process.map((item, index) => (
                <div key={index} className={styles.processCard}>
                  <div className={styles.processStep}>{item.step}</div>
                  <div>
                    <h3 className={styles.processTitle}>{item.title}</h3>
                    <p className={styles.processDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className={styles.techStack}>
          <div className={styles.techInner}>
            <h2 className={styles.sectionTitle}>Tech Stack</h2>
            <div className={styles.techGrid}>
              {techStack.map((tech, index) => (
                <div key={index} className={styles.techChip}>
                  <div className={styles.techDot} style={{ background: tech.color }} />
                  <span className={styles.techName}>{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <span className={styles.ctaBadge}>More Coming Soon</span>
            <p className={styles.ctaText}>
              This page will be updated with more details as the challenge progresses.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}