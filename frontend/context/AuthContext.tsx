// context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType } from '@/types/index';
import { getMockData } from '@/utils/mockData';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In production, fetch user from API
          // const response = await authService.getCurrentUser();
          // setUser(response.data);
          
          // For now, restore the mock user selected during login.
          const storedUser = localStorage.getItem('auth_user');
          const mockUser = storedUser
            ? JSON.parse(storedUser) as User
            : getMockData.getCurrentUser();

          setUser(mockUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In production, use actual API
      // const response = await authService.login(email, password);
      // setUser(response.user);
      
      // For now, use mock login
      if (email && password) {
        const lowerEmail = email.toLowerCase();
        const mockUser = lowerEmail.includes('lecturer') || lowerEmail.includes('dr.')
          ? getMockData.getLecturerUser()
          : getMockData.getCurrentUser();
        localStorage.setItem('auth_token', 'mock_token_' + Date.now());
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  const register = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      // In production, use actual API
      // const response = await authService.register(data);
      // return response;
      
      console.log('Register with:', data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
