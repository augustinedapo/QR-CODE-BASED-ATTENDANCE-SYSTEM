'use client';

import React from 'react';
import { Container } from 'react-bootstrap';
import { User } from '@/types/index';
import styles from './AccountPages.module.css';

interface ProfilePageProps {
  user: User;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const displayName = `${user.first_name} ${user.last_name}`;
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const accountIdentifier = user.role === 'student'
    ? {
        label: 'Matric Number',
        value: user.student_id || 'Not set',
      }
    : user.role === 'lecturer'
      ? {
          label: 'Employee ID',
          value: user.employee_id || 'Not set',
        }
      : {
          label: 'User ID',
          value: user.user_id,
        };

  return (
    <main className={styles.page}>
      <Container fluid className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.avatar}>{user.avatar || user.first_name[0]}</div>
          <div>
            <h1 className={styles.title}>{displayName}</h1>
            <p className={styles.subtitle}>{roleLabel} profile and account details</p>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Personal Information</h2>
            <div className={styles.field}>
              <span className={styles.label}>First Name</span>
              <span className={styles.value}>{user.first_name}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Last Name</span>
              <span className={styles.value}>{user.last_name}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{user.email}</span>
            </div>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Account Information</h2>
            <div className={styles.field}>
              <span className={styles.label}>{accountIdentifier.label}</span>
              <span className={styles.value}>{accountIdentifier.value}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Role</span>
              <span className={styles.value}>{roleLabel}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Status</span>
              <span className={styles.value}>Active</span>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
