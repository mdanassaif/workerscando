import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/lib/projects';
import { Navbar, Footer } from '@/components';
import styles from '@/styles/pages/project-detail.module.css';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = projects.find((p) => p.slug === params.slug);

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

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main>
      <Navbar />
      
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.badgesContainer}>
            <span className={`${styles.statusBadge} ${project.status === 'live' ? styles.statusBadgeLive : styles.statusBadgeComing}`}>
              {project.status === 'live' ? '🟢 LIVE' : '🟡 Coming Soon'}
            </span>
            <span className={styles.tagBadge}>
              {project.tag}
            </span>
            <span className={styles.dayBadge}>
              Day {project.day}
            </span>
          </div>

          <h1 className={styles.title}>
            {project.name}
          </h1>

          <p className={styles.description}>
            {project.longDescription || project.description}
          </p>

          <div className={styles.actionsContainer}>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryButton}
              >
                Try it Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View Code
              </a>
            )}
          </div>
        </div>
      </section>

      <section className={styles.docsSection}>
        <div className={styles.docsCard}>
          <h2 className={styles.docsTitle}>
            Documentation Coming Soon
          </h2>
          <p className={styles.docsText}>
            Detailed documentation, API references, and examples will be available soon.
            Check the <a href="/docs" className={styles.docsLink}>docs page</a> for more information.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
