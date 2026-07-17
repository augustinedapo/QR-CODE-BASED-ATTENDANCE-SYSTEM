'use client';

import React, { useState } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { Course } from '@/types/index';
import styles from './AttendanceFilters.module.css';

interface FiltersState {
  course: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  status: string;
  attendanceRate: string;
  format: 'excel' | 'pdf';
}

interface AttendanceFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
  courses: Course[];
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({ filters, onFilterChange, courses }) => {
  const [draftFilters, setDraftFilters] = useState<FiltersState>(filters);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDraftFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  const handleApply = () => {
    onFilterChange(draftFilters);
  };

  return (
    <Card className={styles.card}>
      <Card.Body>
        <div className={styles.title}>Filter Attendance Records</div>
        <Row className="g-3">
          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label>Course</Form.Label>
              <Form.Select name="course" value={draftFilters.course} onChange={handleChange}>
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={String(course.course_id)}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label>Date Range</Form.Label>
              <Form.Select name="dateRange" value={draftFilters.dateRange} onChange={handleChange}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {draftFilters.dateRange === 'custom' && (
            <>
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control type="date" name="startDate" value={draftFilters.startDate} onChange={handleChange} />
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control type="date" name="endDate" value={draftFilters.endDate} onChange={handleChange} />
                </Form.Group>
              </Col>
            </>
          )}

          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={draftFilters.status} onChange={handleChange}>
                <option value="all">All Status</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
                <option value="late">Late Only</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label>Attendance Rate</Form.Label>
              <Form.Select
                name="attendanceRate"
                value={draftFilters.attendanceRate}
                onChange={handleChange}
              >
                <option value="all">All Rates</option>
                <option value="90+">≥ 90% (Excellent)</option>
                <option value="75-89">75-89% (Good)</option>
                <option value="60-74">60-74% (Fair)</option>
                <option value="under60">{'< 60% (At Risk)'}</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label>Export Format</Form.Label>
              <Form.Select name="format" value={draftFilters.format} onChange={handleChange}>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className={styles.buttonGroup}>
          <Button variant="primary" className={styles.applyBtn} onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AttendanceFilters;
