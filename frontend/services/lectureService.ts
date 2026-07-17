import api from './api';
import { Lecture } from '@/types/index';

export interface LiveAttendanceCounts {
  lecture_id: number;
  status: 'pending' | 'active' | 'closed' | 'expired';
  total: number;
  present: number;
  absent: number;
  attendance_count: number;
}

export interface GenerateQRSessionPayload {
  course_id: number;
  lecture_title: string;
  lecture_date: string;
  lecture_time: string;
  venue: string;
  duration: number;
  lecture_number?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  allowed_radius: number;
}

export interface GenerateQRSessionResponse {
  success: boolean;
  message: string;
  qr_code_data: string;
  lecture: Lecture;
}

export const lectureService = {
  getLectures: async (params?: Record<string, unknown>): Promise<Lecture[]> => {
    const response = await api.get('/lectures/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  getQRSessions: async (params?: { course_id?: number | string }): Promise<Lecture[]> => {
    const response = await api.get('/lectures/qr_sessions/', { params });
    return response.data;
  },

  getUpcomingLectures: async (): Promise<Lecture[]> => {
    const response = await api.get('/lectures/upcoming/');
    return Array.isArray(response.data) ? response.data : response.data.results;
  },

  closeQRSession: async (lectureId: number, reason?: string): Promise<Lecture> => {
    const response = await api.post(`/lectures/${lectureId}/close_qr/`, { reason });
    return response.data.lecture;
  },

  getLiveAttendance: async (lectureId: number): Promise<LiveAttendanceCounts> => {
    const response = await api.get(`/lectures/${lectureId}/live_attendance/`);
    return response.data;
  },

  generateQRSession: async (
    data: GenerateQRSessionPayload
  ): Promise<GenerateQRSessionResponse> => {
    const response = await api.post('/lectures/generate_qr/', data);
    return response.data;
  },

  createLecture: async (data: Partial<Lecture>): Promise<Lecture> => {
    const response = await api.post('/lectures/', data);
    return response.data;
  },

  updateLecture: async (id: string, data: Partial<Lecture>): Promise<Lecture> => {
    const response = await api.patch(`/lectures/${id}/`, data);
    return response.data;
  },
};
