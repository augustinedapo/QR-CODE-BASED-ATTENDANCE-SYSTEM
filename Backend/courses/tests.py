from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from courses.models import Course, Enrollment, Lecture


@override_settings(ALLOWED_HOSTS=['testserver', 'localhost'])
class CourseAndQRAPITests(APITestCase):
    def setUp(self):
        self.lecturer = CustomUser.objects.create_user(
            username='lecturer@futa.edu.ng',
            email='lecturer@futa.edu.ng',
            password='pass12345',
            first_name='Ada',
            last_name='Lecturer',
            role='lecturer',
            employee_id='FUTA-LECT-900',
            department='Computer Science',
        )
        self.student = CustomUser.objects.create_user(
            username='student@futa.edu.ng',
            email='student@futa.edu.ng',
            password='pass12345',
            first_name='Tola',
            last_name='Student',
            role='student',
            student_id='CPE/24/9002',
            department='Computer Science',
        )
        self.course = Course.objects.create(
            course_code='CSC999',
            course_name='Advanced Testing',
            description='API testing course',
            department='Computer Science',
            semester='Rain',
            academic_year='2025/2026',
            lecturer=self.lecturer,
            capacity=40,
            credits=3,
            schedule_json={'text': 'Mon 10:00'},
            location='Lab 1',
        )

    def test_lecturer_can_create_update_and_archive_course(self):
        self.client.force_authenticate(user=self.lecturer)
        response = self.client.post('/api/courses/', {
            'course_code': 'CSC998',
            'course_name': 'Software Quality',
            'description': 'Quality engineering',
            'department': 'Computer Science',
            'semester': 'Harmattan',
            'academic_year': '2025/2026',
            'capacity': 35,
            'credits': 2,
            'schedule_json': {'text': 'Tue 11:00'},
            'location': 'Room 12',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        course_id = response.data['course_id']

        update_response = self.client.patch(
            f'/api/courses/{course_id}/',
            {'course_name': 'Software Quality Assurance'},
            format='json'
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['course_name'], 'Software Quality Assurance')

        delete_response = self.client.delete(f'/api/courses/{course_id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_student_can_filter_available_courses_and_enroll(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get('/api/courses/available_for_enrollment/', {
            'search': 'Testing',
            'department': 'Computer',
            'lecturer': 'Ada',
            'semester': 'Rain',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        enroll_response = self.client.post(f'/api/courses/{self.course.course_id}/enroll/')
        self.assertEqual(enroll_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=self.course, status='active').exists())

        filtered_response = self.client.get('/api/courses/available_for_enrollment/', {'search': 'Testing'})
        self.assertEqual(filtered_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(filtered_response.data), 0)

    def test_lecturer_can_generate_monitor_and_close_qr_session(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(user=self.lecturer)

        response = self.client.post('/api/lectures/generate_qr/', {
            'course_id': self.course.course_id,
            'lecture_title': 'Introduction',
            'lecture_date': '2026-07-11',
            'lecture_time': '10:00',
            'venue': 'Lab 1',
            'duration': 15,
            'latitude': 7.3075,
            'longitude': 5.1372,
            'allowed_radius': 20,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        lecture_id = response.data['lecture']['lecture_id']
        lecture = Lecture.objects.get(lecture_id=lecture_id)
        self.assertTrue(lecture.qr_code_data)

        monitor_response = self.client.get(f'/api/lectures/{lecture_id}/live_attendance/')
        self.assertEqual(monitor_response.status_code, status.HTTP_200_OK)
        self.assertEqual(monitor_response.data['total'], 1)
        self.assertEqual(monitor_response.data['present'], 0)

        close_response = self.client.post(f'/api/lectures/{lecture_id}/close_qr/', {
            'reason': 'Test complete'
        }, format='json')
        self.assertEqual(close_response.status_code, status.HTTP_200_OK)
        lecture.refresh_from_db()
        self.assertEqual(lecture.qr_status, 'closed')
