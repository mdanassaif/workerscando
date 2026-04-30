import React from 'react';
import styles from '@/styles/components/marquee.module.css';
import { getLiveProjects } from '@/lib/projects';

export const Marquee: React.FC = () => {
  const liveProjects = getLiveProjects();
  
  // We need to duplicate the items so the marquee loops seamlessly
  // If we have few projects, repeat them a few more times
  const items = [...liveProjects, ...liveProjects, ...liveProjects, ...liveProjects];

  if (liveProjects.length === 0) return null;

  return (
    <div className={styles.strip}>
      <div className={styles.stripTrack}>
        {items.map((item, idx) => (
          <span key={idx}>
            <b>Day {item.day}</b> — {item.name}: {item.description}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
