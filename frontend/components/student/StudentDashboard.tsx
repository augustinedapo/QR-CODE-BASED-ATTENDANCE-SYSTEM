// components/student/StudentDashboard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { Course, Enrollment, Lecture, MissedLecture, StudentCourseAttendanceSummary } from '@/types/index';
import { courseService } from '@/services/courseService';
import { attendanceService } from '@/services/attendanceService';
import { lectureService } from '@/services/lectureService';
import { CalendarDays, Hand, Search } from 'lucide-react';
import StudentAttendanceStats from './AttendanceStats';
import AttendanceChart from './AttendanceChart';
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
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filterOptionCourses, setFilterOptionCourses] = useState<Course[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [courseSummaries, setCourseSummaries] = useState<StudentCourseAttendanceSummary[]>([]);
  const [missedLectures, setMissedLectures] = useState<MissedLecture[]>([]);
  const [upcomingLectures, setUpcomingLectures] = useState<Lecture[]>([]);
  const [isFilteringCourses, setIsFilteringCourses] = useState(false);
  const [courseFilters, setCourseFilters] = useState({
    search: '',
    department: '',
    lecturer: '',
    semester: '',
    academic_year: '',
  });

  const getUniqueOptions = (selector: (course: Course) => string | undefined) => (
    Array.from(new Set(filterOptionCourses.map(selector).filter(Boolean) as string[])).sort()
  );

  const getLecturerName = (course: Course) => (
    `${course.lecturer?.first_name || ''} ${course.lecturer?.last_name || ''}`.trim()
  );

  const formatLectureDateTime = (date: string, time?: string) => {
    const formattedDate = new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return time ? `${formattedDate} · ${time.slice(0, 5)}` : formattedDate;
  };

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const [
          studentEnrollments,
          openCourses,
          summaries,
          missed,
          upcoming,
        ] = await Promise.all([
          courseService.getEnrollments(),
          courseService.getAvailableForEnrollment(),
          attendanceService.getMyCourseSummary(),
          attendanceService.getMissedLectures(),
          lectureService.getUpcomingLectures(),
        ]);
        setEnrollments(studentEnrollments);
        setAvailableCourses(openCourses);
        setFilterOptionCourses(openCourses);
        setCourseSummaries(summaries);
        setMissedLectures(missed);
        setUpcomingLectures(upcoming);
      } catch {
        showNotification('Failed to load enrollments', 'error');
      } finally {
        setIsLoadingEnrollments(false);
      }
    };

    if (!isLoading && user) {
      loadEnrollments();
    }
  }, [isLoading, user, showNotification]);

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCourseFilters((current) => ({ ...current, [name]: value }));
  };

  const applyCourseFilters = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsFilteringCourses(true);
    try {
      const filteredCourses = await courseService.getAvailableForEnrollment(courseFilters);
      setAvailableCourses(filteredCourses);
    } catch {
      showNotification('Failed to filter courses', 'error');
    } finally {
      setIsFilteringCourses(false);
    }
  };

  const handleEnroll = async (course: Course) => {
    setEnrollingCourseId(course.course_id);
    try {
      const enrollment = await courseService.enrollInCourse(course.course_id);
      setEnrollments((current) => [enrollment, ...current]);
      setAvailableCourses((current) => current.filter((item) => item.course_id !== course.course_id));
      setFilterOptionCourses((current) => current.filter((item) => item.course_id !== course.course_id));
      const [summaries, missed, upcoming] = await Promise.all([
        attendanceService.getMyCourseSummary(),
        attendanceService.getMissedLectures(),
        lectureService.getUpcomingLectures(),
      ]);
      setCourseSummaries(summaries);
      setMissedLectures(missed);
      setUpcomingLectures(upcoming);
      showNotification(`Enrolled in ${course.course_code}`, 'success');
    } catch {
      showNotification('Failed to enroll in course', 'error');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (isLoading || isLoadingEnrollments) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className={styles.dashboard}>
      <Container fluid className={styles.container}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {user?.first_name}! <Hand size={23} aria-hidden="true" />
          </h1>
          <p className={styles.welcomeSubtitle}>
            Here&apos;s your attendance overview for this semester
          </p>
        </section>

        {/* Stats Section */}
        <StudentAttendanceStats enrollments={enrollments} summaries={courseSummaries} />

        {/* Quick Actions */}
        <QuickActions onScanQR={() => setShowQRScanner(true)} />

        <AttendanceChart summaries={courseSummaries} />

        <section className={styles.coursesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Available Courses</h2>
          </div>
          <Form className={styles.filterBar} onSubmit={applyCourseFilters}>
            <Form.Control
              name="search"
              value={courseFilters.search}
              onChange={handleFilterChange}
              placeholder="Search course code or title"
            />
            <Form.Select
              name="department"
              value={courseFilters.department}
              onChange={handleFilterChange}
            >
              <option value="">All Departments</option>
              {getUniqueOptions((course) => course.department).map((department) => (
                <option value={department} key={department}>{department}</option>
              ))}
            </Form.Select>
            <Form.Select
              name="lecturer"
              value={courseFilters.lecturer}
              onChange={handleFilterChange}
            >
              <option value="">All Lecturers</option>
              {getUniqueOptions(getLecturerName).map((lecturer) => (
                <option value={lecturer} key={lecturer}>{lecturer}</option>
              ))}
            </Form.Select>
            <Form.Select
              name="semester"
              value={courseFilters.semester}
              onChange={handleFilterChange}
            >
              <option value="">All Semesters</option>
              {getUniqueOptions((course) => course.semester).map((semester) => (
                <option value={semester} key={semester}>{semester}</option>
              ))}
            </Form.Select>
            <Form.Select
              name="academic_year"
              value={courseFilters.academic_year}
              onChange={handleFilterChange}
            >
              <option value="">All Academic Years</option>
              {getUniqueOptions((course) => course.academic_year).map((academicYear) => (
                <option value={academicYear} key={academicYear}>{academicYear}</option>
              ))}
            </Form.Select>
            <Button type="submit" className={styles.filterButton} disabled={isFilteringCourses}>
              <Search size={16} aria-hidden="true" /> {isFilteringCourses ? 'Searching...' : 'Filter'}
            </Button>
          </Form>

          {availableCourses.length > 0 ? (
            <Row>
              {availableCourses.map((course) => (
                <Col key={course.course_id} md={6} lg={4} className="mb-4">
                  <Card className={styles.enrollCard}>
                    <Card.Body>
                      <h5 className={styles.enrollTitle}>{course.course_name}</h5>
                      <p className={styles.enrollMeta}>{course.course_code} · {course.department}</p>
                      <p className={styles.enrollMeta}>{course.location || 'Location not set'}</p>
                      <Button
                        className={styles.enrollButton}
                        onClick={() => handleEnroll(course)}
                        disabled={enrollingCourseId === course.course_id}
                      >
                        {enrollingCourseId === course.course_id ? 'Enrolling...' : 'Enroll'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className={styles.emptyCard}>
              <Card.Body>No open courses match your filters.</Card.Body>
            </Card>
          )}
        </section>

        {/* Courses Section */}
        <section className={styles.coursesSection}>
          <h2 className={styles.sectionTitle}>My Courses</h2>
          <Row>
            {enrollments.map((enrollment) => (
              <Col key={enrollment.enrollment_id} md={6} lg={4} className="mb-4">
                <CourseCard
                  course={enrollment.course!}
                  enrollment={enrollment}
                  summary={courseSummaries.find((item) => item.course.course_id === enrollment.course?.course_id)}
                />
              </Col>
            ))}
          </Row>
        </section>

        <section className={styles.insightGrid}>
          <Card className={styles.listCard}>
            <Card.Body>
              <h2 className={styles.sectionTitle}>Missed Lectures</h2>
              {missedLectures.length > 0 ? missedLectures.slice(0, 6).map((lecture) => (
                <div className={styles.listItem} key={lecture.lecture_id}>
                  <div>
                    <strong>{lecture.course_code}</strong>
                    <span>{lecture.topic}</span>
                  </div>
                  <small>{formatLectureDateTime(lecture.lecture_date, lecture.start_time)}</small>
                </div>
              )) : <p className={styles.emptyText}>No missed lectures recorded.</p>}
            </Card.Body>
          </Card>

          <Card className={styles.listCard}>
            <Card.Body>
              <h2 className={styles.sectionTitle}>Upcoming Sessions</h2>
              {upcomingLectures.length > 0 ? upcomingLectures.slice(0, 6).map((lecture) => (
                <div className={styles.listItem} key={lecture.lecture_id}>
                  <div>
                    <strong>{lecture.course?.course_code || 'Course'}</strong>
                    <span>{lecture.topic}</span>
                  </div>
                  <small><CalendarDays size={14} aria-hidden="true" /> {formatLectureDateTime(lecture.lecture_date, lecture.start_time)}</small>
                </div>
              )) : <p className={styles.emptyText}>No upcoming sessions yet.</p>}
            </Card.Body>
          </Card>
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
