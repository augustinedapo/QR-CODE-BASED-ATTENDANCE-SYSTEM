// components/student/CourseCard.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, ProgressBar } from 'react-bootstrap';
import { ArrowRight, UserRound } from 'lucide-react';
import { Course, Enrollment, StudentCourseAttendanceSummary } from '@/types/index';
import { getMockData } from '@/utils/mockData';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
  enrollment: Enrollment;
  summary?: StudentCourseAttendanceSummary;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, summary }) => {
  const attendances = getMockData.getAttendances();
  
  // Calculate attendance percentage for this course
  const courseAttendances = attendances.length;
  const totalLectures = course.total_lectures || 25;
  const fallbackPercentage = totalLectures > 0 
    ? Math.round((courseAttendances / totalLectures) * 100) 
    : 0;
  const percentage = summary?.percentage ?? fallbackPercentage;
  const attended = summary?.attended ?? courseAttendances;
  const lectureTotal = summary?.total_lectures ?? totalLectures;
  const lateCount = summary?.late ?? 0;

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'success' };
    if (percentage >= 75) return { text: 'Good', color: 'info' };
    if (percentage >= 60) return { text: 'Fair', color: 'warning' };
    return { text: 'At Risk', color: 'danger' };
  };

  const status = getStatusBadge(percentage);

  return (
    <Card className={styles.card}>
      <Card.Body>
        <div className={styles.cardHeader}>
          <div>
            <h5 className={styles.courseName}>{course.course_name}</h5>
            <p className={styles.courseCode}>{course.course_code}</p>
            <p className={styles.lecturer}>
              <UserRound size={14} aria-hidden="true" /> {course.lecturer?.first_name} {course.lecturer?.last_name}
            </p>
          </div>
          <div className={`badge bg-${status.color} ${styles.badge}`}>
            {status.text}
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Classes</span>
            <span className={styles.statValue}>
              {attended}/{lectureTotal}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Attendance</span>
            <span className={styles.statValue}>{percentage}%</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Late</span>
            <span className={styles.statValue}>{lateCount}</span>
          </div>
        </div>

        <div className={styles.progressSection}>
          <ProgressBar
            now={percentage}
            className={`bg-${status.color}`}
            style={{ height: '8px' }}
          />
        </div>

        <Link className={styles.viewBtn} href={`/courses/${course.course_id}`}>
          View Details <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </Card.Body>
    </Card>
  );
};

export default CourseCard;
