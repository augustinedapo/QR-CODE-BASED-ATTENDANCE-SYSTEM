# feedback/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from feedback.models import FeedbackForm, FeedbackQuestion, FeedbackResponse
from feedback.serializers import FeedbackFormSerializer, FeedbackQuestionSerializer, FeedbackResponseSerializer


class FeedbackViewSet(viewsets.ModelViewSet):
    """Feedback form management viewset"""
    queryset = FeedbackForm.objects.all()
    serializer_class = FeedbackFormSerializer
    permission_classes = [IsAuthenticated]
