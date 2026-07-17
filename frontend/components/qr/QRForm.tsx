// components/qr/QRForm.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Info, QrCode } from 'lucide-react';
import { getMockData } from '@/utils/mockData';
import { Course } from '@/types/index';
import { courseService } from '@/services/courseService';
import { QRCodeData } from './QRGenerator';
import styles from './QRForm.module.css';

interface QRFormProps {
  onGenerate: (data: QRCodeData) => void;
  isLoading: boolean;
  initialCourseId?: string;
}

const QRForm: React.FC<QRFormProps> = ({ onGenerate, isLoading, initialCourseId }) => {
  const [courses, setCourses] = useState<Course[]>(getMockData.getCourses());
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    course_id: initialCourseId || '',
    lecture_title: '',
    lecture_date: today,
    lecture_time: currentTime,
    venue: '',
    duration: '10',
    allowed_radius: '20',
    lecture_number: ''
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await courseService.getCourses();
        if (Array.isArray(response) && response.length > 0) {
          setCourses(response);
        }
      } catch {
        setCourses(getMockData.getCourses());
      }
    };

    loadCourses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.lecture_title || !formData.venue) {
      setValidationError('Please fill all required fields before generating a QR code.');
      return;
    }

    const qrData: QRCodeData = {
      course_id: parseInt(formData.course_id),
      lecture_title: formData.lecture_title,
      lecture_date: formData.lecture_date,
      lecture_time: formData.lecture_time,
      venue: formData.venue,
      duration: parseInt(formData.duration),
      allowed_radius: parseInt(formData.allowed_radius),
      lecture_number: formData.lecture_number ? parseInt(formData.lecture_number) : undefined
    };

    onGenerate(qrData);
  };

  return (
    <Card className={styles.card}>
      <Card.Body>
        <h2 className={styles.title}>Lecture Details</h2>
        <p className={styles.subtitle}>Fill in the information to generate a QR code for attendance</p>
        {validationError && <div className={styles.errorBox}>{validationError}</div>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Select Course *</Form.Label>
            <Form.Select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Lecture Title *</Form.Label>
            <Form.Control
              type="text"
              name="lecture_title"
              placeholder="e.g., TCP/IP Protocol"
              value={formData.lecture_title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="lecture_date"
                  value={formData.lecture_date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Time *</Form.Label>
                <Form.Control
                  type="time"
                  name="lecture_time"
                  value={formData.lecture_time}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-4">
            <Form.Label>Venue *</Form.Label>
            <Form.Control
              type="text"
              name="venue"
              placeholder="e.g., Lab 204"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>QR Code Validity (minutes) *</Form.Label>
                <Form.Select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Allowed Radius (metres) *</Form.Label>
                <Form.Control
                  type="number"
                  name="allowed_radius"
                  value={formData.allowed_radius}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Lecture Number</Form.Label>
                <Form.Control
                  type="number"
                  name="lecture_number"
                  placeholder="e.g., 23"
                  value={formData.lecture_number}
                  onChange={handleChange}
                  min="1"
                />
              </Form.Group>
            </div>
          </div>

          <div className={styles.infoBox}>
            <Info size={18} aria-hidden="true" />
            <p>
              <strong>Note:</strong> The QR code will expire after the specified validity period.
              Your current location will be captured and students must be within the configured radius.
            </p>
          </div>

          <Button
            type="submit"
            className={styles.generateBtn}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Generating...' : <><QrCode size={19} aria-hidden="true" /> Generate QR Code</>}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default QRForm;
