import { apiFetch } from './client';
import type { ApiWishlistItem } from '../types/api';

export const wishlistApi = {
  /**
   * GET /api/Wishlist
   * Fetch wishlist items for logged in user (requires token)
   */
  getWishlist: () => 
    apiFetch<ApiWishlistItem[]>('/Wishlist'),

  /**
   * POST /api/Wishlist
   * Add a product to user's wishlist
   */
  addToWishlist: (data: { productId: number; userId?: string }) => 
    apiFetch<ApiWishlistItem>('/Wishlist', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  /**
   * DELETE /api/Wishlist/item?productId={productId}
   * Remove a product from wishlist by productId
   */
  removeFromWishlistByProductId: (productId: number) => 
    apiFetch<any>(`/Wishlist/item?productId=${productId}`, {
      method: 'DELETE'
    }),

  /**
   * DELETE /api/Wishlist/ClearWishlist
   * Clear all items from user's wishlist
   */
  clearWishlist: () => 
    apiFetch<any>('/Wishlist/ClearWishlist', {
      method: 'DELETE'
    })
};

