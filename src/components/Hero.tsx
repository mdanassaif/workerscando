import React from 'react';
import Link from 'next/link';

interface Stat {
  number: string;
  label: string;
}

const Hero: React.FC = () => {
  const stats: Stat[] = [
    { number: "100", label: "Tools Planned" },
    { number: "2", label: "Live Now" },
    { number: "98", label: "Days to Go" }
  ];

  return (
    <section style={{
      padding: '80px 48px 60px',
      textAlign: 'center',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(251, 146, 60, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <div className="animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          padding: '8px 16px',
          borderRadius: '100px',
          marginBottom: '24px',
          border: '1px solid #FED7AA',
          boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            background: '#22C55E',
            borderRadius: '50%'
          }} className="live-dot" />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#F97316',
            fontFamily: "var(--font-mono)"
          }}>
            100 TOOLS IN 100 DAYS
          </span>
        </div>
        
        <h1 className="animate-fade-in delay-1" style={{
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 700,
          color: '#18181B',
          lineHeight: 1.1,
          marginBottom: '20px',
          letterSpacing: '-0.03em'
        }}>
          Tiny tools, built on<br/>
          <span style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Cloudflare Workers</span>
        </h1>
        
        <p className="animate-fade-in delay-2" style={{
          fontSize: '18px',
          color: '#71717A',
          maxWidth: '520px',
          margin: '0 auto 32px',
          lineHeight: 1.6
        }}>
          A collection of 100 micro-tools powered by the edge. 
          One new tool, every single day.
        </p>
        
        <div className="animate-fade-in delay-3" style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            href="/projects"
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Explore Tools
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link 
            href="/docs"
            style={{
              background: 'white',
              color: '#18181B',
              padding: '14px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              border: '1px solid #E5E5E5',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            Read Docs
          </Link>
        </div>
      </div>

      <div className="animate-fade-in delay-4" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '48px',
        marginTop: '60px',
        flexWrap: 'wrap'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#F97316',
              fontFamily: "var(--font-mono)"
            }}>{stat.number}</div>
            <div style={{
              fontSize: '13px',
              color: '#71717A',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;