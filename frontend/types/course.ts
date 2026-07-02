export interface Course {
  id: string;
  name: string;
  code: string;
  lecturerId: string;
  semester: string;
  totalLectures?: number;
  createdAt: Date;
}

export interface Lecture {
  id: string;
  courseId: string;
  date: Date;
  startTime: string;
  endTime: string;
  qrCode?: string;
}
