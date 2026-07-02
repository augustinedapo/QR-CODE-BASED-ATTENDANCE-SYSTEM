# notifications/tasks.py

from celery import shared_task
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from notifications.models import EmailNotification, Notification
from accounts.models import CustomUser
from attendance.models import Attendance
from courses.models import Course
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_email_notification(email_id):
    """Send email notification"""
    try:
        email_notif = EmailNotification.objects.get(email_id=email_id)
        
        # Create email with HTML template
        html_message = render_to_string('emails/notification.html', {
            'subject': email_notif.subject,
            'body': email_notif.body,
        })
        text_message = strip_tags(html_message)

        # Send email
        msg = EmailMultiAlternatives(
            subject=email_notif.subject,
            body=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email_notif.recipient_email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send()

        # Update status
        email_notif.status = 'sent'
        email_notif.sent_at = timezone.now()
        email_notif.save()

        logger.info(f"Email sent to {email_notif.recipient_email}")
        
    except EmailNotification.DoesNotExist:
        logger.error(f"EmailNotification {email_id} not found")
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        email_notif = EmailNotification.objects.get(email_id=email_id)
        email_notif.status = 'failed'
        email_notif.error_message = str(e)
        email_notif.attempts += 1
        email_notif.last_attempt_at = timezone.now()
        email_notif.save()


@shared_task
def notify_low_attendance():
    """Send notifications to students with low attendance"""
    try:
        # Get all students
        students = CustomUser.objects.filter(role='student', is_active=True)
        
        for student in students:
            # Calculate attendance percentage
            total_lectures = Attendance.objects.filter(
                student=student
            ).count()
            
            total_possible = Attendance.objects.filter(
                lecture__course__enrollments__student=student
            ).count()

            if total_possible > 0:
                percentage = (total_lectures / total_possible) * 100
                
                # Send alert if below 75%
                if percentage < 75:
                    # Create notification
                    notification = Notification.objects.create(
                        recipient=student,
                        title='Low Attendance Alert',
                        message=f'Your attendance is {percentage:.1f}%. '
                               f'Please attend more lectures to avoid penalties.',
                        notification_type='alert',
                        priority='high'
                    )

                    # Send email
                    email_notif = EmailNotification.objects.create(
                        recipient=student,
                        notification=notification,
                        subject='Low Attendance Alert',
                        body=f'Your current attendance is {percentage:.1f}%. '
                             f'Please attend more lectures.',
                        recipient_email=student.email,
                        status='pending'
                    )
                    
                    send_email_notification.delay(email_notif.email_id)
                    
        logger.info("Low attendance notifications sent")
        
    except Exception as e:
        logger.error(f"Error in notify_low_attendance: {str(e)}")


@shared_task
def send_daily_digest():
    """Send daily digest email to lecturers"""
    try:
        lecturers = CustomUser.objects.filter(role='lecturer', is_active=True)
        
        for lecturer in lecturers:
            # Get today's lectures
            today = timezone.now().date()
            lectures = lecturer.courses.all().filter(
                lectures__lecture_date=today
            )
            
            if lectures.exists():
                # Create notification
                message = f"You have {lectures.count()} lectures today"
                
                notification = Notification.objects.create(
                    recipient=lecturer,
                    title='Daily Lecture Digest',
                    message=message,
                    notification_type='announcement',
                    priority='normal'
                )

                # Send email
                email_notif = EmailNotification.objects.create(
                    recipient=lecturer,
                    notification=notification,
                    subject='Your Lectures Today',
                    body=message,
                    recipient_email=lecturer.email,
                    status='pending'
                )
                
                send_email_notification.delay(email_notif.email_id)
                
        logger.info("Daily digests sent")
        
    except Exception as e:
        logger.error(f"Error in send_daily_digest: {str(e)}")


@shared_task
def cleanup_expired_notifications():
    """Delete expired notifications"""
    try:
        expiration_date = timezone.now() - timedelta(days=30)
        deleted_count, _ = Notification.objects.filter(
            expires_at__lt=expiration_date
        ).delete()
        
        logger.info(f"Deleted {deleted_count} expired notifications")
        
    except Exception as e:
        logger.error(f"Error in cleanup_expired_notifications: {str(e)}")