from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser


@override_settings(ALLOWED_HOSTS=['testserver', 'localhost'])
class AuthAPITests(APITestCase):
    def test_student_can_register_and_login_with_email_password(self):
        payload = {
            'email': 'new.student@futa.edu.ng',
            'first_name': 'New',
            'last_name': 'Student',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'role': 'student',
            'department': 'Computer Science',
            'student_id': 'CPE/24/9001',
        }

        response = self.client.post('/api/auth/register/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        user = CustomUser.objects.get(email=payload['email'])
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_verified)
        self.assertEqual(user.student_id, payload['student_id'])

        login_response = self.client.post('/api/auth/login/', {
            'email': payload['email'],
            'password': payload['password'],
        }, format='json')

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data['user']['role'], 'student')

    def test_lecturer_registration_requires_employee_id(self):
        response = self.client.post('/api/auth/register/', {
            'email': 'lecturer.noid@futa.edu.ng',
            'first_name': 'No',
            'last_name': 'Employee',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'role': 'lecturer',
            'department': 'Computer Science',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('employee_id', response.data)

    def test_student_registration_rejects_invalid_matric_number(self):
        response = self.client.post('/api/auth/register/', {
            'email': 'bad.matric@futa.edu.ng',
            'first_name': 'Bad',
            'last_name': 'Matric',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'role': 'student',
            'department': 'Computer Engineering',
            'student_id': 'STU900001',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('student_id', response.data)
