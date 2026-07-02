'use client';

import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { AttendanceRecord } from '@/types/index';
import styles from './AttendanceStats.module.css';

interface AttendanceStatsProps {
  records: AttendanceRecord[];
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ records }) => {
  const calculateStats = () => {
    const totalStudents = records.length;
    const totalClasses = 25;
    const totalPresent = records.reduce((sum, r) => sum + r.attended, 0);
    const totalAbsent = records.reduce((sum, r) => sum + r.absent, 0);
    const averageAttendance = Math.round(
      records.reduce((sum, r) => sum + r.percentage, 0) / records.length
    );

    return {
      totalStudents,
      totalPresent,
      totalAbsent,
      averageAttendance
    };
  };

  const stats = calculateStats();

  const statCards = [
    { icon: '👥', value: stats.totalStudents, label: 'Total Students' },
    { icon: '✓', value: stats.totalPresent, label: 'Present Today' },
    { icon: '✗', value: stats.totalAbsent, label: 'Absent Today' },
    { icon: '📊', value: `${stats.averageAttendance}%`, label: 'Class Average' }
  ];

  return (
    <Row className="g-3 mb-4">
      {statCards.map((card, index) => (
        <Col key={index} md={6} lg={3}>
          <Card className={styles.statBox}>
            <Card.Body>
              <div className={styles.statIcon}>{card.icon}</div>
              <div className={styles.statValue}>{card.value}</div>
              <div className={styles.statLabel}>{card.label}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AttendanceStats;
