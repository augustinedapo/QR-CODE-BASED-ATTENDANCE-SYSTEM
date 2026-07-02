// app/dashboard/student/page.tsx

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import StudentDashboard from '@/components/student/StudentDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function StudentDashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return <LoadingSpinner message="Redirecting..." fullScreen />;
  }

  return (
    <>
      <Header title="Student Dashboard" />
      <StudentDashboard />
    </>
  );
}