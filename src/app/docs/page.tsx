import type { Metadata } from 'next';
import DocsClient from './DocsClient';

export const metadata: Metadata = {
  title: 'Documentation - WorkersCanDo',
  description: 'Documentation for all WorkersCanDo tools. Learn how to use our Cloudflare Workers powered APIs and micro-tools. Complete guides, examples, and API references.',
  keywords: [
    'cloudflare workers documentation',
    'workers api docs',
    'cloudflare workers examples',
    'edge computing docs',
    'url metadata api',
    'og image generator docs',
  ],
  openGraph: {
    title: 'WorkersCanDo Documentation - API Guides & Examples',
    description: 'Complete documentation for all WorkersCanDo tools. API references, examples, and integration guides.',
    url: 'https://workerscando.com/docs',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorkersCanDo Documentation',
    description: 'API guides and examples for Cloudflare Workers tools',
  },
  alternates: {
    canonical: 'https://workerscando.com/docs',
  },
};

export default function DocsPage() {
  return <DocsClient />;
}