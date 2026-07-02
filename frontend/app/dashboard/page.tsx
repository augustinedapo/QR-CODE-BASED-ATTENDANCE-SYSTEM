'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'lecturer') {
      router.replace('/dashboard/lecturer');
      return;
    }

    if (user.role === 'student') {
      router.replace('/dashboard/student');
      return;
    }

    router.replace('/login');
  }, [isAuthenticated, isLoading, router, user]);

  return <LoadingSpinner fullScreen message="Loading dashboard..." />;
}
