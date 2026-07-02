# attendance/serializers.py

from rest_framework import serializers
from attendance.models import Attendance, GeolocationLog, AttendanceReport
from courses.serializers import LectureSerializer
from accounts.serializers import UserSerializer
from django.utils import timezone # type: ignore
from datetime import timedelta
import json
import base64
import hmac
import hashlib

class AttendanceSerializer(serializers.ModelSerializer):
    lecture = LectureSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    lecture_id = serializers.IntegerField(write_only=True)
    qr_code_data = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Attendance
        fields = [
            'attendance_id', 'lecture', 'lecture_id', 'student',
            'timestamp', 'latitude', 'longitude', 'location_verified',
            'distance_from_venue', 'ip_address', 'is_late', 'is_valid',
            'qr_code_data', 'created_at'
        ]
        read_only_fields = [
            'attendance_id', 'timestamp', 'is_late', 'is_valid'
        ]

    def create(self, validated_data):
        # Verify QR code
        qr_code_data = validated_data.pop('qr_code_data', None)
        if qr_code_data:
            if not self._verify_qr_code(qr_code_data, validated_data['lecture']):
                raise serializers.ValidationError("Invalid or expired QR code")

        # Create attendance
        attendance = Attendance.objects.create(**validated_data)
        
        # Check if late
        lecture_start = timezone.make_aware(
            timezone.datetime.combine(
                attendance.lecture.lecture_date,
                attendance.lecture.start_time
            )
        )
        if attendance.timestamp > lecture_start + timedelta(minutes=10):
            attendance.is_late = True
            attendance.save()

        return attendance

    def _verify_qr_code(self, qr_data, lecture):
        """Verify QR code validity"""
        try:
            # Decode and verify QR data
            decoded = base64.b64decode(qr_data).decode('utf-8')
            data = json.loads(decoded)
            
            # Check expiry
            if not lecture.qr_is_valid:
                return False
            
            # Check lecture match
            if data.get('lecture_id') != lecture.lecture_id:
                return False
            
            return True
        except Exception as e:
            return False


class GeolocationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeolocationLog
        fields = [
            'log_id', 'attendance', 'student', 'latitude', 'longitude',
            'accuracy', 'distance_from_venue', 'verification_status',
            'ip_address', 'timestamp'
        ]
        read_only_fields = ['log_id', 'timestamp']


class AttendanceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceReport
        fields = [
            'report_id', 'report_type', 'generated_by', 'report_title',
            'filters', 'file_path', 'file_format', 'generated_at'
        ]
        read_only_fields = [
            'report_id', 'file_path', 'generated_at'
        ]