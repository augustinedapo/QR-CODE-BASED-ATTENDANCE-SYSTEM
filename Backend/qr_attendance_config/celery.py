# qr_attendance_config/celery.py

import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qr_attendance_config.settings')

app = Celery('qr_attendance_config')

# Load config from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'send-low-attendance-alerts': {
        'task': 'notifications.tasks.notify_low_attendance',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    'send-daily-digest': {
        'task': 'notifications.tasks.send_daily_digest',
        'schedule': crontab(hour=8, minute=0),  # Run daily at 8 AM
    },
    'cleanup-expired-notifications': {
        'task': 'notifications.tasks.cleanup_expired_notifications',
        'schedule': crontab(hour=0, minute=0),  # Run daily at midnight
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')