// components/qr/QRDisplay.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import QRCode from 'react-qr-code';
import { QRCodeData } from './QRGenerator';
import styles from './QRDisplay.module.css';

interface QRDisplayProps {
  data: QRCodeData;
  qrValue: string;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ data, qrValue }) => {
  const [timeLeft, setTimeLeft] = useState(data.duration * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qr-code-${data.lecture_date}.png`;
      link.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className={styles.card}>
      <Card.Body>
        <h2 className={styles.title}>Generated QR Code</h2>

        <div className={styles.qrContainer}>
          <div className={`${styles.qrPlaceholder} ${isExpired ? styles.expired : ''}`}>
            {!isExpired ? (
              <QRCode
                value={qrValue}
                size={280}
                level="H"
                className={styles.qrCode}
              />
            ) : (
              <div className={styles.expiredMessage}>
                <div className={styles.expiredIcon}>✗</div>
                <p>QR Code Expired</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.qrInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Course:</span>
            <span className={styles.infoValue}>{data.lecture_title}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Date & Time:</span>
            <span className={styles.infoValue}>
              {data.lecture_date} at {data.lecture_time}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Venue:</span>
            <span className={styles.infoValue}>{data.venue}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Expires In:</span>
            <span className={`${styles.timerDisplay} ${isExpired ? styles.expired : ''}`}>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionBtn} ${styles.primary}`}
            onClick={handleDownload}
            disabled={isExpired}
          >
            📥 Download QR
          </button>
          <button
            className={`${styles.actionBtn} ${styles.secondary}`}
            onClick={handlePrint}
            disabled={isExpired}
          >
            🖨️ Print QR Code
          </button>
          <button
            className={`${styles.actionBtn} ${styles.primary}`}
            disabled={isExpired}
          >
            📺 Display Full Screen
          </button>
          <button
            className={`${styles.actionBtn} ${styles.secondary}`}
            disabled={isExpired}
          >
            📧 Email to Students
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QRDisplay;
