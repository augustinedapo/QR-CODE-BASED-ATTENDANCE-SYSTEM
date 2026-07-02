// components/student/ActivityFeed.tsx

'use client';

import React from 'react';
import { Card } from 'react-bootstrap';
import styles from './ActivityFeed.module.css';

interface Activity {
  icon: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

const ActivityFeed: React.FC = () => {
  const activities: Activity[] = [
    {
      icon: '✓',
      title: 'Attendance Marked',
      description: 'Computer Networks - Lecture 23',
      time: '2 hours ago',
      type: 'success'
    },
    {
      icon: '✓',
      title: 'Assessment Completed',
      description: 'Database Management Systems - Quiz 8',
      time: '1 day ago',
      type: 'success'
    },
    {
      icon: '💬',
      title: 'Feedback Submitted',
      description: 'Software Engineering - Lecture Feedback',
      time: '2 days ago',
      type: 'info'
    },
    {
      icon: '✓',
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
                <div className={styles.icon}>{activity.icon}</div>
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
