export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'lecturer' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
