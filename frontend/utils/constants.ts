
// utils/constants.ts

export const APP_CONSTANTS = {
  // Application
  APP_NAME: 'QR Attendance System',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'Federal University of Technology, Akure',

  // Roles
  ROLES: {
    STUDENT: 'student',
    LECTURER: 'lecturer',
    ADMIN: 'admin',
  } as const,

  // Attendance Status
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
  } as const,

  // Attendance Grades
  ATTENDANCE_GRADES: {
    EXCELLENT: { min: 90, label: 'Excellent', color: '#27ae60' },
    GOOD: { min: 75, label: 'Good', color: '#3498db' },
    FAIR: { min: 60, label: 'Fair', color: '#f39c12' },
    AT_RISK: { min: 30, label: 'At Risk', color: '#e74c3c' },
  },

  // QR Code
  QR_CODE: {
    DEFAULT_VALIDITY: 10, // minutes
    MAX_VALIDITY: 60, // minutes
    MIN_VALIDITY: 5, // minutes
    ALLOWED_RADIUS: 70, // meters
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },

  // Date Formats
  DATE_FORMATS: {
    SHORT: 'MMM DD, YYYY',
    LONG: 'MMMM DD, YYYY',
    FULL: 'MMMM DD, YYYY HH:mm',
  },

  // API Response Codes
  API_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },

  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
    LANGUAGE: 'language',
  },

  // Colors
  COLORS: {
    PRIMARY: '#667eea',
    SECONDARY: '#764ba2',
    SUCCESS: '#27ae60',
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    INFO: '#3498db',
    LIGHT: '#ecf0f1',
    DARK: '#2c3e50',
  },
};

export type AppRole = typeof APP_CONSTANTS.ROLES[keyof typeof APP_CONSTANTS.ROLES];
export type AttendanceStatus = typeof APP_CONSTANTS.ATTENDANCE_STATUS[keyof typeof APP_CONSTANTS.ATTENDANCE_STATUS];