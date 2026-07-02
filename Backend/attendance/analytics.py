# attendance/analytics.py

from django.db.models import Count, Q, Avg 
from django.utils import timezone 
from datetime import timedelta
from courses.models import Course, Lecture
from attendance.models import Attendance
from accounts.models import CustomUser

class AttendanceAnalytics:
    """Analytics for attendance data"""

    @staticmethod
    def get_course_statistics(course_id):
        """Get statistics for a course"""
        course = Course.objects.get(course_id=course_id)
        
        lectures = Lecture.objects.filter(course=course)
        attendances = Attendance.objects.filter(lecture__course=course)
        
        total_students = course.student_count
        total_lectures = lectures.count()
        total_attendances = attendances.count()
        
        return {
            'course': {
                'course_id': course.course_id,
                'course_code': course.course_code,
                'course_name': course.course_name,
            },
            'statistics': {
                'total_lectures': total_lectures,
                'total_students': total_students,
                'total_attendances': total_attendances,
                'average_attendance': (total_attendances / (total_lectures * total_students) * 100) 
                                     if (total_lectures * total_students) > 0 else 0,
            },
            'trends': AttendanceAnalytics._get_attendance_trends(course),
            'top_students': AttendanceAnalytics._get_top_students(course),
            'at_risk_students': AttendanceAnalytics._get_at_risk_students(course),
        }

    @staticmethod
    def _get_attendance_trends(course):
        """Get attendance trends over time"""
        lectures = Lecture.objects.filter(course=course).order_by('lecture_date')
        
        trends = []
        for lecture in lectures:
            attended = Attendance.objects.filter(lecture=lecture).count()
            total_possible = course.student_count
            
            trends.append({
                'date': lecture.lecture_date,
                'lecture_number': lecture.lecture_number,
                'attended': attended,
                'percentage': (attended / total_possible * 100) if total_possible > 0 else 0,
            })
        
        return trends

    @staticmethod
    def _get_top_students(course):
        """Get top attending students"""
        enrollment_ids = course.enrollments.filter(
            status='active'
        ).values_list('student_id', flat=True)
        
        students = CustomUser.objects.filter(
            user_id__in=enrollment_ids
        ).annotate(
            attendance_count=Count('attendances')
        ).order_by('-attendance_count')[:10]

        return [
            {
                'student_id': student.user_id,
                'name': student.full_name,
                'attendance_count': student.attendance_count,
            }
            for student in students
        ]

    @staticmethod
    def _get_at_risk_students(course):
        """Get students with low attendance"""
        enrollment_ids = course.enrollments.filter(
            status='active'
        ).values_list('student_id', flat=True)
        
        total_lectures = Lecture.objects.filter(course=course).count()
        
        at_risk = []
        for student_id in enrollment_ids:
            attended = Attendance.objects.filter(
                student_id=student_id,
                lecture__course=course
            ).count()
            
            percentage = (attended / total_lectures * 100) if total_lectures > 0 else 0
            
            if percentage < 75:
                student = CustomUser.objects.get(user_id=student_id)
                at_risk.append({
                    'student_id': student.user_id,
                    'name': student.full_name,
                    'attendance_percentage': percentage,
                    'attended': attended,
                    'total': total_lectures,
                })
        
        return sorted(at_risk, key=lambda x: x['attendance_percentage'])

    @staticmethod
    def get_department_statistics(department):
        """Get statistics for a department"""
        courses = Course.objects.filter(department=department)
        
        total_courses = courses.count()
        total_students = CustomUser.objects.filter(
            enrollments__course__in=courses
        ).distinct().count()
        
        total_attendances = Attendance.objects.filter(
            lecture__course__in=courses
        ).count()
        
        total_possible = Lecture.objects.filter(
            course__in=courses
        ).count() * total_students
        
        return {
            'department': department,
            'statistics': {
                'total_courses': total_courses,
                'total_students': total_students,
                'average_attendance': (total_attendances / total_possible * 100)
                                     if total_possible > 0 else 0,
            },
            'courses': [
                AttendanceAnalytics.get_course_statistics(course.course_id)
                for course in courses
            ]
        }