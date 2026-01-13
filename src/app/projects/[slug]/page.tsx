import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/lib/projects';
import { Navbar, Footer } from '@/components';

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
      
      <section style={{
        padding: '80px 24px 60px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 100%)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '6px 14px',
              background: project.status === 'live' ? '#DCFCE7' : '#FEF3C7',
              color: project.status === 'live' ? '#16A34A' : '#CA8A04',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {project.status === 'live' ? '🟢 LIVE' : '🟡 Coming Soon'}
            </span>
            <span style={{
              padding: '6px 14px',
              background: '#F4F4F5',
              color: '#52525B',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {project.tag}
            </span>
            <span style={{
              fontSize: '14px',
              color: '#71717A',
              fontFamily: 'var(--font-mono)'
            }}>
              Day {project.day}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: '#18181B',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            {project.name}
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#52525B',
            lineHeight: 1.7,
            marginBottom: '32px'
          }}>
            {project.longDescription || project.description}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 24px',
                  background: '#F97316',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease'
                }}
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
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#18181B',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: '1px solid #E5E5E5',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
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

      <section style={{
        padding: '60px 24px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{
          background: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#18181B',
            marginBottom: '12px'
          }}>
            Documentation Coming Soon
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#71717A',
            lineHeight: 1.6
          }}>
            Detailed documentation, API references, and examples will be available soon.
            Check the <a href="/docs" style={{ color: '#F97316', fontWeight: 600 }}>docs page</a> for more information.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
