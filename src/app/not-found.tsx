import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar, Footer } from '@/components';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main>
      <Navbar />
      
      <section style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 100%)',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          <div style={{
            fontSize: '120px',
            fontWeight: 700,
            color: '#F97316',
            lineHeight: 1,
            marginBottom: '20px',
            fontFamily: 'var(--font-mono)',
          }}>
            404
          </div>
          
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            color: '#18181B',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}>
            Page Not Found
          </h1>
          
          <p style={{
            fontSize: '17px',
            color: '#71717A',
            marginBottom: '32px',
            lineHeight: 1.6,
          }}>
            Oops! The page you&apos;re looking for doesn&apos;t exist. 
            It might have been moved or deleted.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                background: '#F97316',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Go Home
            </Link>
            
            <Link
              href="/projects"
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#18181B',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                border: '1px solid #E5E5E5',
              }}
            >
              Browse Projects
            </Link>
          </div>
          
          <div style={{
            marginTop: '48px',
            padding: '24px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E5E5E5',
          }}>
            <p style={{
              fontSize: '14px',
              color: '#52525B',
              marginBottom: '12px',
            }}>
              Looking for something specific?
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '14px',
            }}>
              <Link href="/docs" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 500 }}>
                Documentation
              </Link>
              <span style={{ color: '#E5E5E5' }}>•</span>
              <Link href="/about" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 500 }}>
                About Us
              </Link>
              <span style={{ color: '#E5E5E5' }}>•</span>
              <a 
                href="https://github.com/mdanassaif/workerscando" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#F97316', textDecoration: 'none', fontWeight: 500 }}
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
