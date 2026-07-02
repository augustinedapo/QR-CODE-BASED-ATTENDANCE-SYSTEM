// components/attendance/AttendanceView.tsx

'use client';

import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNotification } from '@/hooks/useNotification';
import { getMockData } from '@/utils/mockData';
import AttendanceFilters from './AttendanceFilters';
import AttendanceStats from './AttendanceStats';
import AttendanceTable from './AttendanceTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './AttendanceView.module.css';

const AttendanceView: React.FC = () => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    course: 'CSC301',
    dateRange: 'thisMonth',
    status: 'all',
    attendanceRate: 'all'
  });

  const records = getMockData.getAttendanceRecords();

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // In production, fetch filtered data from API
  };

  const handleExport = () => {
    showNotification('Exporting to Excel...', 'info');
    // In production, implement actual export functionality
    setTimeout(() => {
      showNotification('File exported successfully!', 'success');
    }, 1500);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading attendance records..." />;
  }

  return (
    <div className={styles.page}>
      <Container fluid className={styles.container}>
        {/* Header */}
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Attendance Records</h1>
          <p className={styles.subtitle}>CSC 301 - Computer Networks</p>
        </section>

        {/* Filters */}
        <AttendanceFilters onFilterChange={handleFilterChange} />

        {/* Stats */}
        <AttendanceStats records={records} />

        {/* Table */}
        <AttendanceTable records={records} onExport={handleExport} />
      </Container>
    </div>
  );
};

export default AttendanceView;
