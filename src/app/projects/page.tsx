import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Tools - WorkersCanDo',
  description: 'All tools built on Cloudflare Workers — live and coming soon.',
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
