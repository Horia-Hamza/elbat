import { apiFetch } from './client';
import type { ProductVariant, CreateProductVariantDto } from '../types/api';

export const productVariantsApi = {
  /**
   * GET /api/ProductVariant
   * Returns all variants across all products.
   */
  getAll: () =>
    apiFetch<ProductVariant[]>('/ProductVariant'),

  /**
   * GET /api/ProductVariant?productId={id}
   * Returns all variants for a given product.
   */
  getByProduct: async (productId: number) => {
    const res = await apiFetch<any>(`/ProductVariant?productId=${productId}`);
    const list: ProductVariant[] = Array.isArray(res) ? res : (res && res.data ? res.data : []);
    return list.filter((v: ProductVariant) => !v.productId || Number(v.productId) === Number(productId));
  },

  /**
   * GET /api/ProductVariant/{id}
   */
  getById: (id: number) =>
    apiFetch<ProductVariant>(`/ProductVariant/${id}`),

  /**
   * POST /api/ProductVariant
   */
  create: (data: CreateProductVariantDto) =>
    apiFetch<ProductVariant>('/ProductVariant', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * PUT /api/ProductVariant/{id}
   */
  update: (id: number, data: Partial<CreateProductVariantDto>) =>
    apiFetch<ProductVariant>(`/ProductVariant/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * DELETE /api/ProductVariant/{id}
   */
  delete: (id: number) =>
    apiFetch<boolean>(`/ProductVariant/${id}`, {
      method: 'DELETE',
    }),
};
