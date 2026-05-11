'use client';

import React from 'react';

interface RevealProps {
  children?: React.ReactNode;
  className?: string;
}

const Reveal: React.FC<RevealProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default Reveal;
