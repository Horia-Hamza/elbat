import { apiFetch } from './client';
import type { ApiOrder, OrderAddDto } from '../types/api';

export const ordersApi = {
  placeOrder: (dto: OrderAddDto) => 
    apiFetch<ApiOrder>('/order', {
      method: 'POST',
      body: JSON.stringify(dto)
    }),

  getOrderById: (id: number) => 
    apiFetch<ApiOrder>(`/order/${id}`),

  getAllOrders: () =>
    apiFetch<any[]>('/Order'),

  getOrderDetails: (id: number) =>
    apiFetch<any>(`/Order/${id}/details`)
};
