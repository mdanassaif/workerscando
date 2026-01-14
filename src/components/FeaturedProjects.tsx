'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';
import { projects } from '@/lib/projects';
import { Project } from '@/types';
import styles from '@/styles/components/featured-projects.module.css';

const FeaturedProjects: React.FC = () => {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const liveProjects = projects.filter((p: Project) => p.status === 'live');

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <span className={styles.label}>Live Now</span>
          <h2 className={styles.title}>Featured Tools</h2>
        </div>
        <Link 
          href="/projects"
          className={styles.viewAllLink}
        >
          View all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <div className={styles.grid}>
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