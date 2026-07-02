// app/qr-generator/page.tsx

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import QRGenerator from '@/components/qr/QRGenerator';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function QRGeneratorPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const isLecturer = user?.role === 'lecturer';

  React.useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLecturer) {
      router.push('/dashboard/student');
    }
  }, [isLoading, isAuthenticated, isLecturer, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated || !isLecturer) {
    return <LoadingSpinner message="Redirecting..." fullScreen />;
  }

  return (
    <>
      <Header title="Generate QR Code" />
      <QRGenerator />
    </>
  );
}
