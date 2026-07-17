// components/attendance/AttendanceView.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNotification } from '@/hooks/useNotification';
import { getMockData } from '@/utils/mockData';
import { AttendanceRecord, Course } from '@/types/index';
import { attendanceService } from '@/services/attendanceService';
import { courseService } from '@/services/courseService';
import AttendanceFilters from './AttendanceFilters';
import AttendanceStats from './AttendanceStats';
import AttendanceTable from './AttendanceTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './AttendanceView.module.css';

type FiltersState = {
  course: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  status: string;
  attendanceRate: string;
  format: 'excel' | 'pdf';
};

type FilterableAttendanceRecord = AttendanceRecord & {
  course: string;
  recordedAt: string;
};

const courseCodes = ['CSC301', 'CSC305', 'CSC307'];

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(dateRange: string, startDate: string, endDate: string) {
  const today = new Date();
  const start = new Date(today);

  if (dateRange === 'today') {
    return { start: toDateInput(today), end: toDateInput(today) };
  }

  if (dateRange === 'thisWeek') {
    start.setDate(today.getDate() - 7);
    return { start: toDateInput(start), end: toDateInput(today) };
  }

  if (dateRange === 'thisMonth') {
    start.setMonth(today.getMonth() - 1);
    return { start: toDateInput(start), end: toDateInput(today) };
  }

  if (dateRange === 'custom' && startDate && endDate) {
    return { start: startDate, end: endDate };
  }

  start.setFullYear(today.getFullYear() - 1);
  return { start: toDateInput(start), end: toDateInput(today) };
}

function addMockFilterData(records: (AttendanceRecord & { course?: string })[]): FilterableAttendanceRecord[] {
  const now = new Date();

  return records.map((record, index) => {
    const recordedAt = new Date(now);
    recordedAt.setDate(now.getDate() - index * 3);

    return {
      ...record,
      course: record.course ?? courseCodes[index % courseCodes.length],
      recordedAt: recordedAt.toISOString()
    };
  });
}

function isWithinDateRange(recordedAt: string, dateRange: string) {
  if (dateRange === 'all' || dateRange === 'custom') {
    return true;
  }

  const recordDate = new Date(recordedAt);
  const now = new Date();
  const start = new Date(now);

  if (dateRange === 'today') {
    return recordDate.toDateString() === now.toDateString();
  }

  if (dateRange === 'thisWeek') {
    start.setDate(now.getDate() - 7);
    return recordDate >= start;
  }

  if (dateRange === 'thisMonth') {
    start.setMonth(now.getMonth() - 1);
    return recordDate >= start;
  }

  return true;
}

function matchesStatus(record: AttendanceRecord, status: string) {
  if (status === 'present') {
    return record.attended > 0;
  }

  if (status === 'absent') {
    return record.absent > 0;
  }

  if (status === 'late') {
    return record.late > 0;
  }

  return true;
}

function matchesAttendanceRate(record: AttendanceRecord, attendanceRate: string) {
  if (attendanceRate === '90+') {
    return record.percentage >= 90;
  }

  if (attendanceRate === '75-89') {
    return record.percentage >= 75 && record.percentage <= 89;
  }

  if (attendanceRate === '60-74') {
    return record.percentage >= 60 && record.percentage <= 74;
  }

  if (attendanceRate === 'under60') {
    return record.percentage < 60;
  }

  return true;
}

const AttendanceView: React.FC = () => {
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<FiltersState>({
    course: 'all',
    dateRange: 'thisMonth',
    startDate: '',
    endDate: '',
    status: 'all',
    attendanceRate: 'all',
    format: 'excel'
  });

  useEffect(() => {
    let isMounted = true;

    courseService.getCourses()
      .then((lecturerCourses) => {
        if (!isMounted) return;
        setCourses(lecturerCourses);
      })
      .catch(() => {
        if (!isMounted) return;
        showNotification('Failed to load course filters', 'error');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showNotification]);

  const records = useMemo(() => addMockFilterData(getMockData.getAttendanceRecords()), []);
  const selectedCourse = courses.find((course) => String(course.course_id) === filters.course);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const selectedCourse = courses.find((course) => String(course.course_id) === filters.course);
        const selectedCourseCode = selectedCourse?.course_code;
        const matchesCourse = filters.course === 'all' || record.course === selectedCourseCode;

        return (
          matchesCourse &&
          isWithinDateRange(record.recordedAt, filters.dateRange) &&
          matchesStatus(record, filters.status) &&
          matchesAttendanceRate(record, filters.attendanceRate)
        );
      }),
    [filters, records, courses]
  );

  const handleFilterChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
    showNotification('Filters applied', 'success');
  };

  const handleExport = async () => {
    const dateRange = getDateRange(filters.dateRange, filters.startDate, filters.endDate);

    try {
      const report = await attendanceService.generateReport({
        type: selectedCourse ? 'course' : 'department',
        start_date: dateRange.start,
        end_date: dateRange.end,
        format: filters.format,
        course_id: selectedCourse?.course_id,
        department: selectedCourse?.department,
      });

      const url = URL.createObjectURL(report.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.filename;
      link.click();
      URL.revokeObjectURL(url);
      showNotification('Attendance report downloaded', 'success');
    } catch {
      showNotification('Failed to generate attendance report', 'error');
    }
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
          <p className={styles.subtitle}>
            {selectedCourse ? `${selectedCourse.course_code} - ${selectedCourse.course_name}` : 'All active courses'}
          </p>
        </section>

        {/* Filters */}
        <AttendanceFilters filters={filters} onFilterChange={handleFilterChange} courses={courses} />

        {/* Stats */}
        <AttendanceStats records={filteredRecords} />

        {/* Table */}
        <AttendanceTable
          records={filteredRecords}
          onExport={handleExport}
          exportLabel={filters.format === 'pdf' ? 'Export PDF' : 'Export Excel'}
        />
      </Container>
    </div>
  );
};

export default AttendanceView;
