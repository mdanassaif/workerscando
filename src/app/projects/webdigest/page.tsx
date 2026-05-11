import type { Metadata } from 'next';
import { projects } from '@/lib/projects';
import WebDigestClient from './WebDigestClient';

const project = projects.find((p) => p.slug === 'webdigest');

export async function generateMetadata(): Promise<Metadata> {
  if (!project) return { title: 'Project Not Found' };
  return {
    title: `${project.name} - WorkersCanDo`,
    description: project.longDescription || project.description,
  };
}

export default function WebDigestPage() {
  if (!project) return <div>Project not found</div>;
  return <WebDigestClient project={project} />;
}
