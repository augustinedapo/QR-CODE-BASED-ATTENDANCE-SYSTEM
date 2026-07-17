"""
URL configuration for qr_attendance_config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# qr_attendance_config/urls.py

from django.contrib import admin  # type: ignore[import]
from django.urls import path, include # type: ignore
from django.conf import settings # type: ignore
from django.conf.urls.static import static # type: ignore
from django.http import HttpResponse, JsonResponse
from rest_framework.routers import DefaultRouter 
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserViewSet
)
from courses.views import CourseViewSet, LectureViewSet, EnrollmentViewSet
from attendance.views import AttendanceViewSet
from notifications.views import NotificationViewSet

# Create router
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lectures', LectureViewSet, basename='lecture')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'notifications', NotificationViewSet, basename='notification')


def openapi_schema_view(request):
    schema = {
        'openapi': '3.0.3',
        'info': {
            'title': 'FUTA QR Attendance API',
            'version': '1.0.0',
            'description': 'Authentication, courses, enrollment, QR sessions, attendance, and notifications.'
        },
        'servers': [{'url': '/api'}],
        'components': {
            'securitySchemes': {
                'bearerAuth': {
                    'type': 'http',
                    'scheme': 'bearer',
                    'bearerFormat': 'JWT'
                }
            }
        },
        'security': [{'bearerAuth': []}],
        'paths': {
            '/auth/register/': {
                'post': {'summary': 'Register a student or lecturer account', 'security': []}
            },
            '/auth/login/': {
                'post': {'summary': 'Log in with email and password', 'security': []}
            },
            '/users/me/': {
                'get': {'summary': 'Get the authenticated user profile'}
            },
            '/courses/': {
                'get': {'summary': 'List courses visible to the current user'},
                'post': {'summary': 'Create a lecturer-owned course'}
            },
            '/courses/available_for_enrollment/': {
                'get': {'summary': 'Search student-enrollable courses by search, department, lecturer, and semester'}
            },
            '/courses/{id}/': {
                'get': {'summary': 'Get course details'},
                'patch': {'summary': 'Edit a lecturer-owned course'},
                'delete': {'summary': 'Delete or archive a lecturer-owned course'}
            },
            '/courses/{id}/enroll/': {
                'post': {'summary': 'Enroll the current student in a course'}
            },
            '/courses/{id}/students/': {
                'get': {'summary': 'List active students in a course'}
            },
            '/courses/{id}/lectures/': {
                'get': {'summary': 'List lectures for a course'}
            },
            '/lectures/generate_qr/': {
                'post': {'summary': 'Generate a location-bound QR attendance session'}
            },
            '/lectures/qr_sessions/': {
                'get': {'summary': 'List lecturer QR session history'}
            },
            '/lectures/upcoming/': {
                'get': {'summary': 'List upcoming sessions for the current user'}
            },
            '/lectures/{id}/close_qr/': {
                'post': {'summary': 'Manually close a QR session before expiry'}
            },
            '/lectures/{id}/live_attendance/': {
                'get': {'summary': 'Poll live attendance counts for an active QR session'}
            },
            '/attendance/mark_attendance/': {
                'post': {'summary': 'Mark attendance with QR data and student geolocation'}
            },
            '/attendance/my_scan_history/': {
                'get': {'summary': 'List student scan success and failure history'}
            },
            '/attendance/my_course_summary/': {
                'get': {'summary': 'List student attendance percentage per course'}
            },
            '/attendance/missed_lectures/': {
                'get': {'summary': 'List missed lectures for the current student'}
            },
            '/attendance/generate_report/': {
                'post': {'summary': 'Generate attendance reports by course, lecture, student, department, and date range'}
            },
            '/notifications/': {
                'get': {'summary': 'List notifications for the current user'}
            }
        }
    }
    return JsonResponse(schema)


def api_docs_view(request):
    return HttpResponse(
        """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FUTA QR Attendance API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/api/schema/",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis],
        });
      };
    </script>
  </body>
</html>
        """,
        content_type='text/html'
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/schema/', openapi_schema_view, name='openapi-schema'),
    path('api/docs/', api_docs_view, name='api-docs'),
    
    # Authentication
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
