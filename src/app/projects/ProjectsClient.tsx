"use client";

import React, { useState } from 'react';
import { Navbar, ProjectCard, Footer } from '@/components';
import { projects } from '@/lib/projects';

type FilterType = 'all' | 'live' | 'coming';

export default function ProjectsClient() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'live') return p.status === 'live';
    if (filter === 'coming') return p.status === 'coming';
    return true;
  });

  const liveCount = projects.filter(p => p.status === 'live').length;
  const comingCount = projects.filter(p => p.status === 'coming').length;

  return (
    <main>
      <Navbar />
      {/* Header */}
      <section style={{
        padding: '60px 48px 40px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#F97316',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: "var(--font-mono)"
          }}>All Projects</span>
          <h1 style={{
            fontSize: '40px',
            fontWeight: 700,
            color: '#18181B',
            marginTop: '8px',
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>Tools Collection</h1>
          <p style={{
            fontSize: '17px',
            color: '#71717A',
            maxWidth: '500px'
          }}>
            Every tool built with Cloudflare Workers. Filter by status or browse them all.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section style={{
        padding: '40px 48px 80px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: filter === 'all' ? 'none' : '1px solid #E5E5E5',
              background: filter === 'all' ? '#F97316' : 'white',
              color: filter === 'all' ? 'white' : '#52525B',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            All ({projects.length})
          </button>
          <button 
            onClick={() => setFilter('live')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: filter === 'live' ? 'none' : '1px solid #E5E5E5',
              background: filter === 'live' ? '#22C55E' : 'white',
              color: filter === 'live' ? 'white' : '#52525B',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              background: filter === 'live' ? 'white' : '#22C55E',
              borderRadius: '50%'
            }} />
            Live ({liveCount})
          </button>
          <button 
            onClick={() => setFilter('coming')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: filter === 'coming' ? 'none' : '1px solid #E5E5E5',
              background: filter === 'coming' ? '#71717A' : 'white',
              color: filter === 'coming' ? 'white' : '#52525B',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Coming Soon ({comingCount})
          </button>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              hoveredProject={hoveredProject}
              setHoveredProject={setHoveredProject}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#71717A'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No projects found</p>
            <p style={{ fontSize: '14px' }}>Try a different filter</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
