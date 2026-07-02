// components/lecturer/LecturerDashboard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { getMockData } from '@/utils/mockData';
import { Course } from '@/types/index';
import LecturerAttendanceStats from './LecturerAttendanceStats';
import CourseManagement from './CourseManagement';
import AlertsList from './AlertsList';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './LecturerDashboard.module.css';

const LecturerDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const mockCourses = getMockData.getCourses();
        setCourses(mockCourses);
      } catch (error) {
        showNotification('Failed to load courses', 'error');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    if (!isLoading && user) {
      loadCourses();
    }
  }, [isLoading, user, showNotification]);

  if (isLoading || isLoadingCourses) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className={styles.dashboard}>
      <Container fluid className={styles.container}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Good morning, {user?.first_name}! ☀️
          </h1>
          <p className={styles.welcomeSubtitle}>
            You have {courses.length} active courses this semester
          </p>
        </section>

        {/* Stats Section */}
        <LecturerAttendanceStats courses={courses} />

        {/* Quick Actions */}
        <section className={styles.quickActionsSection}>
          <Row className="g-3">
            <Col md={6} lg={3}>
              <button className={`${styles.actionBtn} ${styles.primary}`}>
                🔲 Generate QR Code
              </button>
            </Col>
            <Col md={6} lg={3}>
              <button className={`${styles.actionBtn} ${styles.secondary}`}>
                ➕ Create Assessment
              </button>
            </Col>
            <Col md={6} lg={3}>
              <button className={`${styles.actionBtn} ${styles.secondary}`}>
                📊 View Analytics
              </button>
            </Col>
            <Col md={6} lg={3}>
              <button className={`${styles.actionBtn} ${styles.secondary}`}>
                💬 View Feedback
              </button>
            </Col>
          </Row>
        </section>

        {/* Courses Section */}
        <CourseManagement courses={courses} />

        {/* Alerts Section */}
        <AlertsList />
      </Container>
    </div>
  );
};

export default LecturerDashboard;
