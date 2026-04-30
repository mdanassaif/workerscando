import type { Metadata } from 'next';
import { projects } from '@/lib/projects';

const project = projects.find(p => p.id === 7)!;

export const metadata: Metadata = {
  title: `${project.name} - WorkersCanDo`,
  description: project.longDescription || project.description,
  keywords: [
    'redirect chain',
    'redirect tracer',
    'http hops',
    'cloudflare workers',
    'seo tools',
    'developer tools'
  ],
  openGraph: {
    title: `${project.name} - WorkersCanDo`,
    description: project.longDescription || project.description,
    url: project.url,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description)}&status=${project.status}`,
        width: 1200,
        height: 630,
        alt: project.name,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${project.name} - WorkersCanDo`,
    description: project.description,
  },
  alternates: {
    canonical: project.url,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
