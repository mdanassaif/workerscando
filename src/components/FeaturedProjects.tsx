'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';
import { projects } from '@/lib/projects';
import { Project } from '@/types';

const FeaturedProjects: React.FC = () => {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const liveProjects = projects.filter((p: Project) => p.status === 'live');

  return (
    <section style={{
      padding: '80px 48px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '40px'
      }}>
        <div>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#F97316',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: "var(--font-mono)"
          }}>Live Now</span>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#18181B',
            marginTop: '8px',
            letterSpacing: '-0.02em'
          }}>Featured Tools</h2>
        </div>
        <Link 
          href="/projects"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#F97316',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none'
          }}
        >
          View all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {liveProjects.map((project: Project) => (
          <ProjectCard 
            key={project.id}
            project={project}
            hoveredProject={hoveredProject}
            setHoveredProject={setHoveredProject}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProjects;