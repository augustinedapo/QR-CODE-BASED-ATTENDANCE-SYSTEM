'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { ArrowLeft, CalendarClock, CircleDot, QrCode, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { courseService } from '@/services/courseService';
import { lectureService } from '@/services/lectureService';
import { Course, Lecture } from '@/types/index';
import styles from './page.module.css';

function getStatus(session: Lecture) {
  return session.computed_qr_status || session.qr_status || 'pending';
}

function formatDateTime(date?: string, time?: string) {
  if (!date) return 'Not scheduled';
  const formattedDate = new Date(date).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return time ? `${formattedDate} · ${time.slice(0, 5)}` : formattedDate;
}

function formatGeneratedAt(value?: string | null) {
  if (!value) return 'Not generated';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function CourseAttendanceHistoryPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId;
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Lecture[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [closingLectureId, setClosingLectureId] = useState<number | null>(null);

  const loadPage = async () => {
    if (!courseId) return;
    setIsLoadingPage(true);
    try {
      const [courseData, sessionData] = await Promise.all([
        courseService.getCourse(courseId),
        lectureService.getQRSessions({ course_id: courseId }),
      ]);
      setCourse(courseData);
      setSessions(sessionData);
    } catch {
      showNotification('Failed to load course attendance history', 'error');
    } finally {
      setIsLoadingPage(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'lecturer') {
      router.push('/dashboard/student');
      return;
    }

    let isMounted = true;
    Promise.all([
      courseService.getCourse(courseId),
      lectureService.getQRSessions({ course_id: courseId }),
    ])
      .then(([courseData, sessionData]) => {
        if (!isMounted) return;
        setCourse(courseData);
        setSessions(sessionData);
      })
      .catch(() => {
        if (isMounted) {
          showNotification('Failed to load course attendance history', 'error');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPage(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isLoading, router, showNotification, user, courseId]);

  const summary = useMemo(() => {
    const active = sessions.filter((session) => getStatus(session) === 'active').length;
    const closed = sessions.filter((session) => getStatus(session) === 'closed').length;
    const expired = sessions.filter((session) => getStatus(session) === 'expired').length;
    const attendanceCount = sessions.reduce((sum, session) => sum + (session.attendance_count ?? 0), 0);

    return {
      total: sessions.length,
      active,
      closed,
      expired,
      attendanceCount,
    };
  }, [sessions]);

  const handleCloseSession = async (lectureId: number) => {
    setClosingLectureId(lectureId);
    try {
      await lectureService.closeQRSession(lectureId, 'Closed from course attendance history');
      showNotification('This attendance session has ended', 'success');
      await loadPage();
    } catch {
      showNotification('Failed to end QR session', 'error');
    } finally {
      setClosingLectureId(null);
    }
  };

  if (isLoading || isLoadingPage) {
    return <LoadingSpinner fullScreen message="Loading course attendance history..." />;
  }

  if (!isAuthenticated || user?.role !== 'lecturer') {
    return <LoadingSpinner fullScreen message="Redirecting..." />;
  }

  return (
    <>
      <Header title="Course Attendance History" />
      <main className={styles.page}>
        <Container fluid className={styles.container}>
          <section className={styles.hero}>
            <Button type="button" className={styles.backButton} onClick={() => router.push('/dashboard/lecturer')}>
              <ArrowLeft size={18} aria-hidden="true" />
              Dashboard
            </Button>
            <div className={styles.heroCopy}>
              <p>{course?.course_code || 'Course'}</p>
              <h1>{course?.course_name || 'Attendance QR History'}</h1>
              <span>{course?.department || 'Department'} · {course?.semester || 'Semester'} · {course?.academic_year || 'Academic year'}</span>
            </div>
            <Button
              type="button"
              className={styles.generateButton}
              onClick={() => router.push(`/qr-generator?course_id=${courseId}`)}
            >
              <QrCode size={18} aria-hidden="true" />
              Generate QR
            </Button>
          </section>

          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <CalendarClock size={22} aria-hidden="true" />
              <span>QR Sessions</span>
              <strong>{summary.total}</strong>
            </div>
            <div className={styles.statCard}>
              <CircleDot size={22} aria-hidden="true" />
              <span>Active</span>
              <strong>{summary.active}</strong>
            </div>
            <div className={styles.statCard}>
              <Users size={22} aria-hidden="true" />
              <span>Total Attendance</span>
              <strong>{summary.attendanceCount}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Closed / Expired</span>
              <strong>{summary.closed + summary.expired}</strong>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Generated QR Attendance History</h2>
              <p>Only QR sessions generated for this course are shown here.</p>
            </div>

            {sessions.length === 0 ? (
              <div className={styles.emptyState}>
                <QrCode size={42} aria-hidden="true" />
                <h3>No QR attendance sessions yet</h3>
                <p>Generate the first QR code for this course to start recording attendance history.</p>
                <Button
                  type="button"
                  className={styles.generateButton}
                  onClick={() => router.push(`/qr-generator?course_id=${courseId}`)}
                >
                  <QrCode size={18} aria-hidden="true" />
                  Generate QR for this Course
                </Button>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Lecture</th>
                      <th>Date / Time</th>
                      <th>Generated</th>
                      <th>Status</th>
                      <th>Attendance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => {
                      const status = getStatus(session);
                      const isActive = status === 'active';

                      return (
                        <tr key={session.lecture_id}>
                          <td>
                            <strong>{session.topic}</strong>
                            <span>Lecture {session.lecture_number ?? session.lecture_id}</span>
                          </td>
                          <td>{formatDateTime(session.lecture_date, session.start_time)}</td>
                          <td>{formatGeneratedAt(session.qr_generated_at)}</td>
                          <td><span className={`${styles.badge} ${styles[status]}`}>{status}</span></td>
                          <td>{session.attendance_count ?? 0}</td>
                          <td>
                            <button
                              type="button"
                              className={styles.closeButton}
                              onClick={() => handleCloseSession(session.lecture_id)}
                              disabled={!isActive || closingLectureId === session.lecture_id}
                            >
                              {closingLectureId === session.lecture_id ? 'Ending...' : 'End Session'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Container>
      </main>
    </>
  );
}
