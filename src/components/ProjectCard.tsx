'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';

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
      className="project-card"
      onMouseEnter={() => setHoveredProject(project.id)}
      onMouseLeave={() => setHoveredProject(null)}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E5E5E5',
        cursor: isLive ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: hoveredProject === project.id ? 'translateY(-2px)' : 'none',
        boxShadow: hoveredProject === project.id ? '0 8px 24px rgba(0,0,0,0.08)' : 'none'
      }}
    >
      {/* Day badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: '#FFF7ED',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#F97316',
        fontFamily: "var(--font-mono)"
      }}>
        DAY {project.day}
      </div>
      
      {/* Icon */}
      <div style={{
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#18181B'
        }}>{project.name}</h3>
        {project.status === 'live' && (
          <span style={{
            width: '8px',
            height: '8px',
            background: '#22C55E',
            borderRadius: '50%'
          }} className="live-dot" />
        )}
      </div>
      
      <p style={{
        fontSize: '14px',
        color: '#71717A',
        marginBottom: '16px',
        lineHeight: 1.5
      }}>{project.description}</p>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          padding: '4px 10px',
          background: '#F4F4F5',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          color: '#52525B'
        }}>{project.tag}</span>
        
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: hoveredProject === project.id ? '#F97316' : '#A1A1AA',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'color 0.2s ease'
        }}>
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
      <Link href={`/projects/${project.slug}`} style={{ textDecoration: 'none' }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default ProjectCard;