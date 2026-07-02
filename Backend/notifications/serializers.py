# notifications/serializers.py

from rest_framework import serializers
from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'notification_id', 'recipient', 'title', 'message',
            'notification_type', 'related_object_id', 'is_read',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['notification_id', 'created_at', 'updated_at']
