'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { GraduationCap, School, ShieldCheck } from 'lucide-react';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      showNotification('Login successful!', 'success');
      const storedUser = localStorage.getItem('auth_user');
      const role = storedUser ? JSON.parse(storedUser).role : 'student';
      router.push(role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/student');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials
  const setDemoStudent = () => {
    setFormData({
      email: 'ajohnson@futa.edu.ng',
      password: 'student123',
    });
  };

  const setDemoLecturer = () => {
    setFormData({
      email: 'sarah.johnson@futa.edu.ng',
      password: 'lecturer123',
    });
  };

  return (
    <div className={styles.loginContainer}>
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col lg={6} className="d-none d-lg-block">
            <section className={styles.storyPanel}>
              <div className={styles.storyBadge}>Federal University of Technology, Akure</div>
              <h1>Fast attendance for busy lecture halls.</h1>
              <p>
                A clean shared workspace for students and lecturers to scan, generate,
                verify, and review attendance without losing class time.
              </p>
              <div className={styles.storyStats}>
                <div>
                  <strong>QR</strong>
                  <span>Session check-in</span>
                </div>
                <div>
                  <strong>Live</strong>
                  <span>Lecturer records</span>
                </div>
                <div>
                  <strong>Both</strong>
                  <span>Student and staff flows</span>
                </div>
              </div>
            </section>
          </Col>
          <Col md={8} lg={5}>
            <Card className={styles.card}>
              <div className={styles.logoSection}>
                <div className={styles.logo}>
                  <ShieldCheck size={34} aria-hidden="true" />
                </div>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to FUTA Attendance</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    disabled={isLoading}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className={styles.loginBtn}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>

              {/* Demo Credentials */}
              <div className={styles.demoSection}>
                <p className={styles.demoTitle}>Demo Credentials:</p>
                <div className={styles.demoButtons}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={setDemoStudent}
                    className={styles.demoBtn}
                  >
                    <GraduationCap size={16} aria-hidden="true" /> Student Demo
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={setDemoLecturer}
                    className={styles.demoBtn}
                  >
                    <School size={16} aria-hidden="true" /> Lecturer Demo
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <p>Don&apos;t have an account? <a href="/register">Sign up here</a></p>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
