# feedback/serializers.py

from rest_framework import serializers
from feedback.models import FeedbackForm, FeedbackQuestion, FeedbackResponse


class FeedbackFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackForm
        fields = [
            'form_id', 'course', 'lecture', 'title', 'description',
            'is_active', 'created_at', 'created_by'
        ]
        read_only_fields = ['form_id', 'created_at', 'created_by']


class FeedbackQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackQuestion
        fields = [
            'question_id', 'form', 'question_text', 'question_type',
            'is_required', 'order', 'created_at'
        ]
        read_only_fields = ['question_id', 'created_at']


class FeedbackResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackResponse
        fields = [
            'response_id', 'form', 'question', 'student', 'response_text',
            'rating_value', 'created_at'
        ]
        read_only_fields = ['response_id', 'created_at']
