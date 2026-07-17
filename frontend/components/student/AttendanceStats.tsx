// components/student/StudentAttendanceStats.tsx

'use client';

import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { BookOpen, CheckCircle2, ClipboardList } from 'lucide-react';
import { Enrollment, StudentCourseAttendanceSummary } from '@/types/index';
import styles from './StudentAttendanceStats.module.css';

interface StudentAttendanceStatsProps {
  enrollments: Enrollment[];
  summaries: StudentCourseAttendanceSummary[];
}

const StudentAttendanceStats: React.FC<StudentAttendanceStatsProps> = ({ enrollments, summaries }) => {
  const calculateStats = () => {
    const totalCourses = enrollments.length;
    const totalAttendances = summaries.reduce((sum, summary) => sum + summary.attended, 0);
    const overallPercentage = summaries.length > 0
      ? Math.round(summaries.reduce((sum, summary) => sum + summary.percentage, 0) / summaries.length)
      : 0;

    return {
      totalCourses,
      totalAttendances,
      overallPercentage
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      Icon: BookOpen,
      value: stats.totalCourses,
      label: 'Enrolled Courses',
      bgColor: 'bg-blue'
    },
    {
      Icon: CheckCircle2,
      value: `${stats.overallPercentage}%`,
      label: 'Overall Attendance',
      bgColor: 'bg-green'
    },
    {
      Icon: ClipboardList,
      value: stats.totalAttendances,
      label: 'Lectures Attended',
      bgColor: 'bg-orange'
    }
  ];

  return (
    <Row className={`mb-4 g-3`}>
      {statCards.map((card, index) => (
        <Col key={index} md={6} lg={4}>
          <Card className={`${styles.statCard} ${styles[card.bgColor]}`}>
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

export default StudentAttendanceStats;
