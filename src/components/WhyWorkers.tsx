import React from 'react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const WhyWorkers: React.FC = () => {
  const features: Feature[] = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      title: "Lightning Fast",
      description: "Sub-millisecond cold starts"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      title: "Global Edge",
      description: "300+ locations worldwide"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      title: "Cost Effective",
      description: "Pay only for what you use"
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      title: "Secure by Default",
      description: "Built-in DDoS protection"
    }
  ];

  return (
    <section style={{
      padding: '80px 48px',
      background: 'linear-gradient(180deg, #FAFAFA 0%, #FFF7ED 100%)'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#F97316',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '12px',
            fontFamily: "var(--font-mono)"
          }}>
            About This Project
          </span>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#18181B',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>Why Workers?</h2>
          <p style={{
            fontSize: '17px',
            color: '#71717A',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Cloudflare Workers run at the edge — closer to users, faster than traditional servers. 
            This project explores what&apos;s possible when you build tiny, focused tools 
            that leverage the power of edge computing.
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {features.map((feature, index) => (
            <div 
              key={index}
              className="project-card"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #E5E5E5',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '17px',
                fontWeight: 600,
                color: '#18181B',
                marginBottom: '6px'
              }}>{feature.title}</h3>
              <p style={{
                fontSize: '14px',
                color: '#71717A',
                lineHeight: 1.5
              }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyWorkers;