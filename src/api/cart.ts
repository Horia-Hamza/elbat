import { apiFetch } from './client';
import type { ApiCartItem } from '../types/api';

export interface CartItemAddUpdateDto {
  userId?: string | null;
  productId: number;
  variantId?: number | null;
  quantity: number;
}

export const cartApi = {
  /**
   * GET /api/Cart
   * Fetch current user's cart items (requires token)
   */
  getCart: () => 
    apiFetch<ApiCartItem[]>('/Cart'),

  /**
   * POST /api/Cart
   * Add or update an item in cart
   * Payload: { userId, productId, variantId, quantity }
   */
  addToCart: (dto: CartItemAddUpdateDto) => 
    apiFetch<ApiCartItem>('/Cart', {
      method: 'POST',
      body: JSON.stringify({
        userId: dto.userId || null,
        productId: dto.productId,
        variantId: dto.variantId || 0,
        quantity: dto.quantity,
      }),
    }),

  /**
   * DELETE /api/Cart/item?productId={productId}&varientId={variantId}
   * Delete single cart item by productId and optional variantId
   */
  removeFromCart: (productId: number, variantId?: number | null) => {
    const vId = variantId || 0;
    return apiFetch<any>(`/Cart/item?productId=${productId}&varientId=${vId}`, {
      method: 'DELETE',
    });
  },

  /**
   * POST /api/Cart/ClearCart
   * Clear all items from current user's cart
   */
  clearCart: () => 
    apiFetch<any>('/Cart/ClearCart', {
      method: 'POST',
    }),
};

