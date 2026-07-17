'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Badge, Card, Col, Container, Row, Table } from 'react-bootstrap';
import { ArrowLeft, CalendarDays, MapPin, UsersRound } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { Course, Enrollment, Lecture, StudentCourseAttendanceSummary } from '@/types/index';
import { courseService } from '@/services/courseService';
import { attendanceService } from '@/services/attendanceService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './page.module.css';

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [summary, setSummary] = useState<StudentCourseAttendanceSummary | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [error, setError] = useState('');
  const chartData = lectures.map((lecture, index) => ({
    lecture: `L${index + 1}`,
    attended: lecture.attendance_count ?? 0,
    topic: lecture.topic,
  }));

  useEffect(() => {
    const loadCourse = async () => {
      if (!params?.courseId || !user) return;

      setIsLoadingCourse(true);
      setError('');
      try {
        const [courseDetails, courseLectures] = await Promise.all([
          courseService.getCourse(params.courseId),
          courseService.getCourseLectures(params.courseId),
        ]);
        setCourse(courseDetails);
        setLectures(courseLectures);

        if (user.role === 'lecturer') {
          const courseStudents = await courseService.getCourseStudents(params.courseId);
          setStudents(courseStudents);
        }

        if (user.role === 'student') {
          const summaries = await attendanceService.getMyCourseSummary();
          setSummary(summaries.find((item) => String(item.course.course_id) === params.courseId) || null);
        }
      } catch {
        setError('Unable to load this course.');
      } finally {
        setIsLoadingCourse(false);
      }
    };

    if (!isLoading) {
      loadCourse();
    }
  }, [isLoading, params?.courseId, user]);

  if (isLoading || isLoadingCourse) {
    return <LoadingSpinner message="Loading course details..." />;
  }

  if (error || !course) {
    return (
      <div className={styles.page}>
        <Container className={styles.container}>
          <Card className={styles.emptyCard}>
            <Card.Body>
              <p>{error || 'Course not found.'}</p>
              <button className={styles.backButton} onClick={() => router.back()}>
                <ArrowLeft size={16} aria-hidden="true" /> Go Back
              </button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Container fluid className={styles.container}>
        <Link href={user?.role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/student'} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to Dashboard
        </Link>

        <section className={styles.hero}>
          <div>
            <Badge bg="primary" className={styles.badge}>{course.course_code}</Badge>
            <h1>{course.course_name}</h1>
            <p>{course.description || 'No description has been added for this course yet.'}</p>
          </div>
          <div className={styles.heroMeta}>
            <span><UsersRound size={17} aria-hidden="true" /> {course.student_count ?? 0} Students</span>
            <span><CalendarDays size={17} aria-hidden="true" /> {course.semester} · {course.academic_year}</span>
            <span><MapPin size={17} aria-hidden="true" /> {course.location || 'Location not set'}</span>
          </div>
        </section>

        <Row className="g-4">
          <Col lg={8}>
            <Card className={styles.panel}>
              <Card.Body>
                <h2>Lecture Sessions</h2>
                {chartData.length > 0 && (
                  <div className={styles.chartFrame}>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className={styles.grid} />
                        <XAxis dataKey="lecture" tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgba(79, 124, 172, 0.08)' }}
                          formatter={(value) => [value, 'Attended']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.topic || 'Lecture'}
                        />
                        <Bar dataKey="attended" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {lectures.length > 0 ? (
                  <div className={styles.sessionList}>
                    {lectures.map((lecture) => (
                      <div className={styles.sessionItem} key={lecture.lecture_id}>
                        <div>
                          <strong>{lecture.topic}</strong>
                          <span>{lecture.lecture_date} · {lecture.start_time}</span>
                        </div>
                        <Badge bg={lecture.computed_qr_status === 'active' ? 'success' : 'secondary'}>
                          {lecture.computed_qr_status || lecture.qr_status || 'scheduled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>No lecture sessions have been created yet.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className={styles.panel}>
              <Card.Body>
                <h2>{user?.role === 'student' ? 'My Attendance' : 'Course Facts'}</h2>
                {user?.role === 'student' ? (
                  <div className={styles.metricGrid}>
                    <div><span>Attendance</span><strong>{summary?.percentage ?? 0}%</strong></div>
                    <div><span>Attended</span><strong>{summary?.attended ?? 0}</strong></div>
                    <div><span>Missed</span><strong>{summary?.missed ?? 0}</strong></div>
                    <div><span>Late</span><strong>{summary?.late ?? 0}</strong></div>
                  </div>
                ) : (
                  <div className={styles.metricGrid}>
                    <div><span>Capacity</span><strong>{course.capacity ?? 0}</strong></div>
                    <div><span>Credits</span><strong>{course.credits ?? 0}</strong></div>
                    <div><span>Lectures</span><strong>{course.total_lectures ?? lectures.length}</strong></div>
                    <div><span>Status</span><strong>{course.is_active ? 'Active' : 'Archived'}</strong></div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {user?.role === 'lecturer' && (
          <Card className={styles.panel}>
            <Card.Body>
              <h2>Enrolled Students</h2>
              {students.length > 0 ? (
                <Table responsive borderless className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((enrollment) => (
                      <tr key={enrollment.enrollment_id}>
                        <td>{enrollment.student?.first_name} {enrollment.student?.last_name}</td>
                        <td>{enrollment.student?.email}</td>
                        <td>{enrollment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className={styles.emptyText}>No students are enrolled in this course yet.</p>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
}
