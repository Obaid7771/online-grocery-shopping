// src/lib/auth.ts
import Cookies from 'js-cookie';
import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER';
  avatarUrl?: string;
}

export async function adminLogin(email: string, password: string): Promise<{ user: AdminUser; token: string }> {
  const { data } = await api.post('/auth/login', { email, password });
  const { user, accessToken } = data;

  if (!['ADMIN', 'MANAGER'].includes(user?.role)) {
    throw new Error('Access denied: admin or manager role required');
  }

  Cookies.set('admin_token', accessToken, { expires: 1, sameSite: 'lax', path: '/' });
  Cookies.set('admin_user', JSON.stringify(user), { expires: 1, sameSite: 'lax', path: '/' });

  return { user: user as AdminUser, token: accessToken };
}

export function adminLogout(): void {
  Cookies.remove('admin_token', { path: '/' });
  Cookies.remove('admin_user', { path: '/' });
}

export function getAdminUser(): AdminUser | null {
  try {
    const raw = Cookies.get('admin_user');
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return !!Cookies.get('admin_token');
}
