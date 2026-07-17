// components/qr/QRGenerator.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'next/navigation';
import { CircleDot, MonitorUp, QrCode, ScanLine, Settings2, Timer } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { lectureService } from '@/services/lectureService';
import QRForm from './QRForm';
import QRDisplay from './QRDisplay';
import QRSessionHistory from './QRSessionHistory';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Lecture } from '@/types/index';
import styles from './QRGenerator.module.css';

export interface QRCodeData {
  course_id: number;
  lecture_title: string;
  lecture_date: string;
  lecture_time: string;
  venue: string;
  duration: number;
  allowed_radius: number;
  lecture_number?: number;
  lecture_id?: number;
  lecturer_latitude?: number;
  lecturer_longitude?: number;
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });
  });
}

const QRGenerator: React.FC = () => {
  const { showNotification } = useNotification();
  const searchParams = useSearchParams();
  const selectedCourseId = searchParams.get('course_id') || undefined;
  const [generatedQR, setGeneratedQR] = useState<QRCodeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [qrValue, setQRValue] = useState<string>('');
  const [sessions, setSessions] = useState<Lecture[]>([]);

  const loadSessions = async () => {
    try {
      const response = await lectureService.getQRSessions();
      setSessions(response);
    } catch {
      setSessions([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    lectureService.getQRSessions()
      .then((response) => {
        if (isMounted) {
          setSessions(response);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSessions([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerateQR = async (data: QRCodeData) => {
    setIsGenerating(true);
    try {
      const position = await getCurrentPosition();
      const response = await lectureService.generateQRSession({
        ...data,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

      const generatedData: QRCodeData = {
        ...data,
        lecture_id: response.lecture.lecture_id,
        lecturer_latitude: Number(response.lecture.venue_latitude),
        lecturer_longitude: Number(response.lecture.venue_longitude),
        allowed_radius: response.lecture.allowed_radius ?? data.allowed_radius
      };
      setGeneratedQR(generatedData);
      setQRValue(response.qr_code_data);
      localStorage.setItem('latest_qr_code_data', response.qr_code_data);
      await loadSessions();
      showNotification('QR Code generated successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to generate QR code. Please allow location access and retry.';
      showNotification(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseSession = async () => {
    if (!generatedQR?.lecture_id) {
      return;
    }

    setIsClosing(true);
    try {
      await lectureService.closeQRSession(generatedQR.lecture_id, 'Closed by lecturer');
      await loadSessions();
      showNotification('This attendance session has ended', 'success');
      setGeneratedQR(null);
      setQRValue('');
      localStorage.removeItem('latest_qr_code_data');
    } catch {
      showNotification('Failed to end QR session', 'error');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className={styles.generator}>
      <Container fluid className={styles.container}>
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Generate QR Code</h1>
          <p className={styles.subtitle}>Create QR codes for lecture attendance tracking</p>
        </section>

        <Row className="g-4">
          <Col lg={6}>
            <QRForm
              key={selectedCourseId || 'course-picker'}
              onGenerate={handleGenerateQR}
              isLoading={isGenerating}
              initialCourseId={selectedCourseId}
            />
          </Col>
          <Col lg={6}>
            {isGenerating ? (
              <LoadingSpinner message="Generating QR code..." />
            ) : generatedQR ? (
              <QRDisplay
                data={generatedQR}
                qrValue={qrValue}
                onCloseSession={handleCloseSession}
                isClosing={isClosing}
              />
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderContent}>
                  <div className={styles.icon}><QrCode size={54} aria-hidden="true" /></div>
                  <h3>No QR Code Generated</h3>
                  <p>Fill in the form and click Generate QR Code to create a code</p>
                </div>
              </div>
            )}
          </Col>
        </Row>

        <section className={styles.summarySection}>
          <QRSessionHistory sessions={sessions} compact />
        </section>

        {/* Instructions */}
        <section className={styles.instructionsSection}>
          <h2>How to Use</h2>
          <div className={styles.instructionsList}>
            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}><CircleDot size={18} aria-hidden="true" /></div>
              <div className={styles.stepContent}>
                <h4>Fill Lecture Details</h4>
                <p>Select the course and enter lecture information including title, date, time, and venue.</p>
              </div>
            </div>

            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}><Timer size={18} aria-hidden="true" /></div>
              <div className={styles.stepContent}>
                <h4>Set QR Code Validity</h4>
                <p>Choose how long the QR code will remain valid (recommended: 10-15 minutes).</p>
              </div>
            </div>

            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}><Settings2 size={18} aria-hidden="true" /></div>
              <div className={styles.stepContent}>
                <h4>Generate QR Code</h4>
                <p>Click Generate QR Code to create a unique QR code for this lecture.</p>
              </div>
            </div>

            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}><MonitorUp size={18} aria-hidden="true" /></div>
              <div className={styles.stepContent}>
                <h4>Display to Students</h4>
                <p>Project the QR code on screen or print it. Students can scan to mark attendance.</p>
              </div>
            </div>

            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}><ScanLine size={18} aria-hidden="true" /></div>
              <div className={styles.stepContent}>
                <h4>Monitor Attendance</h4>
                <p>Watch real-time as students scan the code. Attendance records are saved automatically.</p>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default QRGenerator;
