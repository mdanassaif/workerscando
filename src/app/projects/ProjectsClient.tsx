"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar, ProjectCard } from "@/components";
import { projects } from "@/lib/projects";
import styles from "@/styles/pages/projects-client.module.css";

type FilterType = "all" | "live" | "coming";

export default function ProjectsClient() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    if (filter === "live") return p.status === "live";
    if (filter === "coming") return p.status === "coming";
    return true;
  });

  const liveCount = projects.filter((p) => p.status === "live").length;
  const comingCount = projects.filter((p) => p.status === "coming").length;

  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.shell}>
        <header className={styles.toolbar}>
          <div className={styles.toolbarMain}>
            <h1 className={styles.pageTitle}>Tools</h1>
            <p className={styles.pageMeta}>
              {liveCount} live · {projects.length} total
              {comingCount > 0 ? ` · ${comingCount} soon` : ""}
            </p>
          </div>
          <Link href="/docs" className={styles.docsLink}>
            Docs
          </Link>
        </header>

        <div className={styles.filters} role="tablist" aria-label="Filter tools">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={`${styles.filter} ${filter === "all" ? styles.filterOn : ""}`}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "live"}
            onClick={() => setFilter("live")}
            className={`${styles.filter} ${filter === "live" ? styles.filterOn : ""}`}
          >
            Live
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "coming"}
            onClick={() => setFilter("coming")}
            className={`${styles.filter} ${filter === "coming" ? styles.filterOn : ""}`}
          >
            Soon
          </button>
        </div>

        <div className={styles.grid}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <p className={styles.empty}>Nothing in this filter.</p>
        )}
      </div>
    </main>
  );
}
