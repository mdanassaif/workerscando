import type { Metadata } from 'next';
import { projects } from '@/lib/projects';
import { Navbar, Footer } from '@/components';
import DeadManSwitchClient from './DeadManSwitchClient';

// Find the project data
const project = projects.find((p) => p.slug === 'dead-man-switch');

export async function generateMetadata(): Promise<Metadata> {
    if (!project) return { title: 'Project Not Found' };

    return {
        title: `${project.name} - WorkersCanDo`,
        description: project.description,
        openGraph: {
            title: `${project.name} - WorkersCanDo`,
            description: project.description,
            images: [`/api/og?title=${encodeURIComponent(project.name)}`],
        },
    };
}

export default function DeadManSwitchPage() {
    if (!project) return <div>Project not found</div>;

    return (
        <DeadManSwitchClient project={project} />
    );
}
