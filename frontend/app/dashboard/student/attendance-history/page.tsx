'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { ArrowLeft, CalendarDays, CheckCircle2, CopyCheck, Filter, MapPinOff, Search, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceAttempt } from '@/types/index';
import styles from './page.module.css';

type StatusFilter = 'all' | 'success' | 'late' | 'duplicate' | 'failed';

const statusLabels: Record<StatusFilter, string> = {
  all: 'All Statuses',
  success: 'Present',
  late: 'Late',
  duplicate: 'Duplicate',
  failed: 'Rejected',
};

function getAttemptStatus(attempt: AttendanceAttempt): Exclude<StatusFilter, 'all'> {
  if (attempt.status === 'success' && attempt.attendance_is_late) return 'late';
  if (attempt.status === 'success') return 'success';
  if (attempt.status === 'duplicate') return 'duplicate';
  return 'failed';
}

function getStatusIcon(status: Exclude<StatusFilter, 'all'>) {
  if (status === 'success') return CheckCircle2;
  if (status === 'late') return CalendarDays;
  if (status === 'duplicate') return CopyCheck;
  return XCircle;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatLectureTime(attempt: AttendanceAttempt) {
  const lecture = attempt.lecture;
  if (!lecture) return 'Lecture not available';

  const date = new Intl.DateTimeFormat('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(lecture.lecture_date));

  return `${date} · ${lecture.start_time.slice(0, 5)}`;
}

export default function StudentAttendanceHistoryPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttendanceAttempt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [filters, setFilters] = useState({
    course: '',
    status: 'all' as StatusFilter,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'student') {
      router.push('/dashboard/lecturer');
    }
  }, [isLoading, isAuthenticated, router, user]);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await attendanceService.getScanHistory();
        setAttempts(history);
      } catch {
        showNotification('Failed to load scan history', 'error');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (!isLoading && isAuthenticated && user?.role === 'student') {
      loadHistory();
    }
  }, [isLoading, isAuthenticated, user, showNotification]);

  const courseOptions = useMemo(() => (
    Array.from(new Set(
      attempts
        .map((attempt) => attempt.lecture?.course?.course_code)
        .filter(Boolean) as string[]
    )).sort()
  ), [attempts]);

  const filteredAttempts = useMemo(() => (
    attempts.filter((attempt) => {
      const attemptStatus = getAttemptStatus(attempt);
      const courseCode = attempt.lecture?.course?.course_code ?? '';
      const attemptDate = attempt.timestamp.slice(0, 10);

      const matchesCourse = !filters.course || courseCode === filters.course;
      const matchesStatus = filters.status === 'all' || attemptStatus === filters.status;
      const matchesStart = !filters.startDate || attemptDate >= filters.startDate;
      const matchesEnd = !filters.endDate || attemptDate <= filters.endDate;

      return matchesCourse && matchesStatus && matchesStart && matchesEnd;
    })
  ), [attempts, filters]);

  const totals = useMemo(() => ({
    total: filteredAttempts.length,
    present: filteredAttempts.filter((attempt) => getAttemptStatus(attempt) === 'success').length,
    late: filteredAttempts.filter((attempt) => getAttemptStatus(attempt) === 'late').length,
    rejected: filteredAttempts.filter((attempt) => getAttemptStatus(attempt) === 'failed').length,
    duplicate: filteredAttempts.filter((attempt) => getAttemptStatus(attempt) === 'duplicate').length,
  }), [filteredAttempts]);

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      course: '',
      status: 'all',
      startDate: '',
      endDate: '',
    });
  };

  if (isLoading || isLoadingHistory) {
    return <LoadingSpinner message="Loading attendance history..." fullScreen />;
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return <LoadingSpinner message="Redirecting..." fullScreen />;
  }

  return (
    <>
      <Header title="Attendance History" />
      <main className={styles.page}>
        <Container fluid className={styles.container}>
          <section className={styles.hero}>
            <Button type="button" className={styles.backButton} onClick={() => router.push('/dashboard/student')}>
              <ArrowLeft size={18} aria-hidden="true" />
              Dashboard
            </Button>
            <div>
              <h1 className={styles.title}>Scan History</h1>
              <p className={styles.subtitle}>Review every QR attendance scan, including successful, late, duplicate, and rejected attempts.</p>
            </div>
          </section>

          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span>Total Scans</span>
              <strong>{totals.total}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Present</span>
              <strong>{totals.present}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Late</span>
              <strong>{totals.late}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Rejected</span>
              <strong>{totals.rejected}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Duplicate</span>
              <strong>{totals.duplicate}</strong>
            </div>
          </section>

          <Form className={styles.filterBar}>
            <Form.Select name="course" value={filters.course} onChange={handleFilterChange} aria-label="Filter by course">
              <option value="">All Courses</option>
              {courseOptions.map((courseCode) => (
                <option key={courseCode} value={courseCode}>{courseCode}</option>
              ))}
            </Form.Select>
            <Form.Select name="status" value={filters.status} onChange={handleFilterChange} aria-label="Filter by status">
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Form.Select>
            <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            <Button type="button" className={styles.resetButton} onClick={resetFilters}>
              <Filter size={17} aria-hidden="true" />
              Reset
            </Button>
          </Form>

          <section className={styles.historyPanel}>
            {filteredAttempts.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={34} aria-hidden="true" />
                <h2>No scan history found</h2>
                <p>No QR scan attempts match the selected filters.</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {filteredAttempts.map((attempt) => {
                  const status = getAttemptStatus(attempt);
                  const StatusIcon = getStatusIcon(status);
                  const course = attempt.lecture?.course;

                  return (
                    <article key={attempt.attempt_id} className={styles.historyItem}>
                      <div className={`${styles.statusIcon} ${styles[status]}`}>
                        <StatusIcon size={22} aria-hidden="true" />
                      </div>

                      <div className={styles.historyMain}>
                        <div className={styles.historyTopline}>
                          <div>
                            <h2>{course?.course_name || 'Unknown Course'}</h2>
                            <p>{course?.course_code || 'No course code'} · {attempt.lecture?.topic || 'Unknown lecture'}</p>
                          </div>
                          <span className={`${styles.statusBadge} ${styles[status]}`}>
                            {statusLabels[status]}
                          </span>
                        </div>

                        <div className={styles.metaGrid}>
                          <span>Scan Time <strong>{formatDateTime(attempt.timestamp)}</strong></span>
                          <span>Lecture Time <strong>{formatLectureTime(attempt)}</strong></span>
                          <span>Location Accuracy <strong>{attempt.accuracy ? `${attempt.accuracy}m` : 'Not captured'}</strong></span>
                          <span>Distance <strong>{attempt.distance_from_venue ? `${attempt.distance_from_venue}m` : 'Not available'}</strong></span>
                        </div>

                        <div className={styles.reasonRow}>
                          <MapPinOff size={17} aria-hidden="true" />
                          <span>{attempt.message || 'No additional scan message was returned.'}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </Container>
      </main>
    </>
  );
}
