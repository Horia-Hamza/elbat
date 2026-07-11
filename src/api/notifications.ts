import { apiFetch } from './client';

export const notificationsApi = {
  getUserNotifications: (userId: string) => 
    apiFetch<any[]>(`/notification/user/${userId}`),

  markAsRead: (id: number) => 
    apiFetch<boolean>(`/notification/${id}/read`, {
      method: 'PUT'
    })
};
