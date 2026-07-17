// components/lecturer/LecturerDashboard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { BarChart3, QrCode, Sun } from 'lucide-react';
import { Course } from '@/types/index';
import { courseService } from '@/services/courseService';
import LecturerAttendanceStats from './LecturerAttendanceStats';
import CourseManagement from './CourseManagement';
import AlertsList from './AlertsList';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './LecturerDashboard.module.css';

const LecturerDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const lecturerCourses = await courseService.getCourses();
        setCourses(lecturerCourses);
      } catch {
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
            Good morning, {user?.first_name}! <Sun size={24} aria-hidden="true" />
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
            <Col md={6}>
              <button className={`${styles.actionBtn} ${styles.primary}`} onClick={() => router.push('/qr-generator')}>
                <QrCode size={22} aria-hidden="true" /> Generate QR Code
              </button>
            </Col>
            <Col md={6}>
              <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={() => router.push('/attendance')}>
                <BarChart3 size={22} aria-hidden="true" /> View Analytics
              </button>
            </Col>
          </Row>
        </section>

        {/* Courses Section */}
        <CourseManagement
          courses={courses}
          onCourseCreated={(course) => setCourses((current) => [course, ...current])}
          onCourseUpdated={(course) => setCourses((current) => current.map((item) => (
            item.course_id === course.course_id ? course : item
          )))}
          onCourseDeleted={(courseId) => setCourses((current) => current.filter((item) => item.course_id !== courseId))}
        />

        {/* Alerts Section */}
        <AlertsList />
      </Container>
    </div>
  );
};

export default LecturerDashboard;
