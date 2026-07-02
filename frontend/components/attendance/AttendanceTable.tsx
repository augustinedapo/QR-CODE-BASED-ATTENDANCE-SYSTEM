// components/attendance/AttendanceTable.tsx

'use client';

import React, { useState } from 'react';
import { Card, Table, Form, Pagination } from 'react-bootstrap';
import { AttendanceRecord } from '@/types/index';
import styles from './AttendanceTable.module.css';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onExport: () => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ records, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRecords = records.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-success';
      case 'good':
        return 'bg-info';
      case 'fair':
        return 'bg-warning';
      case 'at-risk':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getPercentageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-success';
    if (percentage >= 75) return 'bg-info';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <Card className={styles.card}>
      <Card.Body>
        <div className={styles.tableHeader}>
          <h5 className={styles.tableTitle}>Student Attendance Records</h5>
          <div className={styles.tableActions}>
            <button className={`${styles.tableBtn} ${styles.export}`} onClick={onExport}>
              📥 Export Excel
            </button>
            <button className={`${styles.tableBtn} ${styles.print}`}>
              🖨️ Print
            </button>
          </div>
        </div>

        <div className={styles.searchBar}>
          <Form.Control
            type="text"
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.tableWrapper}>
          <Table responsive hover className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Attendance %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map((record) => (
                <tr key={record.student_id}>
                  <td>
                    <div className={styles.studentInfo}>
                      <div className={styles.studentAvatar}>
                        {record.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className={styles.studentName}>{record.name}</div>
                        <div className={styles.studentEmail}>{record.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{record.student_code}</td>
                  <td>{record.attended}</td>
                  <td>{record.absent}</td>
                  <td>{record.late}</td>
                  <td>
                    <div className={styles.percentageBar}>
                      <div
                        className={`${styles.percentageFill} ${getPercentageBarColor(
                          record.percentage
                        )}`}
                        style={{ width: `${record.percentage}%` }}
                      ></div>
                    </div>
                    <strong>{record.percentage}%</strong>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionIcon} title="View Details">
                      👁️
                    </button>
                    <button className={styles.actionIcon} title="Edit">
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationContainer}>
          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AttendanceTable;
