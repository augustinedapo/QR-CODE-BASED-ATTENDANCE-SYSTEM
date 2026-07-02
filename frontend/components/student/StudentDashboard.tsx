// components/student/StudentDashboard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { getMockData } from '@/utils/mockData';
import { Enrollment } from '@/types/index';
import StudentAttendanceStats from './AttendanceStats';
import CourseCard from './CourseCard';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';
import QRScanner from './QRScanner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './StudentDashboard.module.css';

const StudentDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    // Fetch enrollments
    const loadEnrollments = async () => {
      try {
        // In production, fetch from API
        // const response = await enrollmentService.getStudentEnrollments(user?.user_id);
        
        // For now, use mock data
        const mockEnrollments = getMockData.getEnrollments();
        setEnrollments(mockEnrollments);
      } catch (error) {
        showNotification('Failed to load enrollments', 'error');
      } finally {
        setIsLoadingEnrollments(false);
      }
    };

    if (!isLoading && user) {
      loadEnrollments();
    }
  }, [isLoading, user, showNotification]);

  if (isLoading || isLoadingEnrollments) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className={styles.dashboard}>
      <Container fluid className={styles.container}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            Here's your attendance overview for this semester
          </p>
        </section>

        {/* Stats Section */}
        <StudentAttendanceStats enrollments={enrollments} />

        {/* Quick Actions */}
        <QuickActions onScanQR={() => setShowQRScanner(true)} />

        {/* Courses Section */}
        <section className={styles.coursesSection}>
          <h2 className={styles.sectionTitle}>My Courses</h2>
          <Row>
            {enrollments.map((enrollment) => (
              <Col key={enrollment.enrollment_id} md={6} lg={4} className="mb-4">
                <CourseCard
                  course={enrollment.course!}
                  enrollment={enrollment}
                />
              </Col>
            ))}
          </Row>
        </section>

        {/* Activity Feed */}
        <ActivityFeed />

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner onClose={() => setShowQRScanner(false)} />
        )}
      </Container>
    </div>
  );
};

export default StudentDashboard;
