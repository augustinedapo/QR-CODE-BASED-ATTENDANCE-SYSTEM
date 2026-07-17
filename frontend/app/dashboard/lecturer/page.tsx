// app/dashboard/lecturer/page.tsx

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import LecturerDashboard from '@/components/lecturer/LecturerDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function LecturerDashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'student') {
      router.push('/dashboard/student');
    }
  }, [isLoading, isAuthenticated, router, user]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated || user?.role !== 'lecturer') {
    return <LoadingSpinner message="Redirecting..." fullScreen />;
  }

  return (
    <>
      <Header title="Lecturer Dashboard" />
      <LecturerDashboard />
    </>
  );
}
