
// services/attendanceService.ts

import api from './api';
import { ApiResponse, Attendance } from '@/types/index';

export const attendanceService = {
  // Mark attendance
  markAttendance: async (data: {
    lecture_id: number;
    latitude: number;
    longitude: number;
    accuracy?: number;
  }): Promise<ApiResponse<Attendance>> => {
    const response = await api.post('/attendance/mark', data);
    return response.data;
  },

  // Get attendance records
  getAttendanceRecords: async (courseId: number): Promise<ApiResponse<Attendance[]>> => {
    const response = await api.get(`/attendance/records?course_id=${courseId}`);
    return response.data;
  },

  // Generate report
  generateReport: async (data: {
    type: 'student' | 'course' | 'department';
    start_date: string;
    end_date: string;
    format: 'pdf' | 'excel';
  }): Promise<Blob> => {
    const response = await api.post('/attendance/report', data, {
      responseType: 'blob',
    });
    return response.data;
  },
};