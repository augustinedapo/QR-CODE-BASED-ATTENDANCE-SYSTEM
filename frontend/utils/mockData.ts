// utils/mockData.ts

import { User, Course, Lecture, Attendance, Enrollment, AttendanceRecord } from '@/types/index';

// Mock authenticated user
export const mockCurrentUser: User = {
  user_id: 1,
  email: 'john.doe@university.edu',
  first_name: 'John',
  last_name: 'Doe',
  role: 'student',
  avatar: 'JD'
};

export const mockLecturerUser: User = {
  user_id: 2,
  email: 'dr.sarah@university.edu',
  first_name: 'Dr. Sarah',
  last_name: 'Johnson',
  role: 'lecturer',
  avatar: 'SJ'
};

// Mock courses
export const mockCourses: Course[] = [
  {
    course_id: 1,
    course_code: 'CSC 301',
    course_name: 'Computer Networks',
    department: 'Computer Science',
    semester: 'Spring 2024',
    academic_year: '2023-2024',
    lecturer_id: 2,
    lecturer: mockLecturerUser,
    students_count: 65,
    total_lectures: 25
  },
  {
    course_id: 2,
    course_code: 'CSC 305',
    course_name: 'Database Management Systems',
    department: 'Computer Science',
    semester: 'Spring 2024',
    academic_year: '2023-2024',
    lecturer_id: 2,
    lecturer: mockLecturerUser,
    students_count: 58,
    total_lectures: 24
  },
  {
    course_id: 3,
    course_code: 'CSC 307',
    course_name: 'Software Engineering',
    department: 'Computer Science',
    semester: 'Spring 2024',
    academic_year: '2023-2024',
    lecturer_id: 2,
    lecturer: mockLecturerUser,
    students_count: 72,
    total_lectures: 26
  }
];

// Mock lectures
export const mockLectures: Lecture[] = [
  {
    lecture_id: 1,
    course_id: 1,
    lecture_date: '2024-03-15',
    start_time: '10:00',
    end_time: '11:30',
    topic: 'TCP/IP Protocol',
    location: 'Lab 204',
    qr_code_data: 'eyJ0eXBlIjoiYXR0ZW5kYW5jZSIsInNlc3Npb25faWQiOiIxMjM0In0=',
    qr_expiry_time: '2024-03-15T10:10:00Z',
    venue_latitude: 6.5244,
    venue_longitude: 3.3792,
    allowed_radius: 50
  },
  {
    lecture_id: 2,
    course_id: 1,
    lecture_date: '2024-03-17',
    start_time: '10:00',
    end_time: '11:30',
    topic: 'Network Security',
    location: 'Lab 204',
    venue_latitude: 6.5244,
    venue_longitude: 3.3792,
    allowed_radius: 50
  },
  {
    lecture_id: 3,
    course_id: 2,
    lecture_date: '2024-03-16',
    start_time: '14:00',
    end_time: '15:30',
    topic: 'Relational Databases',
    location: 'Auditorium A',
    venue_latitude: 6.5245,
    venue_longitude: 3.3793,
    allowed_radius: 50
  }
];

// Mock attendances
export const mockAttendances: Attendance[] = [
  {
    attendance_id: 1,
    lecture_id: 1,
    student_id: 1,
    timestamp: '2024-03-15T10:02:00Z',
    location_verified: true,
    distance_from_venue: 12,
    latitude: 6.5243,
    longitude: 3.3791
  },
  {
    attendance_id: 2,
    lecture_id: 2,
    student_id: 1,
    timestamp: '2024-03-17T10:05:00Z',
    location_verified: true,
    distance_from_venue: 8,
    latitude: 6.5244,
    longitude: 3.3792
  },
  {
    attendance_id: 3,
    lecture_id: 3,
    student_id: 1,
    timestamp: '2024-03-16T14:03:00Z',
    location_verified: true,
    distance_from_venue: 15,
    latitude: 6.5245,
    longitude: 3.3793
  }
];

// Mock enrollments
export const mockEnrollments: Enrollment[] = [
  {
    enrollment_id: 1,
    student_id: 1,
    course_id: 1,
    course: mockCourses[0],
    enrollment_date: '2024-01-15',
    status: 'active'
  },
  {
    enrollment_id: 2,
    student_id: 1,
    course_id: 2,
    course: mockCourses[1],
    enrollment_date: '2024-01-15',
    status: 'active'
  },
  {
    enrollment_id: 3,
    student_id: 1,
    course_id: 3,
    course: mockCourses[2],
    enrollment_date: '2024-01-15',
    status: 'active'
  }
];

// Mock attendance records for table
export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    student_id: 1,
    name: 'Alice Johnson',
    email: 'ajohnson@university.edu',
    student_code: 'STU2024001',
    attended: 24,
    absent: 1,
    late: 0,
    percentage: 96,
    status: 'excellent'
  },
  {
    student_id: 2,
    name: 'Brian Smith',
    email: 'bsmith@university.edu',
    student_code: 'STU2024002',
    attended: 23,
    absent: 2,
    late: 0,
    percentage: 92,
    status: 'excellent'
  },
  {
    student_id: 3,
    name: 'Catherine Davis',
    email: 'cdavis@university.edu',
    student_code: 'STU2024003',
    attended: 22,
    absent: 2,
    late: 1,
    percentage: 88,
    status: 'good'
  },
  {
    student_id: 4,
    name: 'David Wilson',
    email: 'dwilson@university.edu',
    student_code: 'STU2024004',
    attended: 20,
    absent: 4,
    late: 1,
    percentage: 80,
    status: 'fair'
  },
  {
    student_id: 5,
    name: 'Emma Martinez',
    email: 'emartinez@university.edu',
    student_code: 'STU2024005',
    attended: 24,
    absent: 1,
    late: 0,
    percentage: 96,
    status: 'excellent'
  },
  {
    student_id: 6,
    name: 'Frank Taylor',
    email: 'ftaylor@university.edu',
    student_code: 'STU2024006',
    attended: 16,
    absent: 8,
    late: 1,
    percentage: 64,
    status: 'at-risk'
  }
];

// Helper function to get mock data
export const getMockData = {
  getCurrentUser: () => mockCurrentUser,
  getLecturerUser: () => mockLecturerUser,
  getCourses: () => mockCourses,
  getLectures: () => mockLectures,
  getAttendances: () => mockAttendances,
  getEnrollments: () => mockEnrollments,
  getAttendanceRecords: () => mockAttendanceRecords
};
