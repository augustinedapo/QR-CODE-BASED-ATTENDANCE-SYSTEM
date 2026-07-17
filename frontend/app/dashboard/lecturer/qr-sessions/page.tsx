'use client';

import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import QRSessionHistory from '@/components/qr/QRSessionHistory';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { lectureService } from '@/services/lectureService';
import { Lecture } from '@/types/index';

export default function LecturerQRSessionsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [sessions, setSessions] = useState<Lecture[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await lectureService.getQRSessions();
      setSessions(response);
    } catch {
      showNotification('Failed to load QR sessions', 'error');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'lecturer') {
      router.push('/dashboard/student');
      return;
    }

    let isMounted = true;
    lectureService.getQRSessions()
      .then((response) => {
        if (isMounted) {
          setSessions(response);
        }
      })
      .catch(() => {
        if (isMounted) {
          showNotification('Failed to load QR sessions', 'error');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSessions(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isLoading, router, showNotification, user]);

  const handleCloseSession = async (lectureId: number) => {
    try {
      await lectureService.closeQRSession(lectureId, 'Closed from session history');
      showNotification('This attendance session has ended', 'success');
      await loadSessions();
    } catch {
      showNotification('Failed to end QR session', 'error');
    }
  };

  if (isLoading || isLoadingSessions) {
    return <LoadingSpinner fullScreen message="Loading QR sessions..." />;
  }

  return (
    <>
      <Header title="QR Sessions" />
      <div style={{ minHeight: '100vh', padding: '34px 0 48px', background: 'var(--page-gradient)' }}>
        <Container fluid style={{ maxWidth: 1200 }}>
          <QRSessionHistory sessions={sessions} onCloseSession={handleCloseSession} />
        </Container>
      </div>
    </>
  );
}
