// components/student/QuickActions.tsx

'use client';

import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
  onScanQR: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onScanQR }) => {
  const actions = [
    {
      icon: '📷',
      label: 'Scan QR Code',
      onClick: onScanQR,
      color: 'primary'
    },
    {
      icon: '📊',
      label: 'View All Attendance',
      onClick: () => console.log('View attendance'),
      color: 'secondary'
    },
    {
      icon: '📝',
      label: 'Take Assessment',
      onClick: () => console.log('Take assessment'),
      color: 'secondary'
    },
    {
      icon: '💬',
      label: 'Submit Feedback',
      onClick: () => console.log('Submit feedback'),
      color: 'secondary'
    }
  ];

  return (
    <Card className={styles.card}>
      <Card.Body>
        <h5 className={styles.title}>Quick Actions</h5>
        <Row className="g-3">
          {actions.map((action, index) => (
            <Col key={index} md={6} lg={3}>
              <button
                className={`${styles.actionBtn} ${styles[action.color]}`}
                onClick={action.onClick}
              >
                <div className={styles.icon}>{action.icon}</div>
                <div className={styles.label}>{action.label}</div>
              </button>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default QuickActions;