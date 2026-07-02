# notifications/models.py

from django.db import models
from django.utils import timezone
from accounts.models import CustomUser

class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('attendance', 'Attendance'),
        ('assessment', 'Assessment'),
        ('feedback', 'Feedback'),
        ('alert', 'Alert'),
        ('announcement', 'Announcement'),
    )

    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )

    notification_id = models.AutoField(primary_key=True)
    recipient = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications'
    )
    
    # Content
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Related objects
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    related_object_id = models.IntegerField(blank=True, null=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient.full_name}"

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class EmailNotification(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
    )

    email_id = models.AutoField(primary_key=True)
    recipient = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='email_notifications'
    )
    notification = models.OneToOneField(
        Notification,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='email_notification'
    )
    
    # Email details
    subject = models.CharField(max_length=255)
    body = models.TextField()
    recipient_email = models.EmailField()
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    attempts = models.IntegerField(default=0)
    last_attempt_at = models.DateTimeField(blank=True, null=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'email_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['recipient_email']),
        ]

    def __str__(self):
        return f"Email to {self.recipient_email}"