// components/student/StudentAttendanceStats.tsx

'use client';

import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Enrollment } from '@/types/index';
import { getMockData } from '@/utils/mockData';
import styles from './StudentAttendanceStats.module.css';

interface StudentAttendanceStatsProps {
  enrollments: Enrollment[];
}

const StudentAttendanceStats: React.FC<StudentAttendanceStatsProps> = ({ enrollments }) => {
  const attendances = getMockData.getAttendances();

  const calculateStats = () => {
    const totalCourses = enrollments.length;
    const totalAttendances = attendances.length;
    const overallPercentage = totalAttendances > 0 
      ? Math.round((totalAttendances / (totalCourses * 25)) * 100) 
      : 0;

    return {
      totalCourses,
      totalAttendances,
      overallPercentage,
      pendingFeedback: 3
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      icon: '📚',
      value: stats.totalCourses,
      label: 'Enrolled Courses',
      bgColor: 'bg-blue'
    },
    {
      icon: '✓',
      value: `${stats.overallPercentage}%`,
      label: 'Overall Attendance',
      bgColor: 'bg-green'
    },
    {
      icon: '📝',
      value: stats.totalAttendances,
      label: 'Lectures Attended',
      bgColor: 'bg-orange'
    },
    {
      icon: '💬',
      value: stats.pendingFeedback,
      label: 'Pending Feedback',
      bgColor: 'bg-purple'
    }
  ];

  return (
    <Row className={`mb-4 g-3`}>
      {statCards.map((card, index) => (
        <Col key={index} md={6} lg={3}>
          <Card className={`${styles.statCard} ${styles[card.bgColor]}`}>
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

export default StudentAttendanceStats;
