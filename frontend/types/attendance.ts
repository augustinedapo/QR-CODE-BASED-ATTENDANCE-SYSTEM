export interface Attendance {
  id: string;
  studentId: string;
  lectureId: string;
  timestamp: Date;
  status: 'present' | 'absent' | 'late';
}

export interface AttendanceRecord {
  studentId: string;
  courseId: string;
  lectureId: string;
  markedAt: Date;
}
