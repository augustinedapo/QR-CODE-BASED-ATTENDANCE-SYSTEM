// utils/validation.ts

import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Register schema
export const registerSchema = z.object({
  first_name: z.string().min(2, 'First name required'),
  last_name: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirm: z.string(),
  role: z.enum(['student', 'lecturer', 'admin']),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

// QR Code generation schema
export const qrGenerationSchema = z.object({
  course_id: z.number().positive('Select a course'),
  lecture_title: z.string().min(3, 'Lecture title required'),
  lecture_date: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, 'Invalid date'),
  lecture_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  venue: z.string().min(2, 'Venue required'),
  duration: z.number().min(5).max(60),
  lecture_number: z.number().optional(),
});

// Attendance filter schema
export const attendanceFilterSchema = z.object({
  course: z.string(),
  dateRange: z.enum(['all', 'today', 'thisWeek', 'thisMonth', 'custom']),
  status: z.enum(['all', 'present', 'absent', 'late']),
  attendanceRate: z.enum(['all', '90+', '75-89', '60-74', 'under60']),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type QRGenerationInput = z.infer<typeof qrGenerationSchema>;
export type AttendanceFilters = z.infer<typeof attendanceFilterSchema>;