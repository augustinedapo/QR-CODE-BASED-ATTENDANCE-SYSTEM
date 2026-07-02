# feedback/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import CustomUser
from courses.models import Course, Lecture

class FeedbackForm(models.Model):
    form_id = models.AutoField(primary_key=True)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='feedback_forms'
    )
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedback_forms'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_feedback_forms'
    )

    class Meta:
        db_table = 'feedback_forms'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class FeedbackQuestion(models.Model):
    QUESTION_TYPE_CHOICES = (
        ('rating', 'Rating'),
        ('text', 'Text'),
        ('multiple_choice', 'Multiple Choice'),
        ('yes_no', 'Yes/No'),
    )

    question_id = models.AutoField(primary_key=True)
    form = models.ForeignKey(
        FeedbackForm,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    options = models.JSONField(default=list, blank=True)  # For multiple choice
    is_required = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'feedback_questions'
        ordering = ['order']

    def __str__(self):
        return self.question_text[:100]


class FeedbackResponse(models.Model):
    response_id = models.AutoField(primary_key=True)
    form = models.ForeignKey(
        FeedbackForm,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='feedback_responses',
        limit_choices_to={'role': 'student'}
    )
    
    # Response data
    responses = models.JSONField(default=dict)  # {question_id: answer}
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True,
        null=True
    )
    comments = models.TextField(blank=True, null=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'feedback_responses'
        unique_together = ['form', 'student']
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['form', 'student']),
            models.Index(fields=['submitted_at']),
        ]

    def __str__(self):
        return f"Feedback - {self.student.full_name} - {self.form.title}"