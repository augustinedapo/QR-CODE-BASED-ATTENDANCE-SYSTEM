# accounts/models.py

from django.db import models # type: ignore
from django.contrib.auth.models import AbstractUser # type: ignore
from django.core.validators import URLValidator # type: ignore
from django.utils import timezone # type: ignore

class CustomUser(AbstractUser):
    """Custom user model with role-based differentiation"""
    
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Administrator'),
    )
    
    user_id = models.AutoField(primary_key=True)
    
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='student'
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    student_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_at = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    @property
    def full_name(self):
        return self.get_full_name()
    
    def mark_verified(self):
        """Mark user email as verified"""
        self.is_verified = True
        self.verified_at = timezone.now()
        self.save()

# class CustomUser(AbstractUser):
#     ROLE_CHOICES = (
#         ('student', 'Student'),
#         ('lecturer', 'Lecturer'),
#         ('admin', 'Administrator'),
#     )

#     user_id = models.AutoField(primary_key=True)
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
#     groups = models.ManyToManyField(
#         'auth.Group',
#         verbose_name='groups',
#         blank=True,
#         related_name='customuser_set'
#     )
#     user_permissions = models.ManyToManyField(
#         'auth.Permission',
#         verbose_name='user permissions',
#         blank=True,
#         related_name='customuser_set'
#     )
#     phone = models.CharField(max_length=20, blank=True, null=True)
#     avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
#     bio = models.TextField(blank=True, null=True)
#     department = models.CharField(max_length=100, blank=True, null=True)
#     student_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
#     employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
#     # Account status
#     is_active = models.BooleanField(default=True)
#     is_verified = models.BooleanField(default=False)
#     verified_at = models.DateTimeField(blank=True, null=True)
    
#     # Timestamps
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     last_login_at = models.DateTimeField(blank=True, null=True)

#     class Meta:
#         db_table = 'users'
#         ordering = ['-created_at']
#         verbose_name = 'User'
#         verbose_name_plural = 'Users'
#         indexes = [
#             models.Index(fields=['email']),
#             models.Index(fields=['role']),
#             models.Index(fields=['created_at']),
#         ]

#     def __str__(self):
#         return f"{self.first_name} {self.last_name} ({self.role})"

#     @property
#     def full_name(self):
#         return f"{self.first_name} {self.last_name}".strip()

#     def mark_verified(self):
#         self.is_verified = True
#         self.verified_at = timezone.now()
#         self.save()

#     def update_last_login(self):
#         self.last_login_at = timezone.now()
#         self.save()
