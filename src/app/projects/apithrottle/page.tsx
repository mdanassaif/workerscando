import type { Metadata } from 'next';
import { projects } from '@/lib/projects';
import { Navbar, Footer, LinksSection } from '@/components';
import APIThrottleClient from './APIThrottleClient';

const project = projects.find((p) => p.slug === 'apithrottle');

export async function generateMetadata(): Promise<Metadata> {
    if (!project) {
        return {
            title: 'Project Not Found',
        };
    }

    const ogImageUrl = `/api/og?title=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description)}&status=${project.status}`;

    return {
        title: `${project.name} - WorkersCanDo`,
        description: project.longDescription || project.description,
        keywords: [
            project.name.toLowerCase(),
            'cloudflare workers',
            project.tag.toLowerCase(),
            'edge computing',
            'serverless',
            'rate limiting',
            'api security',
            'bot detection',
            'ddos protection',
            'throttle',
        ],
        openGraph: {
            title: `${project.name} - WorkersCanDo`,
            description: project.longDescription || project.description,
            url: `https://workerscando.com/projects/${project.slug}`,
            images: [
                {
                    url: ogImageUrl,
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
            images: [ogImageUrl],
        },
        alternates: {
            canonical: `https://workerscando.com/projects/${project.slug}`,
        },
    };
}

export default function APIThrottlePage() {
    if (!project) {
        return null;
    }

    return (
        <main>
            <Navbar />
            <APIThrottleClient project={project} />
            <LinksSection />
            <Footer />
        </main>
    );
}
