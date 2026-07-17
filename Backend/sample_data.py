# sample_data.py

"""
Sample data creation script for QR Attendance App
This script populates the database with sample data for testing purposes.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qr_attendance_config.settings')
django.setup()

from django.utils import timezone
from datetime import datetime, timedelta
from accounts.models import CustomUser
from courses.models import Course, Lecture, Enrollment
from feedback.models import FeedbackForm, FeedbackQuestion, FeedbackResponse
from notifications.models import Notification


def create_sample_users():
    """Create sample users with different roles"""
    users = []
    
    # Admin user
    admin, _ = CustomUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@qrattendance.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_verified': True,
            'verified_at': timezone.now(),
        }
    )
    if not admin.has_usable_password():
        admin.set_password('admin123')
        admin.save()
    users.append(admin)
    
    # Lecturer users
    lecturers = [
        {
            'username': 'lecturer1',
            'email': 'lecturer1@qrattendance.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'department': 'Computer Science',
        },
        {
            'username': 'lecturer2',
            'email': 'lecturer2@qrattendance.com',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'department': 'Mathematics',
        },
    ]
    
    for lecturer_data in lecturers:
        lecturer, _ = CustomUser.objects.get_or_create(
            username=lecturer_data['username'],
            defaults={
                **lecturer_data,
                'role': 'lecturer',
                'is_verified': True,
                'verified_at': timezone.now(),
            }
        )
        if not lecturer.has_usable_password():
            lecturer.set_password('lecturer123')
            lecturer.save()
        users.append(lecturer)
    
    # Student users
    for i in range(1, 11):
        student, _ = CustomUser.objects.get_or_create(
            username=f'student{i}',
            defaults={
                'email': f'student{i}@qrattendance.com',
                'first_name': f'Student',
                'last_name': f'{i}',
                'role': 'student',
                'student_id': f'CPE/24/{i:04d}',
                'department': 'Computer Science' if i % 2 == 0 else 'Mathematics',
                'is_verified': True,
                'verified_at': timezone.now(),
            }
        )
        if not student.has_usable_password():
            student.set_password('student123')
            student.save()
        users.append(student)
    
    print(f"✓ Created {len(users)} sample users")
    return users


def create_sample_courses():
    """Create sample courses"""
    lecturer1 = CustomUser.objects.get(username='lecturer1')
    lecturer2 = CustomUser.objects.get(username='lecturer2')
    
    courses_data = [
        {
            'course_code': 'CPE 506',
            'course_name': 'Cyberpreneurship and Cyberlaw',
            'description': 'Cyber entrepreneurship, cyber ethics, and cyber law fundamentals',
            'department': 'Computer Engineering',
            'semester': 'Fall 2026',
            'academic_year': '2025-2026',
            'lecturer': lecturer1,
            'capacity': 50,
            'credits': 3,
            'location': 'Room 101',
            'schedule_json': {
                'days': ['Monday', 'Wednesday', 'Friday'],
                'time': '10:00 AM',
                'duration': '1 hour'
            },
        },
        {
            'course_code': 'CPE 522',
            'course_name': 'Operating System',
            'description': 'Operating system concepts, process management, memory, and file systems',
            'department': 'Computer Engineering',
            'semester': 'Fall 2026',
            'academic_year': '2025-2026',
            'lecturer': lecturer1,
            'capacity': 40,
            'credits': 4,
            'location': 'Room 205',
            'schedule_json': {
                'days': ['Tuesday', 'Thursday'],
                'time': '2:00 PM',
                'duration': '2 hours'
            },
        },
        {
            'course_code': 'CPE 508',
            'course_name': 'Computer Graphics and Animation',
            'description': 'Graphics pipelines, rendering concepts, and animation techniques',
            'department': 'Computer Engineering',
            'semester': 'Fall 2026',
            'academic_year': '2025-2026',
            'lecturer': lecturer2,
            'capacity': 60,
            'credits': 4,
            'location': 'Room 301',
            'schedule_json': {
                'days': ['Monday', 'Wednesday', 'Friday'],
                'time': '9:00 AM',
                'duration': '1.5 hours'
            },
        },
    ]
    
    courses = []
    for course_data in courses_data:
        course, _ = Course.objects.get_or_create(
            course_code=course_data['course_code'],
            defaults=course_data
        )
        courses.append(course)
    
    print(f"✓ Created {len(courses)} sample courses")
    return courses


def create_sample_enrollments():
    """Create sample student enrollments"""
    students = CustomUser.objects.filter(role='student')
    courses = Course.objects.all()
    
    enrollment_count = 0
    for course in courses:
        for student in students:
            enrollment, created = Enrollment.objects.get_or_create(
                student=student,
                course=course,
                defaults={
                    'status': 'active',
                    'enrollment_date': timezone.now() - timedelta(days=30),
                }
            )
            if created:
                enrollment_count += 1
    
    print(f"✓ Created {enrollment_count} sample enrollments")


def create_sample_lectures():
    """Create sample lectures"""
    courses = Course.objects.all()
    lecture_count = 0
    
    for course in courses:
        # Create 5 lectures per course
        for i in range(1, 6):
            lecture_date = timezone.now() + timedelta(days=i)
            lecture, created = Lecture.objects.get_or_create(
                course=course,
                lecture_number=i,
                defaults={
                    'topic': f'{course.course_name} - Lecture {i}',
                    'description': f'Topic for lecture {i}',
                    'lecture_date': lecture_date.date(),
                    'start_time': lecture_date.time(),
                    'end_time': (lecture_date + timedelta(hours=1)).time(),
                    'location': course.location,
                }
            )
            if created:
                lecture_count += 1
    
    print(f"✓ Created {lecture_count} sample lectures")


def create_sample_notifications():
    """Create sample notifications"""
    users = CustomUser.objects.filter(role='student')[:5]
    notification_count = 0
    
    notification_types = ['attendance', 'assessment', 'feedback', 'announcement']
    
    for i, user in enumerate(users):
        for notification_type in notification_types:
            notification, created = Notification.objects.get_or_create(
                recipient=user,
                title=f'Sample {notification_type.capitalize()} Notification {i+1}',
                defaults={
                    'message': f'This is a sample {notification_type} notification for testing purposes.',
                    'notification_type': notification_type,
                    'priority': 'normal',
                }
            )
            if created:
                notification_count += 1
    
    print(f"✓ Created {notification_count} sample notifications")


def create_sample_feedback_forms():
    """Create sample feedback forms"""
    courses = Course.objects.all()
    form_count = 0
    
    for course in courses:
        admin_user = CustomUser.objects.get(username='admin')
        feedback_form, created = FeedbackForm.objects.get_or_create(
            course=course,
            title=f'Student Feedback - {course.course_name}',
            defaults={
                'description': f'Feedback form for {course.course_name}',
                'created_by': admin_user,
                'is_active': True,
            }
        )
        if created:
            form_count += 1
            
            # Create sample questions
            questions = [
                {
                    'question_text': 'How would you rate the course content?',
                    'question_type': 'rating',
                    'order': 1,
                },
                {
                    'question_text': 'How was the instructor\'s teaching quality?',
                    'question_type': 'rating',
                    'order': 2,
                },
                {
                    'question_text': 'What was the most valuable thing you learned?',
                    'question_type': 'text',
                    'order': 3,
                },
                {
                    'question_text': 'Would you recommend this course?',
                    'question_type': 'yes_no',
                    'order': 4,
                },
            ]
            
            for question_data in questions:
                FeedbackQuestion.objects.get_or_create(
                    form=feedback_form,
                    question_text=question_data['question_text'],
                    defaults={
                        'question_type': question_data['question_type'],
                        'order': question_data['order'],
                        'is_required': True,
                    }
                )
    
    print(f"✓ Created {form_count} sample feedback forms with questions")


def populate_sample_data():
    """Main function to populate all sample data"""
    print("\n=== Creating Sample Data ===\n")
    
    try:
        create_sample_users()
        create_sample_courses()
        create_sample_enrollments()
        create_sample_lectures()
        create_sample_notifications()
        create_sample_feedback_forms()
        
        print("\n✓ Sample data created successfully!")
        print("\nTest Credentials:")
        print("  Admin: username=admin, password=admin123")
        print("  Lecturer: username=lecturer1, password=lecturer123")
        print("  Student: username=student1, password=student123")
        
    except Exception as e:
        print(f"\n✗ Error creating sample data: {str(e)}")
        raise


if __name__ == '__main__':
    populate_sample_data()
