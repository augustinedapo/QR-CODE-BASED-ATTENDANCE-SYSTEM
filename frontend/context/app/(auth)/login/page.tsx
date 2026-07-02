import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
}


// app/(auth)/login/page.tsx

'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
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
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials
  const setDemoStudent = () => {
    setFormData({
      email: 'john.doe@university.edu',
      password: 'password123',
    });
  };

  const setDemoLecturer = () => {
    setFormData({
      email: 'dr.sarah@university.edu',
      password: 'password123',
    });
  };

  return (
    <div className={styles.loginContainer}>
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className={styles.card}>
              {/* Logo */}
              <div className={styles.logoSection}>
                <div className={styles.logo}>QR</div>
                <h1 className={styles.title}>QR Attendance System</h1>
                <p className={styles.subtitle}>Sign in to your account</p>
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
                    👨‍🎓 Student Demo
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={setDemoLecturer}
                    className={styles.demoBtn}
                  >
                    👨‍🏫 Lecturer Demo
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <p>Don't have an account? <a href="/register">Sign up here</a></p>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;