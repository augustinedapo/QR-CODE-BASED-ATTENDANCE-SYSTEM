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

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (!isLoading && user?.role !== 'lecturer') {
      router.push('/dashboard/student');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated || user?.role !== 'lecturer') {
    return <LoadingSpinner message="Redirecting..." fullScreen />;
  }

  return (
    <>
      <Header title="Generate QR Code" />
      <QRGenerator />
    </>
  );
}