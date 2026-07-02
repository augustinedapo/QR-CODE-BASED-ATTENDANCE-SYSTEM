// components/qr/QRGenerator.tsx

'use client';

import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNotification } from '@/hooks/useNotification';
import QRForm from './QRForm';
import QRDisplay from './QRDisplay';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './QRGenerator.module.css';

export interface QRCodeData {
  course_id: number;
  lecture_title: string;
  lecture_date: string;
  lecture_time: string;
  venue: string;
  duration: number;
  lecture_number?: number;
}

const QRGenerator: React.FC = () => {
  const { showNotification } = useNotification();
  const [generatedQR, setGeneratedQR] = useState<QRCodeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrValue, setQRValue] = useState<string>('');

  const handleGenerateQR = async (data: QRCodeData) => {
    setIsGenerating(true);
    try {
      // In production, send to backend to generate secure QR code
      // const response = await qrService.generateQR(data);
      
      // For now, create mock QR data
      const qrData = JSON.stringify({
        type: 'attendance',
        session_id: 'session_' + Date.now(),
        lecture_id: data.course_id,
        timestamp: new Date().toISOString(),
        data: data
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGeneratedQR(data);
      setQRValue(btoa(qrData)); // Base64 encode for display
      showNotification('QR Code generated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to generate QR code', 'error');
    } finally {
      setIsGenerating(false);
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
            <QRForm onGenerate={handleGenerateQR} isLoading={isGenerating} />
          </Col>
          <Col lg={6}>
            {isGenerating ? (
              <LoadingSpinner message="Generating QR code..." />
            ) : generatedQR ? (
              <QRDisplay data={generatedQR} qrValue={qrValue} />
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderContent}>
                  <div className={styles.icon}>🔲</div>
                  <h3>No QR Code Generated</h3>
                  <p>Fill in the form and click "Generate QR Code" to create a code</p>
                </div>
              </div>
            )}
          </Col>
        </Row>

        {/* Instructions */}
        <section className={styles.instructionsSection}>
          <h2>How to Use</h2>
          <div className={styles.instructionsList}>
            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Fill Lecture Details</h4>
                <p>Select the course and enter lecture information including title, date, time, and venue.</p>
              </div>
            </div>

            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Set QR Code Validity</h4>
                <p>Choose how long the QR code will remain valid (recommended: 10-15 minutes).</p>
              </div>
            </div>

            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Generate QR Code</h4>
                <p>Click the "Generate QR Code" button to create a unique QR code for this lecture.</p>
              </div>
            </div>

            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Display to Students</h4>
                <p>Project the QR code on screen or print it. Students can scan to mark attendance.</p>
              </div>
            </div>

            <div className={styles.instructionStep}>
              <div className={styles.stepNumber}>5</div>
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
