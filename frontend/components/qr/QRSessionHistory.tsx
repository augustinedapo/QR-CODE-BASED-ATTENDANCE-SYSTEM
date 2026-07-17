'use client';

import React from 'react';
import { Lecture } from '@/types/index';
import styles from './QRSessionHistory.module.css';

interface QRSessionHistoryProps {
  sessions: Lecture[];
  compact?: boolean;
  onCloseSession?: (lectureId: number) => void;
}

function getStatus(session: Lecture) {
  return session.computed_qr_status || session.qr_status || 'pending';
}

export default function QRSessionHistory({ sessions, compact = false, onCloseSession }: QRSessionHistoryProps) {
  const visibleSessions = compact ? sessions.slice(0, 5) : sessions;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{compact ? 'Recent QR Sessions' : 'QR Session History'}</h2>
      </div>

      {visibleSessions.length === 0 ? (
        <p className={styles.empty}>No QR sessions have been generated yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Lecture</th>
                <th>Course</th>
                <th>Generated</th>
                <th>Status</th>
                <th>Attendance</th>
                {!compact && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {visibleSessions.map((session) => {
                const status = getStatus(session);
                return (
                  <tr key={session.lecture_id}>
                    <td>{session.topic}</td>
                    <td>{session.course?.course_code || 'Course'}</td>
                    <td>{session.qr_generated_at ? new Date(session.qr_generated_at).toLocaleString() : 'Not generated'}</td>
                    <td><span className={styles.badge}>{status}</span></td>
                    <td>{session.attendance_count ?? 0}</td>
                    {!compact && (
                      <td>
                        <button
                          className={styles.closeBtn}
                          onClick={() => onCloseSession?.(session.lecture_id)}
                          disabled={status !== 'active'}
                        >
                          End Session
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
