// components/common/Header.tsx

'use client';

import React from 'react';
import { Container, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { History, Home, LogOut, QrCode, Settings, Table2, UserRound } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const dashboardPath = user?.role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/student';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Navbar expand="lg" sticky="top" className={styles.navbar}>
      <Container>
        <Navbar.Brand className={styles.brand}>
          <div className={styles.logo}>F</div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>FUTA Attendance</div>
            <div className={styles.brandSubtitle}>{title || 'Dashboard'}</div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href={dashboardPath} className={styles.navLink}>
              <Home size={17} aria-hidden="true" /> Dashboard
            </Nav.Link>

            {user?.role === 'lecturer' && (
              <>
                <Nav.Link href="/qr-generator" className={styles.navLink}>
                  <QrCode size={17} aria-hidden="true" /> Generate QR
                </Nav.Link>
                <Nav.Link href="/attendance" className={styles.navLink}>
                  <Table2 size={17} aria-hidden="true" /> Attendance
                </Nav.Link>
                <Nav.Link href="/dashboard/lecturer/qr-sessions" className={styles.navLink}>
                  <History size={17} aria-hidden="true" /> QR Sessions
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
                <Dropdown.Item href={`${dashboardPath}/profile`}>
                  <UserRound size={16} aria-hidden="true" /> Profile
                </Dropdown.Item>
                <Dropdown.Item href={`${dashboardPath}/settings`}>
                  <Settings size={16} aria-hidden="true" /> Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <LogOut size={16} aria-hidden="true" /> Logout
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
