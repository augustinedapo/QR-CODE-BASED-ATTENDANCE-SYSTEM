# accounts/serializers.py

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate 
from accounts.models import CustomUser

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT Token serializer with user data"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user info to response
        user = self.user
        data['user'] = {
            'user_id': user.user_id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'avatar': user.avatar.url if user.avatar else None,
        }
        
        return data


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'user_id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'avatar', 'bio', 'department',
            'student_id', 'employee_id', 'is_verified', 'created_at'
        ]
        read_only_fields = ['user_id', 'created_at', 'is_verified']

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
            'password2', 'role', 'phone', 'department'
        ]

    def validate(self, data):
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError({"password": "Passwords must match."})
        
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        
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
            username=validated_data['email']  # Use email as username
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