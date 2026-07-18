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
  phone?: string | null;
  department?: string | null;
  student_id?: string | null;
  employee_id?: string | null;
  avatar?: string | null;
  created_at?: string;
  last_login_at?: string | null;
}

export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  description?: string;
  department: string;
  semester: string;
  academic_year: string;
  lecturer_id: number;
  lecturer?: User;
  student_count?: number;
  students_count?: number;
  total_lectures?: number;
  qr_lectures_count?: number;
  average_attendance?: number;
  capacity?: number;
  credits?: number;
  schedule_json?: Record<string, unknown>;
  location?: string;
  is_active?: boolean;
}

export interface Lecture {
  lecture_id: number;
  course_id: number;
  course?: Course;
  lecture_number?: number;
  lecture_date: string;
  start_time: string;
  end_time: string;
  topic: string;
  location: string;
  qr_code_data?: string;
  qr_generated_at?: string;
  qr_expiry_minutes?: number;
  qr_status?: 'pending' | 'active' | 'closed' | 'expired';
  computed_qr_status?: 'pending' | 'active' | 'closed' | 'expired';
  qr_closed_at?: string | null;
  qr_close_reason?: string | null;
  attendance_count?: number;
  qr_is_valid?: boolean;
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
  student?: User;
  student_id: number;
  course_id: number;
  course?: Course;
  enrollment_date: string;
  status: 'active' | 'dropped' | 'completed';
}

export interface AttendanceAttempt {
  attempt_id: number;
  lecture?: Lecture | null;
  attendance?: number | null;
  attendance_is_late?: boolean;
  status: 'success' | 'duplicate' | 'failed';
  reason: string;
  message: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  distance_from_venue?: number;
  allowed_radius?: number;
  timestamp: string;
}

export interface StudentCourseAttendanceSummary {
  course: {
    course_id: number;
    course_code: string;
    course_name: string;
    department: string;
    semester: string;
    lecturer_name: string;
  };
  total_lectures: number;
  attended: number;
  missed: number;
  late: number;
  percentage: number;
}

export interface MissedLecture {
  lecture_id: number;
  topic: string;
  lecture_date: string;
  start_time: string;
  course_code: string;
  course_name: string;
  location: string;
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
  register: (data: Record<string, unknown>) => Promise<void>;
  updateUser: (user: User) => void;
}

export interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  showError: (error: string) => void;
  showSuccess: (message: string) => void;
}
