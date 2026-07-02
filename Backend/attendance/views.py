# attendance/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404 # type: ignore
from django.utils import timezone # type: ignore
from datetime import timedelta, datetime
from attendance.models import Attendance, AttendanceReport, GeolocationLog
from attendance.serializers import (
    AttendanceSerializer,
    AttendanceReportSerializer,
    GeolocationLogSerializer
)
from courses.models import Lecture, Course
from reportlab.lib.pagesizes import letter # type: ignore
from reportlab.lib import colors # type: ignore
from reportlab.lib.styles import getSampleStyleSheet # type: ignore
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer # type: ignore
from reportlab.lib.units import inch # type: ignore
import openpyxl # type: ignore
from openpyxl.styles import Font, PatternFill, Alignment # type: ignore
from io import BytesIO
import math

class AttendanceViewSet(viewsets.ModelViewSet):
    """Attendance management viewset"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter attendance records"""
        user = self.request.user
        if user.role == 'student':
            return Attendance.objects.filter(student=user)
        elif user.role == 'lecturer':
            return Attendance.objects.filter(
                lecture__course__lecturer=user
            )
        return Attendance.objects.all()

    @action(detail=False, methods=['post'])
    def mark_attendance(self, request):
        """Mark student attendance with QR code"""
        lecture_id = request.data.get('lecture_id')
        qr_code_data = request.data.get('qr_code_data')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        accuracy = request.data.get('accuracy')

        # Get lecture
        lecture = get_object_or_404(Lecture, lecture_id=lecture_id)

        # Verify QR code
        if not lecture.qr_is_valid:
            return Response(
                {'error': 'QR code has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for duplicate attendance
        existing = Attendance.objects.filter(
            lecture=lecture,
            student=request.user
        ).first()

        if existing:
            return Response(
                {'error': 'Attendance already marked for this lecture'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify location if geolocation data provided
        location_verified = False
        distance_from_venue = None

        if latitude and longitude and lecture.venue_latitude and lecture.venue_longitude:
            distance_from_venue = self._calculate_distance(
                float(latitude), float(longitude),
                float(lecture.venue_latitude), float(lecture.venue_longitude)
            )

            if distance_from_venue <= lecture.allowed_radius:
                location_verified = True
            else:
                return Response(
                    {
                        'error': f'You are {distance_from_venue}m away from venue',
                        'distance': distance_from_venue,
                        'allowed_radius': lecture.allowed_radius
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create attendance record
        attendance = Attendance.objects.create(
            lecture=lecture,
            student=request.user,
            latitude=latitude,
            longitude=longitude,
            location_verified=location_verified,
            distance_from_venue=distance_from_venue,
            ip_address=self._get_client_ip(request)
        )

        # Log geolocation
        GeolocationLog.objects.create(
            attendance=attendance,
            student=request.user,
            latitude=latitude,
            longitude=longitude,
            accuracy=accuracy,
            distance_from_venue=distance_from_venue,
            verification_status='verified' if location_verified else 'failed',
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        return Response(
            {
                'success': True,
                'message': 'Attendance marked successfully',
                'attendance': AttendanceSerializer(attendance).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def course_attendance(self, request):
        """Get attendance records for a specific course"""
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response(
                {'error': 'course_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        course = get_object_or_404(Course, course_id=course_id)

        # Check permission
        if request.user.role == 'lecturer' and course.lecturer != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        lectures = Lecture.objects.filter(course=course).values_list(
            'lecture_id', flat=True
        )
        attendances = Attendance.objects.filter(lecture_id__in=lectures)

        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def generate_report(self, request):
        """Generate attendance report"""
        report_type = request.data.get('report_type')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        report_format = request.data.get('format', 'pdf')

        if not all([report_type, start_date, end_date]):
            return Response(
                {'error': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate report file
        if report_format == 'pdf':
            file_obj = self._generate_pdf_report(
                report_type, start_date, end_date, request.user
            )
            filename = f"attendance_report_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        else:
            file_obj = self._generate_excel_report(
                report_type, start_date, end_date, request.user
            )
            filename = f"attendance_report_{timezone.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

        # Save report record
        report = AttendanceReport.objects.create(
            report_type=report_type,
            generated_by=request.user,
            report_title=f"{report_type.title()} Attendance Report",
            filters={'start_date': start_date, 'end_date': end_date},
            file_format=report_format
        )

        return Response(
            {
                'success': True,
                'report_id': report.report_id,
                'filename': filename,
                'file': file_obj.getvalue().hex() if hasattr(file_obj, 'getvalue') else None
            },
            status=status.HTTP_201_CREATED
        )

    @staticmethod
    def _calculate_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two coordinates using Haversine formula"""
        R = 6371000  # Earth radius in meters
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return round(R * c)  # Return distance in meters

    @staticmethod
    def _get_client_ip(request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @staticmethod
    def _generate_pdf_report(report_type, start_date, end_date, user):
        """Generate PDF report"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []

        # Title
        styles = getSampleStyleSheet()
        title = Paragraph("Attendance Report", styles['Title'])
        elements.append(title)
        elements.append(Spacer(1, 0.3 * inch))

        # Data
        data = [['Date', 'Student', 'Status', 'Time']]
        
        attendances = Attendance.objects.filter(
            timestamp__date__range=[start_date, end_date]
        )

        for att in attendances:
            data.append([
                att.timestamp.strftime('%Y-%m-%d'),
                att.student.full_name,
                'Present' if not att.is_late else 'Late',
                att.timestamp.strftime('%H:%M:%S')
            ])

        # Table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))

        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        return buffer

    @staticmethod
    def _generate_excel_report(report_type, start_date, end_date, user):
        """Generate Excel report"""
        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = "Attendance"

        # Headers
        headers = ['Date', 'Student', 'Status', 'Time', 'Location Verified']
        for col, header in enumerate(headers, 1):
            cell = worksheet.cell(row=1, column=col)
            cell.value = header
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")

        # Data
        attendances = Attendance.objects.filter(
            timestamp__date__range=[start_date, end_date]
        )

        for row, att in enumerate(attendances, 2):
            worksheet.cell(row=row, column=1).value = att.timestamp.strftime('%Y-%m-%d')
            worksheet.cell(row=row, column=2).value = att.student.full_name
            worksheet.cell(row=row, column=3).value = 'Present' if not att.is_late else 'Late'
            worksheet.cell(row=row, column=4).value = att.timestamp.strftime('%H:%M:%S')
            worksheet.cell(row=row, column=5).value = 'Yes' if att.location_verified else 'No'

        # Adjust columns
        worksheet.column_dimensions['A'].width = 15
        worksheet.column_dimensions['B'].width = 25
        worksheet.column_dimensions['C'].width = 15
        worksheet.column_dimensions['D'].width = 15
        worksheet.column_dimensions['E'].width = 20

        buffer = BytesIO()
        workbook.save(buffer)
        buffer.seek(0)
        return buffer
    
# Add to AttendanceViewSet in attendance/views.py

    @action(detail=False, methods=['get'])
    def course_analytics(self, request):
        """Get analytics for a specific course"""
        from attendance.analytics import AttendanceAnalytics
        
        course_id = request.query_params.get('course_id')
        if not course_id:
            return Response(
                {'error': 'course_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check permission
        course = get_object_or_404(Course, course_id=course_id)
        if request.user.role == 'lecturer' and course.lecturer != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        analytics = AttendanceAnalytics.get_course_statistics(course_id)
        return Response(analytics, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def department_analytics(self, request):
        """Get analytics for a department"""
        from attendance.analytics import AttendanceAnalytics
        
        department = request.query_params.get('department')
        if not department:
            return Response(
                {'error': 'department is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only admin can view department analytics
        if request.user.role != 'admin':
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        analytics = AttendanceAnalytics.get_department_statistics(department)
        return Response(analytics, status=status.HTTP_200_OK)