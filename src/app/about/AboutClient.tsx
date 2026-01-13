"use client";

import React from 'react';
import { Navbar, Footer } from '@/components';

export default function AboutClient() {
  return (
    <main>
      <Navbar />
      {/* Hero */}
      <section style={{
        padding: '80px 48px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#F97316',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: "var(--font-mono)"
          }}>About</span>
          <h1 style={{
            fontSize: '44px',
            fontWeight: 700,
            color: '#18181B',
            marginTop: '16px',
            marginBottom: '20px',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            The 100 Days Challenge
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#71717A',
            lineHeight: 1.7
          }}>
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
