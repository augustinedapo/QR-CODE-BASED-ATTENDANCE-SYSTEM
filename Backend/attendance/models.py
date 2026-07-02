# attendance/models.py

from django.db import models # type: ignore
from django.utils import timezone # type: ignore
from accounts.models import CustomUser
from courses.models import Lecture

class Attendance(models.Model):
    attendance_id = models.AutoField(primary_key=True)
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='attendances',
        limit_choices_to={'role': 'student'}
    )
    
    # Attendance details
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    location_verified = models.BooleanField(default=False)
    distance_from_venue = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Distance in meters"
    )
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    # Status
    is_late = models.BooleanField(default=False)
    is_valid = models.BooleanField(default=True)

    class Meta:
        db_table = 'attendance'
        unique_together = ['lecture', 'student']
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['lecture', 'student']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['student']),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.lecture.course.course_code}"

    def mark_as_late(self):
        """Mark attendance as late"""
        lecture_start = timezone.make_aware(
            timezone.datetime.combine(
                self.lecture.lecture_date,
                self.lecture.start_time
            )
        )
        if self.timestamp > lecture_start + timezone.timedelta(minutes=10):
            self.is_late = True
            self.save()


class GeolocationLog(models.Model):
    VERIFICATION_STATUS_CHOICES = (
        ('verified', 'Verified'),
        ('failed', 'Failed'),
        ('suspicious', 'Suspicious'),
    )

    log_id = models.AutoField(primary_key=True)
    attendance = models.ForeignKey(
        Attendance,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='geolocation_logs'
    )
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='geolocation_logs'
    )
    
    # Location data
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    accuracy = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="GPS accuracy in meters"
    )
    distance_from_venue = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )
    
    # Verification
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES
    )
    
    # Device info
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'geolocation_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['student', 'timestamp']),
            models.Index(fields=['verification_status']),
        ]

    def __str__(self):
        return f"Geolocation Log - {self.student.full_name} ({self.verification_status})"


class AttendanceReport(models.Model):
    REPORT_TYPE_CHOICES = (
        ('student', 'Student'),
        ('course', 'Course'),
        ('department', 'Department'),
    )
    
    FORMAT_CHOICES = (
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
    )

    report_id = models.AutoField(primary_key=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    generated_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_reports'
    )
    report_title = models.CharField(max_length=255)
    
    # Report data
    filters = models.JSONField(default=dict)
    file_path = models.FileField(upload_to='reports/', blank=True, null=True)
    file_format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    
    # Timestamps
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_reports'
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['report_type']),
            models.Index(fields=['generated_at']),
        ]

    def __str__(self):
        return f"{self.report_title} - {self.report_type}"
