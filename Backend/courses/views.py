# courses/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta
import base64
import json
from courses.models import Course, Lecture, Enrollment
from courses.serializers import CourseSerializer, LectureSerializer, EnrollmentSerializer


class CourseViewSet(viewsets.ModelViewSet):
    """Course management viewset"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter courses based on user role"""
        user = self.request.user
        if user.role == 'admin':
            return Course.objects.all()
        elif user.role == 'lecturer':
            return Course.objects.filter(lecturer=user)
        else:
            return Course.objects.filter(enrollments__student=user).distinct()

    def perform_create(self, serializer):
        if self.request.user.role != 'lecturer':
            raise PermissionDenied('Only lecturers can register courses.')
        serializer.save(lecturer=self.request.user)

    def _ensure_course_owner(self, course):
        if self.request.user.role == 'admin':
            return None
        if self.request.user.role != 'lecturer' or course.lecturer != self.request.user:
            return Response(
                {'detail': 'Only the course lecturer can change this course.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return None

    def create(self, request, *args, **kwargs):
        if request.user.role != 'lecturer':
            return Response(
                {'detail': 'Only lecturers can register courses.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        denied = self._ensure_course_owner(course)
        if denied:
            return denied
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        course = self.get_object()
        denied = self._ensure_course_owner(course)
        if denied:
            return denied
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        denied = self._ensure_course_owner(course)
        if denied:
            return denied

        if course.lectures.exists() or course.enrollments.exists():
            course.is_active = False
            course.save(update_fields=['is_active'])
            return Response(
                {'success': True, 'message': 'Course archived successfully.'},
                status=status.HTTP_200_OK
            )

        return super().destroy(request, *args, **kwargs)

    @staticmethod
    def _apply_course_filters(queryset, request):
        search = request.query_params.get('search')
        department = request.query_params.get('department')
        lecturer = request.query_params.get('lecturer')
        semester = request.query_params.get('semester')
        academic_year = request.query_params.get('academic_year')

        if search:
            queryset = queryset.filter(
                Q(course_code__icontains=search)
                | Q(course_name__icontains=search)
                | Q(description__icontains=search)
            )
        if department:
            queryset = queryset.filter(department__icontains=department)
        if lecturer:
            queryset = queryset.filter(
                Q(lecturer__first_name__icontains=lecturer)
                | Q(lecturer__last_name__icontains=lecturer)
                | Q(lecturer__email__icontains=lecturer)
            )
        if semester:
            queryset = queryset.filter(semester__icontains=semester)
        if academic_year:
            queryset = queryset.filter(academic_year__icontains=academic_year)
        return queryset

    @action(detail=False, methods=['get'])
    def available_for_enrollment(self, request):
        if request.user.role != 'student':
            return Response(
                {'detail': 'Only students can view courses available for enrollment.'},
                status=status.HTTP_403_FORBIDDEN
            )

        enrolled_course_ids = Enrollment.objects.filter(
            student=request.user,
            status='active'
        ).values_list('course_id', flat=True)
        courses = Course.objects.filter(is_active=True).exclude(course_id__in=enrolled_course_ids)
        courses = self._apply_course_filters(courses, request)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        if request.user.role != 'student':
            return Response(
                {'detail': 'Only students can enroll in courses.'},
                status=status.HTTP_403_FORBIDDEN
            )

        course = get_object_or_404(Course, course_id=pk, is_active=True)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'status': 'active'}
        )

        if not created and enrollment.status != 'active':
            enrollment.status = 'active'
            enrollment.save(update_fields=['status'])

        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        course = self.get_object()
        if request.user.role == 'lecturer' and course.lecturer != request.user:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role == 'student':
            return Response({'detail': 'Only lecturers can view course students.'}, status=status.HTTP_403_FORBIDDEN)

        enrollments = course.enrollments.filter(status='active').select_related('student')
        return Response(EnrollmentSerializer(enrollments, many=True).data)

    @action(detail=True, methods=['get'])
    def lectures(self, request, pk=None):
        course = self.get_object()
        if request.user.role == 'lecturer' and course.lecturer != request.user:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role == 'student' and not course.enrollments.filter(student=request.user, status='active').exists():
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        lectures = course.lectures.all()
        return Response(LectureSerializer(lectures, many=True).data)


class LectureViewSet(viewsets.ModelViewSet):
    """Lecture management viewset"""
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'lecturer':
            return Lecture.objects.filter(course__lecturer=user)
        if user.role == 'student':
            return Lecture.objects.filter(course__enrollments__student=user).distinct()
        return Lecture.objects.all()

    @action(detail=False, methods=['post'])
    def generate_qr(self, request):
        """Create a lecture attendance QR session using lecturer location."""
        if request.user.role != 'lecturer':
            return Response(
                {'error': 'Only lecturers can generate QR attendance sessions'},
                status=status.HTTP_403_FORBIDDEN
            )

        required_fields = [
            'course_id', 'lecture_title', 'lecture_date', 'lecture_time',
            'venue', 'duration', 'latitude', 'longitude', 'allowed_radius'
        ]
        missing_fields = [field for field in required_fields if request.data.get(field) in [None, '']]
        if missing_fields:
            return Response(
                {'error': 'Missing required fields', 'fields': missing_fields},
                status=status.HTTP_400_BAD_REQUEST
            )

        course = get_object_or_404(
            Course,
            course_id=request.data.get('course_id'),
            lecturer=request.user
        )

        try:
            lecture_date = datetime.strptime(request.data.get('lecture_date'), '%Y-%m-%d').date()
            start_time = datetime.strptime(request.data.get('lecture_time'), '%H:%M').time()
            duration = int(request.data.get('duration'))
            allowed_radius = int(request.data.get('allowed_radius'))
            latitude = float(request.data.get('latitude'))
            longitude = float(request.data.get('longitude'))
            lecture_number = int(request.data.get('lecture_number') or (course.lectures.count() + 1))
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid lecture, location, duration, or radius value'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if allowed_radius <= 0:
            return Response(
                {'error': 'Allowed radius must be greater than 0 metres'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if duration <= 0:
            return Response(
                {'error': 'QR validity duration must be greater than 0 minutes'},
                status=status.HTTP_400_BAD_REQUEST
            )

        start_datetime = datetime.combine(lecture_date, start_time)
        end_time = (start_datetime + timedelta(hours=1)).time()

        lecture = Lecture.objects.create(
            course=course,
            lecture_number=lecture_number,
            topic=request.data.get('lecture_title'),
            lecture_date=lecture_date,
            start_time=start_time,
            end_time=end_time,
            location=request.data.get('venue'),
            venue_latitude=latitude,
            venue_longitude=longitude,
            allowed_radius=allowed_radius,
            qr_expiry_minutes=duration,
            qr_generated_at=timezone.now(),
            qr_status='active'
        )

        qr_payload = {
            'type': 'attendance',
            'lecture_id': lecture.lecture_id,
            'course_id': course.course_id,
            'generated_at': lecture.qr_generated_at.isoformat(),
            'expires_in_minutes': duration
        }
        qr_code_data = base64.b64encode(json.dumps(qr_payload).encode('utf-8')).decode('utf-8')
        lecture.qr_code_data = qr_code_data
        lecture.save(update_fields=['qr_code_data'])

        return Response(
            {
                'success': True,
                'message': 'QR attendance session generated successfully',
                'qr_code_data': qr_code_data,
                'lecture': LectureSerializer(lecture).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def qr_sessions(self, request):
        """List QR sessions generated for the lecturer's courses."""
        user = request.user
        if user.role != 'lecturer':
            return Response(
                {'detail': 'Only lecturers can view QR session history.'},
                status=status.HTTP_403_FORBIDDEN
            )

        sessions = Lecture.objects.filter(
            course__lecturer=user,
            qr_generated_at__isnull=False
        ).order_by('-qr_generated_at')
        course_id = request.query_params.get('course_id')
        if course_id:
            sessions = sessions.filter(course_id=course_id)
        return Response(LectureSerializer(sessions, many=True).data)

    @action(detail=True, methods=['post'])
    def close_qr(self, request, pk=None):
        """Close an active QR session before it expires."""
        lecture = self.get_object()
        if request.user.role != 'lecturer' or lecture.course.lecturer != request.user:
            return Response(
                {'detail': 'Only the course lecturer can close this QR session.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if lecture.qr_status == 'closed':
            return Response(
                {'detail': 'This attendance session has already ended.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        lecture.qr_status = 'closed'
        lecture.qr_closed_at = timezone.now()
        lecture.qr_closed_by = request.user
        lecture.qr_close_reason = request.data.get('reason') or 'Closed by lecturer'
        lecture.save(update_fields=[
            'qr_status', 'qr_closed_at', 'qr_closed_by', 'qr_close_reason'
        ])

        return Response({
            'success': True,
            'message': 'This attendance session has ended',
            'lecture': LectureSerializer(lecture).data
        })

    @action(detail=True, methods=['get'])
    def live_attendance(self, request, pk=None):
        """Return live attendance counts for polling."""
        lecture = self.get_object()
        if request.user.role != 'lecturer' or lecture.course.lecturer != request.user:
            return Response(
                {'detail': 'Only the course lecturer can monitor this session.'},
                status=status.HTTP_403_FORBIDDEN
            )

        total = lecture.course.enrollments.filter(status='active').count()
        present = lecture.attendances.filter(location_verified=True).count()
        return Response({
            'lecture_id': lecture.lecture_id,
            'status': lecture.computed_qr_status,
            'total': total,
            'present': present,
            'absent': max(total - present, 0),
            'attendance_count': present
        })

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Return upcoming lecture/session list for the current user."""
        today = timezone.localdate()
        lectures = self.get_queryset().filter(lecture_date__gte=today).order_by('lecture_date', 'start_time')[:20]
        return Response(LectureSerializer(lectures, many=True).data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """Student enrollment management viewset"""
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Enrollment.objects.all()
        if user.role == 'lecturer':
            return Enrollment.objects.filter(course__lecturer=user)
        return Enrollment.objects.filter(student=user)
