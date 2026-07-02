// services/authService.ts

import api from './api';
import { User, ApiResponse } from '@/types/index';

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register
  register: async (data: any): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
