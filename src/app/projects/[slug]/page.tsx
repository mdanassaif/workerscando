import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { projects } from '@/lib/projects';
import { Navbar, Footer } from '@/components';
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

  return (
    <main>
      <Navbar />

      <section className={styles.heroSection}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <Link href="/projects" className={styles.breadcrumbLink}>Tools</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>{project.name}</span>
          </div>

          <div className={styles.badgesContainer}>
            <span className={`${styles.statusBadge} ${project.status === 'live' ? styles.statusBadgeLive : styles.statusBadgeComing}`}>
              {project.status === 'live' ? '● LIVE' : '◐ Coming Soon'}
            </span>
            <span className={styles.tagBadge}>{project.tag}</span>
            <span className={styles.dayBadge}>DAY {project.day}</span>
          </div>

          <h1 className={styles.title}>{project.name}</h1>

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
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                View Code
              </a>
            )}
          </div>

          {/* Info strip */}
          <div className={styles.infoStrip}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Status</div>
              {project.status === 'live' ? (
                <div className={`${styles.infoValue} ${styles.infoValueLive}`}>
                  <span className={styles.infoLiveDot} />
                  Live & Ready
                </div>
              ) : (
                <div className={styles.infoValue}>Coming Soon</div>
              )}
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Category</div>
              <div className={styles.infoValue}>{project.tag}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Day</div>
              <div className={styles.infoValue}>#{project.day} of 100</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Platform</div>
              <div className={styles.infoValue}>Cloudflare Workers</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.docsSection}>
        <div className={styles.docsCard}>
          <div className={styles.docsCardIcon}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2 className={styles.docsTitle}>Documentation Coming Soon</h2>
          <p className={styles.docsText}>
            Detailed docs, API references, and examples are on the way.
            Check the <Link href="/docs" className={styles.docsLink}>docs page</Link> for general information about this project.
          </p>
        </div>
      </section>

      <section className={styles.exploreSection}>
        <p className={styles.exploreTitle}>Continue Exploring</p>
        <Link href="/projects" className={styles.exploreLink}>
          View all 100 tools
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </section>

    </main>
  );
}

