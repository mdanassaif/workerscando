import React from 'react';
import Link from 'next/link';

const LinksSection: React.FC = () => {
  return (
    <section>
      <nav aria-label="Site links">
        <Link href="/projects">Projects</Link>
        <Link href="/docs">Docs</Link>
        <Link href="/about">About</Link>
      </nav>
    </section>
  );
};

export default LinksSection;
