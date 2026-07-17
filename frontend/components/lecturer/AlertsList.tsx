// components/lecturer/AlertsList.tsx

'use client';

import React from 'react';
import { Card, Alert } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';
import styles from './AlertsList.module.css';

interface AlertItem {
  id: number;
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  Icon: typeof AlertTriangle;
}

const AlertsList: React.FC = () => {
  const alerts: AlertItem[] = [
    {
      id: 1,
      type: 'danger',
      Icon: AlertTriangle,
      title: 'Students with Critical Attendance',
      message: '5 students in CSC 307 have attendance below 75%. Immediate action recommended.'
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
                  <div className={styles.alertIcon}><alert.Icon size={22} aria-hidden="true" /></div>
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
