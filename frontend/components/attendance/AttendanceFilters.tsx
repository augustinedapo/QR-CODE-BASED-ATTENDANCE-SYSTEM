'use client';

import React, { useState } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import styles from './AttendanceFilters.module.css';

interface FiltersState {
  course: string;
  dateRange: string;
  status: string;
  attendanceRate: string;
}

interface AttendanceFiltersProps {
  onFilterChange: (filters: FiltersState) => void;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FiltersState>({
    course: 'CSC301',
    dateRange: 'thisMonth',
    status: 'all',
    attendanceRate: 'all'
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card className={styles.card}>
      <Card.Body>
        <div className={styles.title}>Filter Attendance Records</div>
        <Row className="g-3">
          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label>Course</Form.Label>
              <Form.Select name="course" value={filters.course} onChange={handleChange}>
                <option value="all">All Courses</option>
                <option value="CSC301">CSC 301 - Computer Networks</option>
                <option value="CSC305">CSC 305 - Database Management</option>
                <option value="CSC307">CSC 307 - Software Engineering</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label>Date Range</Form.Label>
              <Form.Select name="dateRange" value={filters.dateRange} onChange={handleChange}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} lg={3}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={filters.status} onChange={handleChange}>
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
                value={filters.attendanceRate}
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
        </Row>

        <div className={styles.buttonGroup}>
          <Button variant="primary" className={styles.applyBtn}>
            Apply Filters
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AttendanceFilters;
