// utils/mockData.ts

import { User, Course, Lecture, Attendance, Enrollment, AttendanceRecord } from '@/types/index';

// Mock authenticated user
export const mockCurrentUser: User = {
  user_id: 1,
  email: 'ajohnson@futa.edu.ng',
  first_name: 'John',
  last_name: 'Doe',
  role: 'student',
  avatar: 'JD'
};

export const mockLecturerUser: User = {
  user_id: 2,
  email: 'ogunti@futa.edu.ng',
  first_name: 'Prof. E.O',
  last_name: 'Ogunti',
  role: 'lecturer',
  avatar: 'EO'
};

export const mockLecturerDahunsi: User = {
  user_id: 3,
  email: 'dahunsi@futa.edu.ng',
  first_name: 'Prof. F.M',
  last_name: 'Dahunsi',
  role: 'lecturer',
  avatar: 'FD'
};

export const mockLecturerOdeyemi: User = {
  user_id: 4,
  email: 'odeyemi@futa.edu.ng',
  first_name: 'Dr.',
  last_name: 'Odeyemi',
  role: 'lecturer',
  avatar: 'DO'
};

export const mockLecturerApena: User = {
  user_id: 5,
  email: 'apena@futa.edu.ng',
  first_name: 'Prof. W.O',
  last_name: 'Apena',
  role: 'lecturer',
  avatar: 'WA'
};

export const mockLecturerAdedokun: User = {
  user_id: 6,
  email: 'adedokun@futa.edu.ng',
  first_name: 'Engr. A.O',
  last_name: 'Adedokun',
  role: 'lecturer',
  avatar: 'AA'
};

// Mock courses
export const mockCourses: Course[] = [
  {
    course_id: 1,
    course_code: 'CPE 506',
    course_name: 'Cyberpreneurship and Cyberlaw',
    department: 'Computer Engineering',
    semester: 'Spring 2024',
    academic_year: '2023-2024',
    lecturer_id: 2,
    lecturer: mockLecturerOdeyemi,
    students_count: 65,
    total_lectures: 25
  },
  {
    course_id: 2,
    course_code: 'CPE 522',
    course_name: 'Operating System',
    department: 'Computer Engineering',
    semester: 'Spring 2024',
    academic_year: '2023-2024',
    lecturer_id: 2,
    lecturer: mockLecturerAdedokun,
    students_count: 58,
    total_lectures: 24
  },
  {
    course_id: 3,
    course_code: 'CPE 508',
    course_name: 'Computer Graphics and Animation',
    department: 'Computer Engineering',
    semester: 'Spring 2024',
    academic_year: '2023-2024',
    lecturer_id: 2,
    lecturer: mockLecturerApena,
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

type CourseAttendanceRecord = AttendanceRecord & {
  course: 'CSC301' | 'CSC305' | 'CSC307';
};

const attendanceStudents = [
  { student_id: 1, name: 'Alice Johnson', email: 'ajohnson@futa.edu.ng', student_code: 'CPE/24/0001' },
  { student_id: 2, name: 'Brian Smith', email: 'bsmith@futa.edu.ng', student_code: 'CPE/24/0002' },
  { student_id: 3, name: 'Catherine Davis', email: 'cdavis@futa.edu.ng', student_code: 'CPE/24/0003' },
  { student_id: 4, name: 'David Wilson', email: 'dwilson@futa.edu.ng', student_code: 'CPE/24/0004' },
  { student_id: 5, name: 'Emma Martinez', email: 'emartinez@futa.edu.ng', student_code: 'CPE/24/0005' },
  { student_id: 6, name: 'Frank Taylor', email: 'ftaylor@futa.edu.ng', student_code: 'CPE/24/0006' },
  { student_id: 7, name: 'Tolu Adebayo', email: 'tadebayo@futa.edu.ng', student_code: 'CPE/24/0007' },
  { student_id: 8, name: 'Chioma Okafor', email: 'cokafor@futa.edu.ng', student_code: 'CPE/24/0008' },
  { student_id: 9, name: 'Ifeoluwa Balogun', email: 'ibalogun@futa.edu.ng', student_code: 'CPE/24/0009' },
  { student_id: 10, name: 'Musa Abdullahi', email: 'mabdullahi@futa.edu.ng', student_code: 'CPE/24/0010' },
  { student_id: 11, name: 'Amina Yusuf', email: 'ayusuf@futa.edu.ng', student_code: 'CPE/24/0011' },
  { student_id: 12, name: 'Kelechi Nwosu', email: 'knwosu@futa.edu.ng', student_code: 'CPE/24/0012' },
  { student_id: 13, name: 'Seyi Adekunle', email: 'sadekunle@futa.edu.ng', student_code: 'CPE/24/0013' },
  { student_id: 14, name: 'Zainab Bello', email: 'zbello@futa.edu.ng', student_code: 'CPE/24/0014' },
  { student_id: 15, name: 'Daniel Eze', email: 'deze@futa.edu.ng', student_code: 'CPE/24/0015' },
  { student_id: 16, name: 'Blessing Ojo', email: 'bojo@futa.edu.ng', student_code: 'CPE/24/0016' }
];

const courseAttendanceProfiles = {
  CSC301: [
    [24, 1, 0], [23, 2, 0], [22, 2, 1], [20, 4, 1],
    [24, 1, 0], [16, 8, 1], [21, 3, 1], [19, 5, 1],
    [25, 0, 0], [18, 6, 1], [22, 3, 0], [17, 7, 1],
    [20, 4, 1], [23, 1, 1], [15, 9, 1], [21, 4, 0]
  ],
  CSC305: [
    [21, 3, 0], [24, 0, 0], [18, 5, 1], [22, 2, 0],
    [19, 4, 1], [20, 3, 1], [23, 1, 0], [17, 6, 1],
    [21, 2, 1], [16, 7, 1], [24, 0, 0], [20, 4, 0],
    [18, 5, 1], [22, 1, 1], [19, 4, 1], [15, 8, 1]
  ],
  CSC307: [
    [25, 1, 0], [22, 4, 0], [24, 1, 1], [18, 7, 1],
    [21, 4, 1], [17, 8, 1], [25, 0, 1], [20, 5, 1],
    [23, 2, 1], [19, 6, 1], [16, 9, 1], [22, 3, 1],
    [24, 2, 0], [18, 6, 2], [21, 5, 0], [20, 4, 2]
  ]
} as const;

function getAttendanceStatus(percentage: number): AttendanceRecord['status'] {
  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'good';
  if (percentage >= 60) return 'fair';
  return 'at-risk';
}

// Mock attendance records for table. The same students appear in every course,
// with course-specific attendance counts and percentages.
export const mockAttendanceRecords: CourseAttendanceRecord[] = Object.entries(courseAttendanceProfiles)
  .flatMap(([course, profiles]) =>
    profiles.map(([attended, absent, late], index) => {
      const percentage = Math.round((attended / (attended + absent + late)) * 100);

      return {
        ...attendanceStudents[index],
        course: course as CourseAttendanceRecord['course'],
        attended,
        absent,
        late,
        percentage,
        status: getAttendanceStatus(percentage)
      };
    })
  );

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
