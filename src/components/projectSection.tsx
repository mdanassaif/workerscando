'use client';

import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import { Project } from '../types';

const ProjectsSection: React.FC = () => {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const projects: Project[] = [
    {
      id: 1,
      name: "Image Resizer",
      slug: "image-resizer",
      description: "Resize images on the edge with zero latency",
      tag: "Image",
      status: "live",
      day: 1
    },
    {
      id: 2,
      name: "URL Shortener",
      slug: "url-shortener",
      description: "Lightning-fast URL shortening at the edge",
      tag: "Utility",
      status: "live",
      day: 2
    },
    {
      id: 3,
      name: "QR Generator",
      slug: "qr-generator",
      description: "Generate QR codes instantly via Workers",
      tag: "Generator",
      status: "live",
      day: 3
    },
    {
      id: 4,
      name: "JSON Formatter",
      slug: "json-formatter",
      description: "Format and validate JSON on the fly",
      tag: "Developer",
      status: "coming",
      day: 4
    },
    {
      id: 5,
      name: "Markdown Preview",
      slug: "markdown-preview",
      description: "Real-time markdown to HTML conversion",
      tag: "Developer",
      status: "coming",
      day: 5
    },
    {
      id: 6,
      name: "Color Palette",
      slug: "color-palette",
      description: "Generate beautiful color palettes instantly",
      tag: "Design",
      status: "coming",
      day: 6
    }
  ];

  return (
    <section id="projects" style={{
      padding: '80px 48px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#18181B',
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>All Projects</h2>
          <p style={{
            fontSize: '15px',
            color: '#71717A'
          }}>Tools shipped so far — more coming every day</p>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#F97316',
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>All</button>
          <button style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E5E5',
            background: 'white',
            color: '#52525B',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>Live</button>
          <button style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E5E5',
            background: 'white',
            color: '#52525B',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>Coming</button>
        </div>
      </div>

      {/* Project Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {projects.map((project) => (
          <ProjectCard 
            key={project.id}
            project={project}
            hoveredProject={hoveredProject}
            setHoveredProject={setHoveredProject}
          />
        ))}
      </div>
      
      {/* Load More */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <button style={{
          background: 'white',
          border: '1px solid #E5E5E5',
          padding: '12px 24px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#52525B',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          Load More Tools
        </button>
      </div>
    </section>
  );
};

export default ProjectsSection;