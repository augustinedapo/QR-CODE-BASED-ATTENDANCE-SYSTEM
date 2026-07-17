# courses/serializers.py

from rest_framework import serializers
from courses.models import Course, Lecture, Enrollment
from accounts.serializers import UserSerializer

class CourseSerializer(serializers.ModelSerializer):
    lecturer = UserSerializer(read_only=True)
    lecturer_id = serializers.PrimaryKeyRelatedField(
        queryset=UserSerializer.Meta.model.objects.filter(role='lecturer'),
        source='lecturer',
        write_only=True,
        required=False
    )
    student_count = serializers.SerializerMethodField()
    total_lectures = serializers.SerializerMethodField()
    qr_lectures_count = serializers.SerializerMethodField()
    average_attendance = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'course_id', 'course_code', 'course_name', 'description',
            'department', 'semester', 'academic_year', 'lecturer',
            'lecturer_id', 'capacity', 'credits', 'schedule_json',
            'location', 'is_active', 'student_count', 'total_lectures',
            'qr_lectures_count', 'average_attendance',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['course_id', 'created_at', 'updated_at']

    def get_student_count(self, obj):
        return obj.student_count

    def get_total_lectures(self, obj):
        return obj.total_lectures

    def get_qr_lectures_count(self, obj):
        return obj.lectures.filter(qr_generated_at__isnull=False).count()

    def get_average_attendance(self, obj):
        qr_lectures = obj.lectures.filter(qr_generated_at__isnull=False)
        total_students = obj.student_count

        if not total_students or not qr_lectures.exists():
            return 0

        percentages = [
            (lecture.attendance_count / total_students) * 100
            for lecture in qr_lectures
        ]
        return round(sum(percentages) / len(percentages))


class LectureSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source='course',
        write_only=True
    )
    attendance_count = serializers.SerializerMethodField()
    qr_is_valid = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        fields = [
            'lecture_id', 'course', 'course_id', 'lecture_number',
            'topic', 'description', 'lecture_date', 'start_time',
            'end_time', 'location', 'venue_latitude', 'venue_longitude',
            'allowed_radius', 'qr_code_data', 'qr_generated_at',
            'qr_expiry_minutes', 'qr_status', 'computed_qr_status',
            'qr_closed_at', 'qr_closed_by', 'qr_close_reason',
            'attendance_count', 'qr_is_valid',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'lecture_id', 'qr_code_data', 'qr_generated_at',
            'qr_status', 'computed_qr_status', 'qr_closed_at',
            'qr_closed_by', 'attendance_count', 'qr_is_valid',
            'created_at', 'updated_at'
        ]

    def get_attendance_count(self, obj):
        return obj.attendance_count

    def get_qr_is_valid(self, obj):
        return obj.qr_is_valid


class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=UserSerializer.Meta.model.objects.filter(role='student'),
        source='student',
        write_only=True
    )
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source='course',
        write_only=True
    )

    class Meta:
        model = Enrollment
        fields = [
            'enrollment_id', 'student', 'student_id', 'course',
            'course_id', 'status', 'grade', 'enrollment_date',
            'completion_date'
        ]
        read_only_fields = ['enrollment_id', 'enrollment_date']
