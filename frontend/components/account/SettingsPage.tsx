'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { User } from '@/types/index';
import styles from './AccountPages.module.css';

interface SettingsPageProps {
  user: User;
}

type ProfileFormState = {
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
};

type PasswordFormState = {
  old_password: string;
  new_password: string;
  new_password2: string;
};

const emptyPasswordForm: PasswordFormState = {
  old_password: '',
  new_password: '',
  new_password2: '',
};

function getInitials(user: User) {
  return `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.trim() || 'U';
}

function formatLastLogin(value?: string | null) {
  if (!value) return 'Not recorded yet';

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;

    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data) {
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue)) return String(firstValue[0]);
      if (typeof firstValue === 'string') return firstValue;
    }
  }

  return fallback;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const { updateUser } = useAuth();
  const { showNotification } = useNotification();
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone ?? '',
    department: user.department ?? '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  const avatarSrc = avatarPreview || user.avatar || '';
  const avatarStyle = avatarSrc
    ? ({ '--avatar-image': `url(${avatarSrc})` } as React.CSSProperties)
    : undefined;

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError('');
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append('first_name', profileForm.first_name.trim());
    formData.append('last_name', profileForm.last_name.trim());
    formData.append('phone', profileForm.phone.trim());
    formData.append('department', profileForm.department.trim());
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const updatedUser = await authService.updateProfile(user.user_id, formData);
      updateUser(updatedUser);
      setProfileForm({
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone ?? '',
        department: updatedUser.department ?? '',
      });
      setIsEditingProfile(false);
      setAvatarFile(null);
      showNotification('Profile updated successfully.', 'success');
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to update your profile right now.');
      setProfileError(message);
      showNotification(message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');

    if (passwordForm.new_password !== passwordForm.new_password2) {
      setPasswordError('New passwords must match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(passwordForm);
      setPasswordForm(emptyPasswordForm);
      showNotification('Password changed successfully.', 'success');
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to change your password right now.');
      setPasswordError(message);
      showNotification(message, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <main className={styles.page}>
      <Container fluid className={styles.container}>
        <section className={styles.hero}>
          <div className={`${styles.avatar} ${avatarSrc ? styles.avatarWithImage : ''}`} style={avatarStyle}>
            {!avatarSrc && getInitials(user)}
          </div>
          <div>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>{roleLabel} preferences, profile details, and account security</p>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={`${styles.panel} ${styles.fullSpan}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Profile</h2>
                <p className={styles.settingHelp}>Edit your name, phone number, department, and avatar.</p>
              </div>
              <Button
                type="button"
                className={styles.primaryButton}
                onClick={() => setIsEditingProfile((current) => !current)}
              >
                {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>

            {isEditingProfile ? (
              <Form onSubmit={handleProfileSubmit} className={styles.formStack}>
                {profileError && <div className={styles.errorMessage}>{profileError}</div>}
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className={styles.formLabel}>First Name</Form.Label>
                    <Form.Control
                      name="first_name"
                      value={profileForm.first_name}
                      onChange={handleProfileChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className={styles.formLabel}>Last Name</Form.Label>
                    <Form.Control
                      name="last_name"
                      value={profileForm.last_name}
                      onChange={handleProfileChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className={styles.formLabel}>Phone</Form.Label>
                    <Form.Control name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                  </Col>
                  <Col md={6}>
                    <Form.Label className={styles.formLabel}>Department</Form.Label>
                    <Form.Control
                      name="department"
                      value={profileForm.department}
                      onChange={handleProfileChange}
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label className={styles.formLabel}>Avatar</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} />
                    <p className={styles.settingHelp}>Upload a clear profile image for your account.</p>
                  </Col>
                </Row>
                <div className={styles.formActions}>
                  <Button type="submit" className={styles.primaryButton} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            ) : (
              <div className={styles.profileSummary}>
                <div className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <span className={styles.value}>{user.first_name} {user.last_name}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Phone</span>
                  <span className={styles.value}>{user.phone || 'Not added'}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Department</span>
                  <span className={styles.value}>{user.department || 'Not added'}</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Account Security</h2>
            <div className={styles.securityMeta}>
              <span className={styles.label}>Last Login</span>
              <span className={styles.value}>{formatLastLogin(user.last_login_at)}</span>
            </div>

            <Form onSubmit={handlePasswordSubmit} className={styles.formStack}>
              {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
              <Form.Group>
                <Form.Label className={styles.formLabel}>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className={styles.formLabel}>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className={styles.formLabel}>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="new_password2"
                  value={passwordForm.new_password2}
                  onChange={handlePasswordChange}
                  required
                />
              </Form.Group>
              <div className={styles.formActions}>
                <Button type="submit" className={styles.primaryButton} disabled={isChangingPassword}>
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </Form>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Notifications</h2>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingTitle}>Email Notifications</div>
                <p className={styles.settingHelp}>Receive attendance and account updates by email.</p>
              </div>
              <Form.Check type="switch" defaultChecked />
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingTitle}>Attendance Alerts</div>
                <p className={styles.settingHelp}>Get notified when attendance activity needs attention.</p>
              </div>
              <Form.Check type="switch" defaultChecked />
            </div>
            <div className={styles.settingRow}>
              <div>
                <div className={styles.settingTitle}>Session Reminders</div>
                <p className={styles.settingHelp}>Show a reminder before long sessions expire.</p>
              </div>
              <Form.Check type="switch" defaultChecked />
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
