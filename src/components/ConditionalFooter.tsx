'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/projects') || pathname.startsWith('/docs')) {
    return null;
  }
  return <Footer />;
}
