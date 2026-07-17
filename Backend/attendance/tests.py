from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from attendance.models import Attendance, AttendanceAttempt
from courses.models import Course, Enrollment, Lecture
from notifications.models import Notification


@override_settings(ALLOWED_HOSTS=['testserver', 'localhost'])
class AttendanceAPITests(APITestCase):
    def setUp(self):
        self.lecturer = CustomUser.objects.create_user(
            username='qr.lecturer@futa.edu.ng',
            email='qr.lecturer@futa.edu.ng',
            password='pass12345',
            first_name='QR',
            last_name='Lecturer',
            role='lecturer',
            employee_id='FUTA-LECT-901',
            department='Computer Science',
        )
        self.student = CustomUser.objects.create_user(
            username='qr.student@futa.edu.ng',
            email='qr.student@futa.edu.ng',
            password='pass12345',
            first_name='QR',
            last_name='Student',
            role='student',
            student_id='CPE/24/9003',
            department='Computer Science',
        )
        self.unenrolled_student = CustomUser.objects.create_user(
            username='outside.student@futa.edu.ng',
            email='outside.student@futa.edu.ng',
            password='pass12345',
            first_name='Outside',
            last_name='Student',
            role='student',
            student_id='CPE/24/9004',
            department='Computer Science',
        )
        self.course = Course.objects.create(
            course_code='CSC997',
            course_name='QR Attendance Testing',
            department='Computer Science',
            semester='Rain',
            academic_year='2025/2026',
            lecturer=self.lecturer,
            capacity=40,
            credits=3,
            schedule_json={'text': 'Wed 9:00'},
            location='Lab 2',
        )
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(user=self.lecturer)
        qr_response = self.client.post('/api/lectures/generate_qr/', {
            'course_id': self.course.course_id,
            'lecture_title': 'Location Rules',
            'lecture_date': timezone.localdate().isoformat(),
            'lecture_time': '09:00',
            'venue': 'Lab 2',
            'duration': 30,
            'latitude': 7.3075,
            'longitude': 5.1372,
            'allowed_radius': 20,
        }, format='json')
        self.lecture = Lecture.objects.get(lecture_id=qr_response.data['lecture']['lecture_id'])
        self.qr_code_data = qr_response.data['qr_code_data']

    def mark_payload(self, **overrides):
        payload = {
            'lecture_id': self.lecture.lecture_id,
            'qr_code_data': self.qr_code_data,
            'latitude': 7.3075,
            'longitude': 5.1372,
            'accuracy': 12,
        }
        payload.update(overrides)
        return payload

    def test_student_can_mark_attendance_once_and_duplicate_is_clear(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post('/api/attendance/mark_attendance/', self.mark_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Attendance.objects.filter(student=self.student, lecture=self.lecture).exists())

        duplicate_response = self.client.post('/api/attendance/mark_attendance/', self.mark_payload(), format='json')
        self.assertEqual(duplicate_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(duplicate_response.data['code'], 'already_marked')
        self.assertEqual(duplicate_response.data['error'], 'You already marked attendance for this lecture.')
        self.assertTrue(AttendanceAttempt.objects.filter(student=self.student, status='duplicate').exists())

    def test_poor_gps_accuracy_is_rejected_and_creates_notification(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            '/api/attendance/mark_attendance/',
            self.mark_payload(accuracy=75),
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['code'], 'poor_accuracy')
        self.assertTrue(Notification.objects.filter(recipient=self.student, related_object_type='attendance_attempt').exists())

    def test_unenrolled_student_cannot_mark_attendance(self):
        self.client.force_authenticate(user=self.unenrolled_student)

        response = self.client.post('/api/attendance/mark_attendance/', self.mark_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['code'], 'unauthorized')
        self.assertFalse(Attendance.objects.filter(student=self.unenrolled_student, lecture=self.lecture).exists())

    def test_scan_history_summary_and_missed_lectures_are_available(self):
        self.client.force_authenticate(user=self.student)
        self.client.post('/api/attendance/mark_attendance/', self.mark_payload(), format='json')

        history_response = self.client.get('/api/attendance/my_scan_history/')
        self.assertEqual(history_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(history_response.data), 1)

        summary_response = self.client.get('/api/attendance/my_course_summary/')
        self.assertEqual(summary_response.status_code, status.HTTP_200_OK)
        self.assertEqual(summary_response.data[0]['percentage'], 100)

        missed_response = self.client.get('/api/attendance/missed_lectures/')
        self.assertEqual(missed_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(missed_response.data), 0)

    def test_scan_after_30_minutes_from_qr_creation_is_late(self):
        self.lecture.qr_generated_at = timezone.now() - timedelta(minutes=31)
        self.lecture.qr_expiry_minutes = 60
        self.lecture.save(update_fields=['qr_generated_at', 'qr_expiry_minutes'])
        self.client.force_authenticate(user=self.student)

        response = self.client.post('/api/attendance/mark_attendance/', self.mark_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        attendance = Attendance.objects.get(student=self.student, lecture=self.lecture)
        self.assertTrue(attendance.is_late)
