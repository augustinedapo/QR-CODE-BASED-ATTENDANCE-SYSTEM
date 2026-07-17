// services/authService.ts

import api from './api';
import { ApiResponse, User } from '@/types/index';

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('auth_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register
  register: async (data: Record<string, unknown>): Promise<LoginResponse> => {
    const response = await api.post('/auth/register/', data);
    if (response.data.access) {
      localStorage.setItem('auth_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/users/me/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update current user profile
  updateProfile: async (userId: number, data: FormData): Promise<User> => {
    const response = await api.patch(`/users/${userId}/`, data);
    localStorage.setItem('auth_user', JSON.stringify(response.data));
    return response.data;
  },

  // Change current user password
  changePassword: async (data: ChangePasswordPayload): Promise<void> => {
    await api.post('/users/change_password/', data);
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      const response = await api.post('/auth/refresh/', { refresh });
      if (response.data.access) {
        localStorage.setItem('auth_token', response.data.access);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
