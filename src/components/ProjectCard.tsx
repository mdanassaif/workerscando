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

// Map tags to specific icons and colors
const getIconForTag = (tag: string) => {
  switch (tag.toLowerCase()) {
    case 'api':
      return {
        bg: '#EEF2FF', color: '#4F46E5', // Indigo
        svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
      };
    case 'generator':
      return {
        bg: '#FDF4FF', color: '#C026D3', // Fuchsia
        svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
      };
    case 'saas':
      return {
        bg: '#F0FDF4', color: '#16A34A', // Green
        svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      };
    case 'security':
      return {
        bg: '#FEF2F2', color: '#DC2626', // Red
        svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      };
    case 'debug':
      return {
        bg: '#FFFBEB', color: '#D97706', // Amber
        svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
      };
    default:
      return {
        bg: '#F3F4F6', color: '#4B5563', // Gray
        svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      };
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  hoveredProject, 
  setHoveredProject 
}) => {
  const isLive = project.status === 'live';
  const iconStyle = getIconForTag(project.tag);

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
      <div className={styles.iconContainer} style={{ background: iconStyle.bg, color: iconStyle.color }}>
        {iconStyle.svg}
      </div>
      
      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{project.name}</h3>
      </div>
      
      <p className={styles.description}>{project.description}</p>
      
      <div className={styles.footer}>
        <span className={styles.tag} style={{ color: iconStyle.color }}>{project.tag}</span>
        
        <span className={styles.actionText}>
          {project.status === 'live' ? 'Open Tool' : 'Coming soon'}
          {project.status === 'live' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
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