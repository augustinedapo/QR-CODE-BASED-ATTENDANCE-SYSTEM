export * from './auth';
export * from './attendance';
export * from './course';

// types/index.ts

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'lecturer' | 'admin';
  avatar?: string;
  created_at?: string;
}

export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  department: string;
  semester: string;
  academic_year: string;
  lecturer_id: number;
  lecturer?: User;
  students_count?: number;
  total_lectures?: number;
}

export interface Lecture {
  lecture_id: number;
  course_id: number;
  lecture_date: string;
  start_time: string;
  end_time: string;
  topic: string;
  location: string;
  qr_code_data?: string;
  qr_expiry_time?: string;
  venue_latitude?: number;
  venue_longitude?: number;
  allowed_radius?: number;
}

export interface Attendance {
  attendance_id: number;
  lecture_id: number;
  student_id: number;
  timestamp: string;
  location_verified: boolean;
  distance_from_venue?: number;
  latitude?: number;
  longitude?: number;
}

export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  course_id: number;
  course?: Course;
  enrollment_date: string;
  status: 'active' | 'dropped';
}

export interface AttendanceRecord {
  student_id: number;
  name: string;
  email: string;
  student_code: string;
  attended: number;
  absent: number;
  late: number;
  percentage: number;
  status: 'excellent' | 'good' | 'fair' | 'at-risk';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
}

export interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  showError: (error: string) => void;
  showSuccess: (message: string) => void;
}