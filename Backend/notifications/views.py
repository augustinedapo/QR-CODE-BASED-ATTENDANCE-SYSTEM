# notifications/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from notifications.models import Notification
from notifications.serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """Notification management viewset"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter notifications for current user"""
        return Notification.objects.filter(recipient=self.request.user)
