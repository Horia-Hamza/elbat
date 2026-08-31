import { apiFetch } from './client';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roles?: string | string[];
  createdAt?: string;
  expireOn?: string;
  [key: string]: any;
}

/** Decode JWT base64 payload in browser */
export function decodeJwtPayload(token: string): any {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT payload:', e);
    return null;
  }
}

/**
 * Parses login API response data ({ accessToken, refreshToken })
 * Stores accessToken, refreshToken, and decoded user object into localStorage
 */
export function saveAuthSession(loginResponse: any): { accessToken: string; refreshToken: string; user: UserData | null } {
  const data = loginResponse?.data || loginResponse;
  const accessToken = data?.accessToken || (typeof data === 'string' ? data : '');
  const refreshToken = data?.refreshToken || '';

  if (accessToken) {
    localStorage.setItem('elbat_token', accessToken);
    localStorage.setItem('accessToken', accessToken);
  }

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('elbat_refreshToken', refreshToken);
  }

  const payload = decodeJwtPayload(accessToken);
  let userData: UserData | null = null;

  if (payload) {
    userData = {
      id: payload.id || payload.nameid || payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
      firstName: payload.firstName || payload.given_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || '',
      lastName: payload.lastName || payload.family_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || '',
      email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      phoneNumber: payload.phoneNumber || payload.phone || '',
      roles: payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Customer',
      createdAt: payload.createdAt,
      expireOn: payload.expireOn,
    };

    localStorage.setItem('elbat_user', JSON.stringify(userData));
    localStorage.setItem('user', JSON.stringify(userData));
  }

  return { accessToken, refreshToken, user: userData };
}

/** Get stored logged-in user object from localStorage */
export function getCurrentUser(): UserData | null {
  try {
    const userStr = localStorage.getItem('elbat_user') || localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
  } catch {}

  const token = localStorage.getItem('elbat_token') || localStorage.getItem('accessToken');
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload) {
      return {
        id: payload.id || payload.nameid || payload.sub || '',
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        email: payload.email || '',
        phoneNumber: payload.phoneNumber || '',
        roles: payload.roles || 'Customer',
        createdAt: payload.createdAt,
        expireOn: payload.expireOn,
      };
    }
  }
  return null;
}

/** Clear all stored data from localStorage upon logout or session invalidation */
export function clearAuthSession() {
  localStorage.clear();
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<any>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiFetch<any>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  confirmEmail: (code: string) =>
    apiFetch<any>(`/Auth/confirm-email?code=${encodeURIComponent(code)}`),

  forgotPassword: (email: string) =>
    apiFetch<any>('/Auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: any) =>
    apiFetch<any>('/Auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: any) =>
    apiFetch<any>('/Auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
