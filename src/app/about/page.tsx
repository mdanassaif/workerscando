import type { Metadata } from 'next';
import React from 'react';
import { Navbar, Footer } from '@/components';

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
            One tool every day for 100 days straight.
          </p>
        </div>
      </section>

      {/* The Story */}
      <section style={{
        padding: '80px 48px',
        background: 'white'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#18181B',
            marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>The Story</h2>
          
          <div style={{ fontSize: '16px', color: '#52525B', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '16px' }}>
              It started with a simple idea: &quot;Get this domain workerscando.com and build 100 tiny tools based on Workers.&quot;
            </p>
            <p style={{ marginBottom: '16px' }}>
              The challenge? Ship one tool every single day for the next 100 days. No excuses, no breaks, just building.
            </p>
            <p style={{ marginBottom: '16px' }}>
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
      <section style={{
        padding: '80px 48px',
        background: '#FAFAFA'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#18181B',
              letterSpacing: '-0.02em'
            }}>The Process</h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {[
              { step: "01", title: "Ideate", desc: "Come up with a useful micro-tool idea" },
              { step: "02", title: "Build", desc: "Code and deploy to Cloudflare Workers" },
              { step: "03", title: "Ship", desc: "Launch and share with the world" }
            ].map((item, index) => (
              <div 
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  border: '1px solid #E5E5E5',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#F97316',
                  fontFamily: "var(--font-mono)",
                  marginBottom: '12px'
                }}>{item.step}</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#18181B',
                  marginBottom: '6px'
                }}>{item.title}</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#71717A'
                }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{
        padding: '80px 48px',
        background: 'white'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#18181B',
            marginBottom: '32px',
            letterSpacing: '-0.02em'
          }}>Tech Stack</h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {[
              { name: "Cloudflare Workers", color: "#F97316" },
              { name: "TypeScript", color: "#3178C6" },
              { name: "Hono", color: "#E36002" },
              { name: "Next.js", color: "#000000" },
              { name: "Tailwind CSS", color: "#06B6D4" }
            ].map((tech, index) => (
              <div 
                key={index}
                style={{
                  background: '#FAFAFA',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1px solid #E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: tech.color
                }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#18181B'
                }}>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section style={{
        padding: '60px 48px',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 12px',
            background: 'white',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#F97316',
            marginBottom: '16px',
            fontFamily: "var(--font-mono)"
          }}>
            MORE COMING SOON
          </span>
          <p style={{
            fontSize: '16px',
            color: '#71717A'
          }}>
            This page will be updated with more details as the challenge progresses.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}