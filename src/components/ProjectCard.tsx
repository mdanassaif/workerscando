'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import styles from '@/styles/components/project-card.module.css';

interface ProjectCardProps {
  project: Project;
  hoveredProject: number | null;
  setHoveredProject: (id: number | null) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  hoveredProject, 
  setHoveredProject 
}) => {
  const isLive = project.status === 'live';

  const cardContent = (
    <div 
      className={`${styles.card} ${isLive ? styles.cardLive : ''}`}
      onMouseEnter={() => setHoveredProject(project.id)}
      onMouseLeave={() => setHoveredProject(null)}
    >
      {/* Day badge */}
      <div className={styles.dayBadge}>
        DAY {project.day}
      </div>
      
      {/* Icon */}
      <div className={styles.iconContainer}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      
      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{project.name}</h3>
        {project.status === 'live' && (
          <span className={`${styles.liveDot} live-dot`} />
        )}
      </div>
      
      <p className={styles.description}>{project.description}</p>
      
      <div className={styles.footer}>
        <span className={styles.tag}>{project.tag}</span>
        
        <span className={styles.actionText}>
          {project.status === 'live' ? 'Try it' : 'Coming soon'}
          {project.status === 'live' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          )}
        </span>
      </div>
    </div>
  );

  if (isLive) {
    return (
      <Link href={`/projects/${project.slug}`} className={styles.cardLink}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default ProjectCard;