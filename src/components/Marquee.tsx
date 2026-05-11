'use client';

import React from 'react';

interface MarqueeProps {
  children?: React.ReactNode;
}

const Marquee: React.FC<MarqueeProps> = ({ children }) => {
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <div style={{ display: 'inline-block', animation: 'marquee 20s linear infinite' }}>
        {children}
      </div>
    </div>
  );
};

export default Marquee;
