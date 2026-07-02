
// app/page.tsx

'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.role === 'student') {
          router.push('/dashboard/student');
        } else if (user.role === 'lecturer') {
          router.push('/dashboard/lecturer');
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <LoadingSpinner fullScreen message="Loading..." />;
}