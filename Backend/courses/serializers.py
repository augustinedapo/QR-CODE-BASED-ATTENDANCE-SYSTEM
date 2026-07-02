# courses/serializers.py

from rest_framework import serializers
from courses.models import Course, Lecture, Enrollment
from accounts.serializers import UserSerializer

class CourseSerializer(serializers.ModelSerializer):
    lecturer = UserSerializer(read_only=True)
    lecturer_id = serializers.IntegerField(write_only=True, required=False)
    student_count = serializers.SerializerMethodField()
    total_lectures = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'course_id', 'course_code', 'course_name', 'description',
            'department', 'semester', 'academic_year', 'lecturer',
            'lecturer_id', 'capacity', 'credits', 'schedule_json',
            'location', 'is_active', 'student_count', 'total_lectures',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['course_id', 'created_at', 'updated_at']

    def get_student_count(self, obj):
        return obj.student_count

    def get_total_lectures(self, obj):
        return obj.total_lectures


class LectureSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)
    attendance_count = serializers.SerializerMethodField()
    qr_is_valid = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = [
            'lecture_id', 'course', 'course_id', 'lecture_number',
            'topic', 'description', 'lecture_date', 'start_time',
            'end_time', 'location', 'venue_latitude', 'venue_longitude',
            'allowed_radius', 'qr_code_data', 'qr_generated_at',
            'qr_expiry_minutes', 'attendance_count', 'qr_is_valid',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'lecture_id', 'qr_code_data', 'qr_generated_at',
            'attendance_count', 'qr_is_valid', 'created_at', 'updated_at'
        ]

    def get_attendance_count(self, obj):
        return obj.attendance_count

    def get_qr_is_valid(self, obj):
        return obj.qr_is_valid


class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    course_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'enrollment_id', 'student', 'student_id', 'course',
            'course_id', 'status', 'grade', 'enrollment_date',
            'completion_date'
        ]
        read_only_fields = ['enrollment_id', 'enrollment_date']