import type { Metadata } from 'next';
import { projects } from '@/lib/projects';
import { Navbar, Footer } from '@/components';
import HireWireClient from './HireWireClient';

// Find the project data
const project = projects.find((p) => p.slug === 'hire-wire');

export async function generateMetadata(): Promise<Metadata> {
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.name} - WorkersCanDo`,
    description: project.description,
    openGraph: {
      title: `${project.name} - WorkersCanDo`,
      description: project.description,
      images: [`/api/og?title=${encodeURIComponent(project.name)}`], // Assuming you have dynamic OG
    },
  };
}

export default function HireWirePage() {
  if (!project) return <div>Project not found</div>;

  return (
    <main>
      <Navbar />
      <HireWireClient project={project} />
      <Footer />
    </main>
  );
}