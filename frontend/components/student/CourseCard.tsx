// components/student/CourseCard.tsx

'use client';

import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { Course, Enrollment } from '@/types/index';
import { getMockData } from '@/utils/mockData';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
  enrollment: Enrollment;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, enrollment }) => {
  const attendances = getMockData.getAttendances();
  
  // Calculate attendance percentage for this course
  const courseAttendances = attendances.length;
  const totalLectures = course.total_lectures || 25;
  const percentage = totalLectures > 0 
    ? Math.round((courseAttendances / totalLectures) * 100) 
    : 0;

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
              👨‍🏫 {course.lecturer?.first_name} {course.lecturer?.last_name}
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
              {courseAttendances}/{totalLectures}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Attendance</span>
            <span className={styles.statValue}>{percentage}%</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Score</span>
            <span className={styles.statValue}>4.5/5</span>
          </div>
        </div>

        <div className={styles.progressSection}>
          <ProgressBar
            now={percentage}
            className={`bg-${status.color}`}
            style={{ height: '8px' }}
          />
        </div>

        <button className={styles.viewBtn}>View Details →</button>
      </Card.Body>
    </Card>
  );
};

export default CourseCard;
