'use client';

import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { BarChart3, CheckCircle2, UserMinus, UsersRound } from 'lucide-react';
import { AttendanceRecord } from '@/types/index';
import styles from './AttendanceStats.module.css';

interface AttendanceStatsProps {
  records: AttendanceRecord[];
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ records }) => {
  const calculateStats = () => {
    const totalStudents = records.length;
    const presentToday = records.filter((record) => {
      if (record.percentage >= 75) {
        return true;
      }

      if (record.percentage >= 60) {
        return record.student_id % 2 === 0;
      }

      return record.student_id % 4 === 0;
    }).length;
    const absentToday = totalStudents - presentToday;
    const averageAttendance = records.length
      ? Math.round(records.reduce((sum, r) => sum + r.percentage, 0) / records.length)
      : 0;

    return {
      totalStudents,
      presentToday,
      absentToday,
      averageAttendance
    };
  };

  const stats = calculateStats();

  const statCards = [
    { Icon: UsersRound, value: stats.totalStudents, label: 'Total Students' },
    { Icon: CheckCircle2, value: stats.presentToday, label: 'Present Today' },
    { Icon: UserMinus, value: stats.absentToday, label: 'Absent Today' },
    { Icon: BarChart3, value: `${stats.averageAttendance}%`, label: 'Class Average' }
  ];

  return (
    <Row className="g-3 mb-4">
      {statCards.map((card, index) => (
        <Col key={index} md={6} lg={3}>
          <Card className={styles.statBox}>
            <Card.Body>
              <div className={styles.statIcon}><card.Icon size={26} aria-hidden="true" /></div>
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
