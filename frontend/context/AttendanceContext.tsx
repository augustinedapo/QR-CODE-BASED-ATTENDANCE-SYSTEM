'use client';

import React, { createContext, useContext, ReactNode } from 'react';

type AttendanceContextType = Record<string, never>;

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  return (
    <AttendanceContext.Provider value={{}}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendanceContext() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendanceContext must be used within AttendanceProvider');
  }
  return context;
}
