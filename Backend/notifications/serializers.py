# notifications/serializers.py

from rest_framework import serializers
from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'notification_id', 'recipient', 'sender', 'title', 'message',
            'notification_type', 'priority', 'related_object_type',
            'related_object_id', 'is_read', 'read_at', 'created_at',
            'expires_at'
        ]
        read_only_fields = ['notification_id', 'sender', 'read_at', 'created_at']
