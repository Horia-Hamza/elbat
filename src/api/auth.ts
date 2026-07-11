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
