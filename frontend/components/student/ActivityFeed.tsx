// components/student/ActivityFeed.tsx

'use client';

import React from 'react';
import { Card } from 'react-bootstrap';
import { CheckCircle2 } from 'lucide-react';
import styles from './ActivityFeed.module.css';

interface Activity {
  Icon: typeof CheckCircle2;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

const ActivityFeed: React.FC = () => {
  const activities: Activity[] = [
    {
      Icon: CheckCircle2,
      title: 'Attendance Marked',
      description: 'Computer Networks - Lecture 23',
      time: '2 hours ago',
      type: 'success'
    },
    {
      Icon: CheckCircle2,
      title: 'Attendance Marked',
      description: 'Database Management Systems - Lecture 22',
      time: '3 days ago',
      type: 'success'
    }
  ];

  return (
    <Card className={styles.card}>
      <Card.Body>
        <h5 className={styles.title}>Recent Activity</h5>

        <div className={styles.timeline}>
          {activities.map((activity, index) => (
            <div key={index} className={`${styles.item} ${styles[activity.type]}`}>
              <div className={styles.iconWrapper}>
                <div className={styles.icon}><activity.Icon size={18} aria-hidden="true" /></div>
              </div>
              <div className={styles.content}>
                <div className={styles.itemTitle}>{activity.title}</div>
                <div className={styles.itemDescription}>{activity.description}</div>
                <div className={styles.itemTime}>{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ActivityFeed;
