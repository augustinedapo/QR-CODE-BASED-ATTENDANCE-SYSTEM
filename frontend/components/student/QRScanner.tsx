// components/student/QRScanner.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Form, Modal, Button, Alert } from 'react-bootstrap';
import { AxiosError } from 'axios';
import { CheckCircle2, LoaderCircle, MapPin, ScanLine, TriangleAlert } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceAttempt } from '@/types/index';
import styles from './QRScanner.module.css';

interface QRScannerProps {
  onClose: () => void;
}

interface AttendanceErrorResponse {
  error?: string;
  code?: string;
  distance?: number;
  allowed_radius?: number;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
  const { showNotification } = useNotification();
  const [error, setError] = useState<string | null>(() => {
    if (typeof navigator !== 'undefined' && !navigator.geolocation) {
      return 'Geolocation not supported on this device';
    }

    return null;
  });
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [qrCodeData, setQrCodeData] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return localStorage.getItem('latest_qr_code_data') ?? '';
  });
  const [verifying, setVerifying] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [scanHistory, setScanHistory] = useState<AttendanceAttempt[]>([]);

  const loadScanHistory = async () => {
    try {
      const response = await attendanceService.getScanHistory();
      setScanHistory(response);
    } catch {
      setScanHistory([]);
    }
  };

  const refreshLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        setError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Get device location
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        setError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    let isMounted = true;
    attendanceService.getScanHistory()
      .then((response) => {
        if (isMounted) {
          setScanHistory(response);
        }
      })
      .catch(() => {
        if (isMounted) {
          setScanHistory([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScanSuccess = async () => {
    if (!location) {
      setValidationMessage('Location is required. Allow location access and retry.');
      return;
    }

    if (!qrCodeData.trim()) {
      setValidationMessage('QR code data is required. Scan or paste the QR payload and retry.');
      return;
    }

    setVerifying(true);
    setValidationMessage('');
    try {
      const decoded = JSON.parse(atob(qrCodeData.trim()));
      const lectureId = Number(decoded.lecture_id);
      if (!lectureId) {
        throw new Error('Invalid QR payload');
      }

      const response = await attendanceService.markAttendance({
        lecture_id: lectureId,
        qr_code_data: qrCodeData.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      });

      showNotification(response.message || 'Attendance marked successfully!', 'success');
      await loadScanHistory();
      setVerifying(false);
      setTimeout(() => onClose(), 1500);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AttendanceErrorResponse>;
      const apiMessage = axiosError.response?.data?.error;
      const distance = axiosError.response?.data?.distance;
      const allowedRadius = axiosError.response?.data?.allowed_radius;
      const code = axiosError.response?.data?.code;
      const message = code === 'already_marked'
        ? 'You already marked attendance for this lecture.'
        : apiMessage
        ? `${apiMessage}${distance ? ` Distance: ${distance}m / ${allowedRadius}m allowed.` : ''}`
        : error instanceof Error
          ? error.message
          : 'Failed to mark attendance';

      setValidationMessage(message);
      showNotification(message, 'error');
      await loadScanHistory();
      setVerifying(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered className={styles.modal}>
      <Modal.Header closeButton className={styles.header}>
        <Modal.Title>Scan QR Code</Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.body}>
        {error && (
          <Alert variant="danger">
            <TriangleAlert size={18} aria-hidden="true" /> {error}
          </Alert>
        )}

        {verifying && (
          <div className={styles.verifying}>
            <LoaderCircle className={styles.spinner} size={48} aria-hidden="true" />
            <p>Verifying your location and attendance...</p>
          </div>
        )}

        {!verifying && (
          <>
            <div className={styles.scannerPlaceholder}>
              <div className={styles.scannerIcon}><ScanLine size={58} aria-hidden="true" /></div>
              <p>Scan the QR code or paste the QR payload below</p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>QR Code Payload</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={qrCodeData}
                onChange={(event) => {
                  setQrCodeData(event.target.value);
                  setValidationMessage('');
                }}
                placeholder="Paste scanned QR payload here"
              />
            </Form.Group>

            {validationMessage && (
              <Alert variant="warning" className={styles.validationAlert}>
                <TriangleAlert size={18} aria-hidden="true" /> {validationMessage}
              </Alert>
            )}

            {location && (
              <div className={styles.locationInfo}>
                <p>
                  <MapPin size={16} aria-hidden="true" /> <strong>Location:</strong> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
                <p className={styles.locationStatus}><CheckCircle2 size={16} aria-hidden="true" /> Location ready{location.accuracy ? ` (${Math.round(location.accuracy)}m accuracy)` : ''}</p>
              </div>
            )}

            <div className={styles.historyPanel}>
              <h4>Recent Scan History</h4>
              {scanHistory.length === 0 ? (
                <p className={styles.historyEmpty}>No scan attempts yet.</p>
              ) : (
                <div className={styles.historyList}>
                  {scanHistory.slice(0, 5).map((attempt) => (
                    <div key={attempt.attempt_id} className={styles.historyItem}>
                      <span className={`${styles.historyStatus} ${styles[attempt.status]}`}>
                        {attempt.status}
                      </span>
                      <div>
                        <strong>{attempt.message}</strong>
                        <p>{attempt.lecture?.course?.course_code || 'Course'} · {new Date(attempt.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!location && (
              <div className={styles.locationInfo}>
                <p className={styles.locationWarning}>
                  <TriangleAlert size={16} aria-hidden="true" /> Waiting for location verification...
                </p>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
        <Button variant="outline-secondary" onClick={refreshLocation} disabled={verifying}>
          Retry Location
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={verifying}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleScanSuccess}
          disabled={!location || verifying}
        >
          {verifying ? 'Verifying...' : 'Mark Attendance'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QRScanner;
