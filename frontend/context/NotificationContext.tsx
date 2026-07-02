// context/NotificationContext.tsx

'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { NotificationContextType } from '@/types/index';
import Toast from '@/components/common/Toast';

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotificationContext must be used within NotificationProvider'
    );
  }
  return context;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 5000);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showError = useCallback((error: string) => {
    showNotification(error, 'error');
  }, [showNotification]);

  const value: NotificationContextType = {
    showNotification,
    showError,
    showSuccess
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {notifications.map((notif) => (
          <Toast key={notif.id} message={notif.message} type={notif.type} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
