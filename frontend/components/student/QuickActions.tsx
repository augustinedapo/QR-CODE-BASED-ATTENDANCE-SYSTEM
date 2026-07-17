// components/student/QuickActions.tsx

'use client';

import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { BarChart3, ScanLine } from 'lucide-react';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
  onScanQR: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onScanQR }) => {
  const router = useRouter();
  const actions = [
    {
      Icon: ScanLine,
      label: 'Scan QR Code',
      onClick: onScanQR,
      color: 'primary'
    },
    {
      Icon: BarChart3,
      label: 'View All Attendance',
      onClick: () => router.push('/dashboard/student/attendance-history'),
      color: 'secondary'
    }
  ];

  return (
    <Card className={styles.card}>
      <Card.Body>
        <h5 className={styles.title}>Quick Actions</h5>
        <Row className="g-3">
          {actions.map((action, index) => (
            <Col key={index} md={6}>
              <button
                className={`${styles.actionBtn} ${styles[action.color]}`}
                onClick={action.onClick}
              >
                <div className={styles.icon}><action.Icon size={26} aria-hidden="true" /></div>
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
