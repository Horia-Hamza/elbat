import { apiFetch } from './client';
import type { ApiCartItem, CartItemAddUpdateDto } from '../types/api';

export const cartApi = {
  getCart: () => 
    apiFetch<ApiCartItem[]>('/cart'),

  addToCart: (dto: CartItemAddUpdateDto) => 
    apiFetch<ApiCartItem>('/cart', {
      method: 'POST',
      body: JSON.stringify(dto)
    }),

  updateCartItem: (id: number, qty: number) => 
    apiFetch<ApiCartItem>(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: qty })
    }),

  removeFromCart: (id: number) => 
    apiFetch<boolean>(`/cart/${id}`, {
      method: 'DELETE'
    })
};
