# courses/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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


class LectureViewSet(viewsets.ModelViewSet):
    """Lecture management viewset"""
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    permission_classes = [IsAuthenticated]


class EnrollmentViewSet(viewsets.ModelViewSet):
    """Student enrollment management viewset"""
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
