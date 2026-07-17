// components/lecturer/LecturerAttendanceStats.tsx

'use client';

import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { AlertTriangle, BarChart3, BookOpen, UsersRound } from 'lucide-react';
import { Course } from '@/types/index';
import { getMockData } from '@/utils/mockData';
import styles from './LecturerAttendanceStats.module.css';

interface LecturerAttendanceStatsProps {
  courses: Course[];
}

const LecturerAttendanceStats: React.FC<LecturerAttendanceStatsProps> = ({ courses }) => {
  const attendanceRecords = getMockData.getAttendanceRecords();

  const calculateStats = () => {
    const totalStudents = courses.reduce((sum, course) => sum + (course.students_count || 0), 0);
    const totalLectures = courses.reduce((sum, course) => sum + (course.total_lectures || 0), 0);
    const averageAttendance = attendanceRecords.length > 0
      ? Math.round(
          attendanceRecords.reduce((sum, record) => sum + record.percentage, 0) /
            attendanceRecords.length
        )
      : 0;
    const atRiskStudents = attendanceRecords.filter((r) => r.status === 'at-risk').length;

    return {
      totalCourses: courses.length,
      totalStudents,
      totalLectures,
      averageAttendance,
      atRiskStudents
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      Icon: BookOpen,
      value: stats.totalCourses,
      label: 'Active Courses',
      bgColor: 'bg-blue'
    },
    {
      Icon: UsersRound,
      value: stats.totalStudents,
      label: 'Total Students',
      bgColor: 'bg-green'
    },
    {
      Icon: BarChart3,
      value: `${stats.averageAttendance}%`,
      label: 'Avg. Attendance',
      bgColor: 'bg-orange'
    },
    {
      Icon: AlertTriangle,
      value: stats.atRiskStudents,
      label: 'Students At Risk',
      bgColor: 'bg-red'
    }
  ];

  return (
    <Row className={`mb-4 g-3`}>
      {statCards.map((card, index) => (
        <Col key={index} md={6} lg={3}>
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

export default LecturerAttendanceStats;
