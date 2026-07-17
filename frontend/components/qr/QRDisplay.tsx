// components/qr/QRDisplay.tsx

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import QRCode from 'react-qr-code';
import { Download, Printer, Square, XCircle } from 'lucide-react';
import { QRCodeData } from './QRGenerator';
import LiveAttendanceMonitor from './LiveAttendanceMonitor';
import styles from './QRDisplay.module.css';

interface QRDisplayProps {
  data: QRCodeData;
  qrValue: string;
  onCloseSession?: () => void;
  isClosing?: boolean;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ data, qrValue, onCloseSession, isClosing = false }) => {
  const qrRef = useRef<HTMLDivElement>(null);
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
    const svg = qrRef.current?.querySelector('svg');

    if (!svg) {
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const padding = 32;
      const canvas = document.createElement('canvas');
      canvas.width = 280 + padding * 2;
      canvas.height = 280 + padding * 2;

      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, padding, padding, 280, 280);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `qr-code-${data.lecture_date}.png`;
      link.click();
      URL.revokeObjectURL(url);
    };

    image.src = url;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className={styles.card}>
      <Card.Body>
        <h2 className={styles.title}>Generated QR Code</h2>

        {data.lecture_id && (
          <LiveAttendanceMonitor lectureId={data.lecture_id} enabled={!isExpired} />
        )}

        <div className={styles.qrContainer}>
          <div ref={qrRef} className={`${styles.qrPlaceholder} ${isExpired ? styles.expired : ''}`}>
            {!isExpired ? (
              <QRCode
                value={qrValue}
                size={280}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
                className={styles.qrCode}
              />
            ) : (
              <div className={styles.expiredMessage}>
                <div className={styles.expiredIcon}><XCircle size={72} aria-hidden="true" /></div>
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
            <span className={styles.infoLabel}>Allowed Radius:</span>
            <span className={styles.infoValue}>{data.allowed_radius}m</span>
          </div>
          {data.lecturer_latitude && data.lecturer_longitude && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Lecturer Location:</span>
              <span className={styles.infoValue}>
                {data.lecturer_latitude.toFixed(5)}, {data.lecturer_longitude.toFixed(5)}
              </span>
            </div>
          )}
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
            <Download size={17} aria-hidden="true" /> Download QR
          </button>
          <button
            className={`${styles.actionBtn} ${styles.secondary}`}
            onClick={handlePrint}
            disabled={isExpired}
          >
            <Printer size={17} aria-hidden="true" /> Print QR Code
          </button>
          <button
            className={`${styles.actionBtn} ${styles.danger}`}
            onClick={onCloseSession}
            disabled={isExpired || isClosing}
          >
            <Square size={16} aria-hidden="true" /> {isClosing ? 'Ending...' : 'End Session'}
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QRDisplay;
