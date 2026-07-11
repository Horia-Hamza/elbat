import { apiFetch } from './client';
import type { ApiWishlistItem } from '../types/api';

export const wishlistApi = {
  getWishlist: () => 
    apiFetch<ApiWishlistItem[]>('/wishlist'),

  addToWishlist: (data: { userId: string; productId: number }) => 
    apiFetch<ApiWishlistItem>('/Wishlist', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getWishlistByUser: (userId: string) => 
    apiFetch<ApiWishlistItem[]>(`/Wishlist/user/${userId}`),

  removeFromWishlist: (id: number) => 
    apiFetch<boolean>(`/wishlist/${id}`, {
      method: 'DELETE'
    })
};
