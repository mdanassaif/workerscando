import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { projects } from '@/lib/projects';
import { Navbar } from '@/components';
import styles from '@/styles/pages/project-detail.module.css';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

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
      'developer tools',
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const isLive = project.status === 'live';

  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.shell}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/projects" className={styles.crumb}>
            Tools
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span className={styles.crumbHere}>{project.name}</span>
        </nav>

        <p className={styles.kicker}>
          <span className={isLive ? styles.pillLive : styles.pillSoon}>
            {isLive ? 'Live' : 'Soon'}
          </span>
          <span className={styles.kickerRest}>
            {project.tag} · day {project.day}
          </span>
        </p>

        <h1 className={styles.title}>{project.name}</h1>

        <p className={styles.lead}>{project.description}</p>

        <div className={styles.actions}>
          {project.url && isLive && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              Open
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnGhost}
            >
              Code
            </a>
          )}
          <Link href="/docs" className={styles.btnGhost}>
            Docs
          </Link>
        </div>

        <Link href="/projects" className={styles.back}>
          All tools
        </Link>
      </div>
    </main>
  );
}
