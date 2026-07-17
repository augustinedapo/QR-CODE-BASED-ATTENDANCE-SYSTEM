# courses/models.py

from django.db import models # type: ignore
from django.core.validators import MinValueValidator, MaxValueValidator # type: ignore
from django.utils import timezone # type: ignore
from accounts.models import CustomUser

class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    course_code = models.CharField(max_length=20, unique=True)
    course_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    department = models.CharField(max_length=100)
    semester = models.CharField(max_length=50)
    academic_year = models.CharField(max_length=20)
    
    # Instructor
    lecturer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='courses',
        limit_choices_to={'role': 'lecturer'}
    )
    
    # Enrollment info
    capacity = models.IntegerField(default=100)
    credits = models.IntegerField(default=3)
    
    # Schedule
    schedule_json = models.JSONField(default=dict, blank=True)  # {"days": ["Mon", "Wed"], "time": "10:00"}
    location = models.CharField(max_length=255, blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['course_code']),
            models.Index(fields=['lecturer']),
            models.Index(fields=['academic_year']),
        ]

    def __str__(self):
        return f"{self.course_code} - {self.course_name}"

    @property
    def student_count(self):
        return self.enrollments.filter(status='active').count()

    @property
    def total_lectures(self):
        return self.lectures.count()


class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('dropped', 'Dropped'),
        ('completed', 'Completed'),
    )

    enrollment_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    grade = models.CharField(max_length=2, blank=True, null=True)
    
    # Timestamps
    enrollment_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ['student', 'course']
        ordering = ['-enrollment_date']
        indexes = [
            models.Index(fields=['student', 'course']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.course.course_code}"


class Lecture(models.Model):
    QR_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('expired', 'Expired'),
    )

    lecture_id = models.AutoField(primary_key=True)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='lectures'
    )
    lecture_number = models.IntegerField(default=1)
    topic = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Schedule
    lecture_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=255)
    
    # Geolocation
    venue_latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        blank=True,
        null=True
    )
    venue_longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        blank=True,
        null=True
    )
    allowed_radius = models.IntegerField(default=50, help_text="Radius in meters")
    
    # QR Code
    qr_code_data = models.TextField(blank=True, null=True)
    qr_generated_at = models.DateTimeField(blank=True, null=True)
    qr_expiry_minutes = models.IntegerField(default=10)
    qr_status = models.CharField(
        max_length=20,
        choices=QR_STATUS_CHOICES,
        default='pending'
    )
    qr_closed_at = models.DateTimeField(blank=True, null=True)
    qr_closed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='closed_qr_sessions'
    )
    qr_close_reason = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lectures'
        ordering = ['-lecture_date', 'start_time']
        indexes = [
            models.Index(fields=['course', 'lecture_date']),
            models.Index(fields=['lecture_date']),
            models.Index(fields=['qr_status']),
            models.Index(fields=['qr_generated_at']),
        ]

    def __str__(self):
        return f"{self.course.course_code} - Lecture {self.lecture_number}"

    @property
    def qr_is_valid(self):
        """Check if QR code is still valid"""
        if not self.qr_generated_at or self.qr_status == 'closed':
            return False
        from django.utils import timezone
        expiry_time = self.qr_generated_at + timezone.timedelta(
            minutes=self.qr_expiry_minutes
        )
        return timezone.now() <= expiry_time

    @property
    def computed_qr_status(self):
        if self.qr_status == 'closed':
            return 'closed'
        if not self.qr_generated_at:
            return 'pending'
        return 'active' if self.qr_is_valid else 'expired'

    @property
    def attendance_count(self):
        return self.attendances.filter(location_verified=True).count()

    @property
    def total_students(self):
        return self.course.student_count
