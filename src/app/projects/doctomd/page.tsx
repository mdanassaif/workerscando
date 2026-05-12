import type { Metadata } from 'next';
import { projects } from '@/lib/projects';
import DocToMDClient from './DocToMDClient';

const project = projects.find((p) => p.slug === 'doctomd');

export async function generateMetadata(): Promise<Metadata> {
  if (!project) return { title: 'Project Not Found' };
  return {
    title: `${project.name} - WorkersCanDo`,
    description: project.longDescription || project.description,
  };
}

export default function DocToMDPage() {
  if (!project) return <div>Project not found</div>;
  return <DocToMDClient project={project} />;
}
