# feedback/views.py

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from feedback.models import FeedbackForm, FeedbackQuestion, FeedbackResponse
from feedback.serializers import FeedbackFormSerializer, FeedbackQuestionSerializer, FeedbackResponseSerializer


class FeedbackViewSet(viewsets.ModelViewSet):
    """Feedback form management viewset"""
    queryset = FeedbackForm.objects.all()
    serializer_class = FeedbackFormSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return FeedbackForm.objects.all()
        if user.role == 'lecturer':
            return FeedbackForm.objects.filter(course__lecturer=user)
        return FeedbackForm.objects.filter(course__enrollments__student=user).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get', 'post'])
    def questions(self, request, pk=None):
        feedback_form = self.get_object()

        if request.method == 'GET':
            serializer = FeedbackQuestionSerializer(feedback_form.questions.all(), many=True)
            return Response(serializer.data)

        if request.user.role not in ['lecturer', 'admin']:
            return Response(
                {'detail': 'Only lecturers and administrators can add feedback questions.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = FeedbackQuestionSerializer(data={**request.data, 'form': feedback_form.form_id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'])
    def responses(self, request, pk=None):
        feedback_form = self.get_object()

        if request.method == 'GET':
            if request.user.role not in ['lecturer', 'admin']:
                return Response(
                    {'detail': 'Only lecturers and administrators can view feedback responses.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = FeedbackResponseSerializer(feedback_form.responses.all(), many=True)
            return Response(serializer.data)

        if request.user.role != 'student':
            return Response(
                {'detail': 'Only students can submit feedback responses.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = FeedbackResponseSerializer(data={**request.data, 'form': feedback_form.form_id})
        serializer.is_valid(raise_exception=True)
        serializer.save(student=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
