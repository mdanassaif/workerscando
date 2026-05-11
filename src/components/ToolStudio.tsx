'use client';

import ProjectNav from './ProjectNav';
import styles from '@/styles/components/tool-studio.module.css';

export default function ToolStudio({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <ProjectNav />
      <div className={styles.stage}>{children}</div>
    </div>
  );
}
