'use client';

import React, { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { IdCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import styles from './RegisterPage.module.css';

type RegisterRole = 'student' | 'lecturer';

const initialFormData = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password2: '',
  department: '',
  student_id: '',
  employee_id: '',
};

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const data = error.response.data as Record<string, string[] | string>;
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) {
      return firstValue[0];
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return error instanceof Error ? error.message : 'Registration failed. Please try again.';
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const [role, setRole] = useState<RegisterRole>('student');
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleRoleChange = (nextRole: RegisterRole) => {
    setRole(nextRole);
    setFormData((current) => ({
      ...current,
      student_id: nextRole === 'student' ? current.student_id : '',
      employee_id: nextRole === 'lecturer' ? current.employee_id : '',
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password !== formData.password2) {
      setError('Passwords must match.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        department: formData.department,
        role,
        student_id: role === 'student' ? formData.student_id : undefined,
        employee_id: role === 'lecturer' ? formData.employee_id : undefined,
      });

      showNotification('Registration successful!', 'success');
      router.push(role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/student');
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      showNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col lg={6} className="d-none d-lg-block">
            <section className={styles.storyPanel}>
              <div className={styles.storyBadge}>Federal University of Technology, Akure</div>
              <h1>Create your attendance workspace.</h1>
              <p>
                Register as a student or lecturer and start using QR attendance,
                reports, and course records immediately.
              </p>
            </section>
          </Col>

          <Col md={9} lg={6}>
            <Card className={styles.card}>
              <div className={styles.logoSection}>
                <div className={styles.logo}>
                  <ShieldCheck size={32} aria-hidden="true" />
                </div>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join FUTA Attendance</p>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              <div className={styles.roleToggle} aria-label="Account type">
                <button
                  type="button"
                  className={`${styles.roleButton} ${role === 'student' ? styles.active : ''}`}
                  onClick={() => handleRoleChange('student')}
                  disabled={isLoading}
                >
                  Student
                </button>
                <button
                  type="button"
                  className={`${styles.roleButton} ${role === 'lecturer' ? styles.active : ''}`}
                  onClick={() => handleRoleChange('lecturer')}
                  disabled={isLoading}
                >
                  Lecturer
                </button>
              </div>

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>{role === 'student' ? 'Matric Number' : 'Employee ID'}</Form.Label>
                      <Form.Control
                        name={role === 'student' ? 'student_id' : 'employee_id'}
                        value={role === 'student' ? formData.student_id : formData.employee_id}
                        onChange={handleChange}
                        placeholder={role === 'student' ? 'e.g., CPE/24/0001' : 'Enter employee ID'}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={6}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        minLength={6}
                        required
                        disabled={isLoading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className={`${styles.submitBtn} mt-4`}
                  disabled={isLoading}
                >
                  <IdCard size={18} aria-hidden="true" />{' '}
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </Form>

              <div className={styles.footer}>
                <p>Already have an account? <a href="/login">Sign in here</a></p>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
