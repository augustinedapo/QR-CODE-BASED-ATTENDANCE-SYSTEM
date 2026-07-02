// components/common/Header.tsx

'use client';

import React from 'react';
import { Container, Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Navbar bg="white" expand="lg" sticky="top" className={styles.navbar}>
      <Container>
        <Navbar.Brand className={styles.brand}>
          <div className={styles.logo}>QR</div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>QR Attendance System</div>
            <div className={styles.brandSubtitle}>{title || 'Dashboard'}</div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href={user?.role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/student'}>
              <i className="bi bi-house-door"></i> Dashboard
            </Nav.Link>

            {user?.role === 'lecturer' && (
              <>
                <Nav.Link href="/qr-generator">
                  <i className="bi bi-qr-code"></i> Generate QR
                </Nav.Link>
                <Nav.Link href="/attendance">
                  <i className="bi bi-table"></i> Attendance
                </Nav.Link>
              </>
            )}

            <Dropdown className={styles.userDropdown}>
              <Dropdown.Toggle variant="link" className={styles.userToggle}>
                <div className={styles.userAvatar}>{user?.first_name[0]}</div>
                <span className={styles.userName}>
                  {user?.first_name} {user?.last_name}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item href="/profile">
                  <i className="bi bi-person"></i> Profile
                </Dropdown.Item>
                <Dropdown.Item href="/settings">
                  <i className="bi bi-gear"></i> Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
