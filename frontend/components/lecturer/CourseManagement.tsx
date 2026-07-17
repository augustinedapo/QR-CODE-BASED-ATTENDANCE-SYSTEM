// components/lecturer/CourseManagement.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Card, Col, Collapse, Form, Modal, Row } from 'react-bootstrap';
import { BarChart3, Eye, Pencil, Plus, QrCode, Trash2 } from 'lucide-react';
import { Course } from '@/types/index';
import { courseService, CoursePayload } from '@/services/courseService';
import styles from './CourseManagement.module.css';

interface CourseManagementProps {
  courses: Course[];
  onCourseCreated: (course: Course) => void;
  onCourseUpdated: (course: Course) => void;
  onCourseDeleted: (courseId: number) => void;
}

const initialFormData = {
  course_code: '',
  course_name: '',
  description: '',
  department: '',
  semester: '',
  academic_year: '',
  capacity: '100',
  credits: '3',
  schedule: '',
  location: '',
};

const CourseManagement: React.FC<CourseManagementProps> = ({
  courses,
  onCourseCreated,
  onCourseUpdated,
  onCourseDeleted,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCourseId(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (course: Course) => {
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      description: course.description || '',
      department: course.department,
      semester: course.semester,
      academic_year: course.academic_year,
      capacity: String(course.capacity ?? 100),
      credits: String(course.credits ?? 3),
      schedule: typeof course.schedule_json?.text === 'string' ? course.schedule_json.text : '',
      location: course.location || '',
    });
    setEditingCourseId(course.course_id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload: CoursePayload = {
        course_code: formData.course_code.trim(),
        course_name: formData.course_name.trim(),
        description: formData.description.trim(),
        department: formData.department.trim(),
        semester: formData.semester.trim(),
        academic_year: formData.academic_year.trim(),
        capacity: Number(formData.capacity),
        credits: Number(formData.credits),
        schedule_json: { text: formData.schedule.trim() },
        location: formData.location.trim(),
        is_active: true,
      };

      const course = editingCourseId
        ? await courseService.updateCourse(String(editingCourseId), payload)
        : await courseService.createCourse(payload);

      if (editingCourseId) {
        onCourseUpdated(course);
      } else {
        onCourseCreated(course);
      }
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save course.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(courseToDelete.course_id);
      onCourseDeleted(courseToDelete.course_id);
      setCourseToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to archive course.';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getScheduleText = (course: Course) => {
    const schedule = course.schedule_json;
    if (schedule && typeof schedule.text === 'string' && schedule.text) {
      return schedule.text;
    }
    return 'Schedule not set';
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>My Courses</h2>
        <Button
          className={styles.createToggle}
          onClick={() => {
            if (showForm && !editingCourseId) {
              resetForm();
              return;
            }
            setFormData(initialFormData);
            setEditingCourseId(null);
            setShowForm(true);
            setError('');
          }}
        >
          <Plus size={18} aria-hidden="true" /> Register Course
        </Button>
      </div>

      <Collapse in={showForm}>
        <Card className={styles.formCard}>
          <Card.Body>
            <h3 className={styles.formTitle}>{editingCourseId ? 'Edit Course' : 'Register a Course'}</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Course Code</Form.Label>
                    <Form.Control name="course_code" value={formData.course_code} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Course Name</Form.Label>
                    <Form.Control name="course_name" value={formData.course_name} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Department</Form.Label>
                    <Form.Control name="department" value={formData.department} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Semester</Form.Label>
                    <Form.Control name="semester" value={formData.semester} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Academic Year</Form.Label>
                    <Form.Control name="academic_year" value={formData.academic_year} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Capacity</Form.Label>
                    <Form.Control type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Credits</Form.Label>
                    <Form.Control type="number" min="1" name="credits" value={formData.credits} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Schedule</Form.Label>
                    <Form.Control name="schedule" value={formData.schedule} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Control name="location" value={formData.location} onChange={handleChange} required disabled={isSubmitting} />
                  </Form.Group>
                </Col>
              </Row>
              <div className={styles.formActions}>
                <Button variant="outline-secondary" type="button" onClick={resetForm} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Course'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Collapse>

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
                      <strong>Students:</strong> {course.student_count ?? course.students_count ?? 0}
                    </span>
                    <span className={styles.detail}>
                      <strong>Schedule:</strong> {getScheduleText(course)}
                    </span>
                  </div>
                </div>
                <div className={styles.courseActions}>
                  <Link className={styles.actionIcon} href={`/courses/${course.course_id}`} title="View Course">
                    <Eye size={18} aria-hidden="true" />
                  </Link>
                  <Link className={styles.actionIcon} href={`/qr-generator?course_id=${course.course_id}`} title={`Generate QR for ${course.course_code}`}>
                    <QrCode size={18} aria-hidden="true" />
                  </Link>
                  <Link
                    className={styles.actionIcon}
                    href={`/dashboard/lecturer/courses/${course.course_id}/attendance-history`}
                    title={`View QR attendance history for ${course.course_code}`}
                  >
                    <BarChart3 size={18} aria-hidden="true" />
                  </Link>
                  <button className={styles.actionIcon} title="Edit Course" onClick={() => startEdit(course)}>
                    <Pencil size={18} aria-hidden="true" />
                  </button>
                  <button className={`${styles.actionIcon} ${styles.dangerIcon}`} title="Archive Course" onClick={() => setCourseToDelete(course)}>
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className={styles.courseStats}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{course.average_attendance ?? 0}%</div>
                  <div className={styles.statLabel}>Avg. Attendance</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{course.qr_lectures_count ?? 0}</div>
                  <div className={styles.statLabel}>Lectures Held</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Modal show={Boolean(courseToDelete)} onHide={() => setCourseToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Archive Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Archive {courseToDelete?.course_code}? Students, lectures, and attendance records stay intact, but the course will no longer appear as active.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setCourseToDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Archiving...' : 'Archive Course'}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default CourseManagement;
