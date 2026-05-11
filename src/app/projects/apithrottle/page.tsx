import type { Metadata } from 'next';
import { projects } from '@/lib/projects';
import APIThrottleClient from './APIThrottleClient';

const project = projects.find((p) => p.slug === 'apithrottle');

export async function generateMetadata(): Promise<Metadata> {
  if (!project) return { title: 'Project Not Found' };
  return {
    title: `${project.name} - WorkersCanDo`,
    description: project.description,
  };
}

export default function APIThrottlePage() {
  if (!project) return <div>Project not found</div>;
  return <APIThrottleClient project={project} />;
}
