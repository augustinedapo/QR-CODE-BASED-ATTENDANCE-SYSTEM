// components/lecturer/AlertsList.tsx

'use client';

import React from 'react';
import { Card, Alert } from 'react-bootstrap';
import styles from './AlertsList.module.css';

interface AlertItem {
  id: number;
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  icon: string;
}

const AlertsList: React.FC = () => {
  const alerts: AlertItem[] = [
    {
      id: 1,
      type: 'danger',
      icon: '⚠️',
      title: 'Students with Critical Attendance',
      message: '5 students in CSC 307 have attendance below 75%. Immediate action recommended.'
    },
    {
      id: 2,
      type: 'warning',
      icon: '📝',
      title: 'Assessment Completion Rate',
      message: 'CSC 305 Quiz 8: Only 45 out of 58 students have completed. Deadline in 2 days.'
    },
    {
      id: 3,
      type: 'info',
      icon: '💬',
      title: 'New Feedback Available',
      message: '12 students have submitted feedback for CSC 301 Lecture 25. Average rating: 4.8/5'
    }
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Important Alerts</h2>

      <Card className={styles.card}>
        <Card.Body className={styles.cardBody}>
          {alerts.map((alert) => (
            <div key={alert.id} className={styles.alertWrapper}>
              <Alert variant={alert.type} className={styles.alert}>
                <div className={styles.alertContent}>
                  <div className={styles.alertIcon}>{alert.icon}</div>
                  <div className={styles.alertText}>
                    <div className={styles.alertTitle}>{alert.title}</div>
                    <div className={styles.alertMessage}>{alert.message}</div>
                  </div>
                </div>
              </Alert>
            </div>
          ))}
        </Card.Body>
      </Card>
    </section>
  );
};

export default AlertsList;
