import api from './api';
import { Course, Enrollment, Lecture } from '@/types/index';

type PaginatedResponse<T> = {
  results: T[];
};

function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export type CoursePayload = {
  course_code: string;
  course_name: string;
  description?: string;
  department: string;
  semester: string;
  academic_year: string;
  capacity: number;
  credits: number;
  schedule_json: Record<string, unknown>;
  location: string;
  is_active?: boolean;
};

export type CourseEnrollmentFilters = {
  search?: string;
  department?: string;
  lecturer?: string;
  semester?: string;
  academic_year?: string;
};

export const courseService = {
  getCourses: async (params?: Record<string, unknown>): Promise<Course[]> => {
    const response = await api.get('/courses/', { params });
    return unwrapList<Course>(response.data);
  },

  getCourse: async (id: number | string): Promise<Course> => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },

  createCourse: async (data: CoursePayload): Promise<Course> => {
    const response = await api.post('/courses/', data);
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
    const response = await api.patch(`/courses/${id}/`, data);
    return response.data;
  },

  deleteCourse: async (id: number | string): Promise<void> => {
    await api.delete(`/courses/${id}/`);
  },

  getCourseStudents: async (id: number | string): Promise<Enrollment[]> => {
    const response = await api.get(`/courses/${id}/students/`);
    return unwrapList<Enrollment>(response.data);
  },

  getCourseLectures: async (id: number | string): Promise<Lecture[]> => {
    const response = await api.get(`/courses/${id}/lectures/`);
    return unwrapList<Lecture>(response.data);
  },

  getEnrollments: async (): Promise<Enrollment[]> => {
    const response = await api.get('/enrollments/');
    return unwrapList<Enrollment>(response.data);
  },

  getAvailableForEnrollment: async (params?: CourseEnrollmentFilters): Promise<Course[]> => {
    const response = await api.get('/courses/available_for_enrollment/', { params });
    return unwrapList<Course>(response.data);
  },

  enrollInCourse: async (courseId: number): Promise<Enrollment> => {
    const response = await api.post(`/courses/${courseId}/enroll/`);
    return response.data;
  },
};
