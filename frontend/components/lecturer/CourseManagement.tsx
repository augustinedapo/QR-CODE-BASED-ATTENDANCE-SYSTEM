// components/lecturer/CourseManagement.tsx

'use client';

import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { Course } from '@/types/index';
import styles from './CourseManagement.module.css';

interface CourseManagementProps {
  courses: Course[];
}

const CourseManagement: React.FC<CourseManagementProps> = ({ courses }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>My Courses</h2>

      <div className={styles.coursesContainer}>
        {courses.map((course) => (
          <Card key={course.course_id} className={styles.courseCard}>
            <Card.Body>
              <div className={styles.courseHeader}>
                <div className={styles.courseInfo}>
                  <h4 className={styles.courseName}>{course.course_name}</h4>
                  <div className={styles.courseDetails}>
                    <span className={styles.detail}>
                      <strong>Code:</strong> {course.course_code}
                    </span>
                    <span className={styles.detail}>
                      <strong>Students:</strong> {course.students_count}
                    </span>
                    <span className={styles.detail}>
                      <strong>Schedule:</strong> Mon, Wed 10:00 AM
                    </span>
                  </div>
                </div>
                <div className={styles.courseActions}>
                  <button className={styles.actionIcon} title="Generate QR">
                    🔲
                  </button>
                  <button className={styles.actionIcon} title="View Attendance">
                    📊
                  </button>
                  <button className={styles.actionIcon} title="Create Assessment">
                    📝
                  </button>
                </div>
              </div>

              <div className={styles.courseStats}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>85%</div>
                  <div className={styles.statLabel}>Avg. Attendance</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{course.total_lectures}</div>
                  <div className={styles.statLabel}>Lectures Held</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>10</div>
                  <div className={styles.statLabel}>Assessments</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>4.6/5</div>
                  <div className={styles.statLabel}>Feedback Rating</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CourseManagement;
