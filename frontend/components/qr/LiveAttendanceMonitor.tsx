'use client';

import React, { useEffect, useState } from 'react';
import { lectureService, LiveAttendanceCounts } from '@/services/lectureService';
import styles from './LiveAttendanceMonitor.module.css';

interface LiveAttendanceMonitorProps {
  lectureId: number;
  enabled?: boolean;
}

const emptyCounts: LiveAttendanceCounts = {
  lecture_id: 0,
  status: 'pending',
  total: 0,
  present: 0,
  absent: 0,
  attendance_count: 0,
};

export default function LiveAttendanceMonitor({ lectureId, enabled = true }: LiveAttendanceMonitorProps) {
  const [counts, setCounts] = useState<LiveAttendanceCounts>(emptyCounts);

  useEffect(() => {
    if (!enabled || !lectureId) {
      return;
    }

    let isMounted = true;

    const loadCounts = async () => {
      try {
        const response = await lectureService.getLiveAttendance(lectureId);
        if (isMounted) {
          setCounts(response);
        }
      } catch {
        // Keep the last known counts visible while polling.
      }
    };

    loadCounts();
    const intervalId = window.setInterval(loadCounts, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [enabled, lectureId]);

  return (
    <section className={styles.monitor}>
      <div className={styles.header}>
        <h3 className={styles.title}>Live Attendance</h3>
        <span className={styles.status}>{counts.status}</span>
      </div>

      <div className={styles.counts}>
        <div className={styles.countBox}>
          <span className={styles.value}>{counts.total}</span>
          <span className={styles.label}>Total</span>
        </div>
        <div className={styles.countBox}>
          <span className={styles.value}>{counts.present}</span>
          <span className={styles.label}>Present</span>
        </div>
        <div className={styles.countBox}>
          <span className={styles.value}>{counts.absent}</span>
          <span className={styles.label}>Absent</span>
        </div>
      </div>
    </section>
  );
}
