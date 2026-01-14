"use client";

import React, { useState } from 'react';
import { Navbar, ProjectCard, Footer } from '@/components';
import { projects } from '@/lib/projects';
import styles from '@/styles/pages/projects-client.module.css';

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
      <section className={styles.headerSection}>
        <div className={styles.headerContainer}>
          <span className={styles.label}>All Projects</span>
          <h1 className={styles.title}>Tools Collection</h1>
          <p className={styles.subtitle}>
            Every tool built with Cloudflare Workers. Filter by status or browse them all.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className={styles.projectsSection}>
        {/* Filters */}
        <div className={styles.filtersContainer}>
          <button 
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
          >
            All ({projects.length})
          </button>
          <button 
            onClick={() => setFilter('live')}
            className={`${styles.filterButton} ${filter === 'live' ? styles.filterButtonLive : ''} ${filter !== 'live' ? styles.filterButtonLiveInactive : ''}`}
          >
            {filter !== 'live' && <span className={styles.liveDot} />}
            {filter === 'live' && <span className={styles.liveDotWhite} />}
            Live ({liveCount})
          </button>
          <button 
            onClick={() => setFilter('coming')}
            className={`${styles.filterButton} ${filter === 'coming' ? styles.filterButtonComing : ''}`}
          >
            Coming Soon ({comingCount})
          </button>
        </div>

        {/* Grid */}
        <div className={styles.projectsGrid}>
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
          <div className={styles.emptyState}>
            <p className={styles.emptyStateTitle}>No projects found</p>
            <p className={styles.emptyStateText}>Try a different filter</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
