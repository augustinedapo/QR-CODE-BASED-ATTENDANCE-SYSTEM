// components/student/QRScanner.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { useNotification } from '@/hooks/useNotification';
import styles from './QRScanner.module.css';

interface QRScannerProps {
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose }) => {
  const { showNotification } = useNotification();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Get device location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        setError(`Location error: ${error.message}`);
      }
    );
  }, []);

  const handleScanSuccess = async () => {
    setVerifying(true);
    try {
      // Simulate QR code scan and location verification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showNotification('Attendance marked successfully!', 'success');
      setVerifying(false);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      showNotification('Failed to mark attendance', 'error');
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
            <i className="bi bi-exclamation-circle"></i> {error}
          </Alert>
        )}

        {verifying && (
          <div className={styles.verifying}>
            <div className={styles.spinner}></div>
            <p>Verifying your location and attendance...</p>
          </div>
        )}

        {!verifying && (
          <>
            <div className={styles.scannerPlaceholder}>
              <div className={styles.scannerIcon}>📷</div>
              <p>Position QR code within frame</p>
            </div>

            {location && (
              <div className={styles.locationInfo}>
                <p>
                  <strong>Location:</strong> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
                <p className={styles.locationStatus}>✓ Location verified</p>
              </div>
            )}

            {!location && (
              <div className={styles.locationInfo}>
                <p className={styles.locationWarning}>
                  ⚠️ Waiting for location verification...
                </p>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
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
