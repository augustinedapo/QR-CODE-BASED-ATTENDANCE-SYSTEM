# accounts/serializers.py

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate 
from django.utils import timezone
from accounts.models import CustomUser
import re

MATRIC_NUMBER_PATTERN = re.compile(r'^CPE/\d{2}/\d{4}$')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT Token serializer with user data"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user info to response
        user = self.user
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])

        data['user'] = {
            'user_id': user.user_id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'phone': user.phone,
            'department': user.department,
            'student_id': user.student_id,
            'employee_id': user.employee_id,
            'avatar': user.avatar.url if user.avatar else None,
            'last_login_at': user.last_login_at,
        }
        
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'user_id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'avatar', 'bio', 'department',
            'student_id', 'employee_id', 'is_verified', 'created_at',
            'last_login_at'
        ]
        read_only_fields = [
            'user_id', 'created_at', 'is_verified', 'last_login_at',
            'role', 'student_id', 'employee_id', 'email'
        ]

    def get_full_name(self, obj):
        return obj.full_name


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = CustomUser
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'password2', 'role', 'phone', 'department',
            'student_id', 'employee_id'
        ]

    def validate(self, data):
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError({"password": "Passwords must match."})

        role = data.get('role', 'student')
        if role not in ['student', 'lecturer']:
            raise serializers.ValidationError({
                "role": "Registration is only available for students and lecturers."
            })

        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})

        if role == 'student':
            if not data.get('student_id'):
                raise serializers.ValidationError({"student_id": "Matric Number is required."})
            if not MATRIC_NUMBER_PATTERN.match(data['student_id']):
                raise serializers.ValidationError({
                    "student_id": "Matric Number must use the CPE/YY/XXXX format."
                })
            if CustomUser.objects.filter(student_id=data['student_id']).exists():
                raise serializers.ValidationError({"student_id": "Matric Number already exists."})
            data['employee_id'] = None

        if role == 'lecturer':
            if not data.get('employee_id'):
                raise serializers.ValidationError({"employee_id": "Employee ID is required."})
            if CustomUser.objects.filter(employee_id=data['employee_id']).exists():
                raise serializers.ValidationError({"employee_id": "Employee ID already exists."})
            data['student_id'] = None

        return data

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'student'),
            phone=validated_data.get('phone'),
            department=validated_data.get('department'),
            student_id=validated_data.get('student_id'),
            employee_id=validated_data.get('employee_id'),
            username=validated_data['email'],
            is_verified=True
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError(
                {"new_password": "Passwords must match."}
            )
        return data
