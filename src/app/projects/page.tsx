import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'All Projects - WorkersCanDo Tools',
  description: 'Browse all 100 micro-tools powered by Cloudflare Workers. Filter by status, explore live tools, and discover upcoming projects. Fast, focused, and free developer tools.',
  keywords: [
    'cloudflare workers projects',
    'edge computing tools',
    'serverless tools',
    'developer tools',
    'free api tools',
    'cloudflare workers examples',
  ],
  openGraph: {
    title: 'All Projects - WorkersCanDo Cloudflare Workers Tools',
    description: 'Browse all 100 micro-tools powered by Cloudflare Workers. Fast, focused, and free developer tools.',
    url: 'https://workerscando.com/projects',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Projects - WorkersCanDo',
    description: '100 micro-tools powered by Cloudflare Workers',
  },
  alternates: {
    canonical: 'https://workerscando.com/projects',
  },
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}