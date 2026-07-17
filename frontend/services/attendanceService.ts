
// services/attendanceService.ts

import api from './api';
import {
  ApiResponse,
  Attendance,
  AttendanceAttempt,
  MissedLecture,
  StudentCourseAttendanceSummary,
} from '@/types/index';

function hexToBlob(hex: string, mimeType: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return new Blob([bytes], { type: mimeType });
}

export const attendanceService = {
  // Mark attendance
  markAttendance: async (data: {
    lecture_id: number;
    qr_code_data: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
  }): Promise<ApiResponse<Attendance>> => {
    const response = await api.post('/attendance/mark_attendance/', data);
    return response.data;
  },

  // Get attendance records
  getAttendanceRecords: async (courseId: number): Promise<ApiResponse<Attendance[]>> => {
    const response = await api.get(`/attendance/course_attendance/?course_id=${courseId}`);
    return response.data;
  },

  getScanHistory: async (): Promise<AttendanceAttempt[]> => {
    const response = await api.get('/attendance/my_scan_history/');
    return response.data;
  },

  getMyCourseSummary: async (): Promise<StudentCourseAttendanceSummary[]> => {
    const response = await api.get('/attendance/my_course_summary/');
    return response.data;
  },

  getMissedLectures: async (): Promise<MissedLecture[]> => {
    const response = await api.get('/attendance/missed_lectures/');
    return response.data;
  },

  // Generate report
  generateReport: async (data: {
    type: 'student' | 'course' | 'department';
    start_date: string;
    end_date: string;
    format: 'pdf' | 'excel';
    course_id?: number | string;
    lecture_id?: number | string;
    student_id?: number | string;
    department?: string;
  }): Promise<{ blob: Blob; filename: string }> => {
    const response = await api.post('/attendance/generate_report/', {
      report_type: data.type,
      start_date: data.start_date,
      end_date: data.end_date,
      format: data.format,
      course_id: data.course_id,
      lecture_id: data.lecture_id,
      student_id: data.student_id,
      department: data.department,
    });
    const mimeType = data.format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';

    return {
      blob: hexToBlob(response.data.file, mimeType),
      filename: response.data.filename,
    };
  },
};
