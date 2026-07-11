import { apiFetch } from './client';

export interface PageDesignCreateDto {
  name: string;
  /** 1 = Category, 2 = Product */
  targetType: number;
  htmlTemplate: string;
  cssStyles?: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface ApiPageDesign {
  id?: number;
  name: string;
  targetType: number;
  htmlTemplate: string;
  cssStyles: string | null;
  isActive: boolean;
  isDefault: boolean;
}

export interface AssignProductDto {
  targetId: number;
  pageDesignId: number;
}

export const pageDesignsApi = {
  /** GET /api/PageDesign — fetch all designs */
  getAll: () =>
    apiFetch<ApiPageDesign[]>('/PageDesign', { method: 'GET' }),

  /** POST /api/PageDesign — create a new page design */
  create: (data: PageDesignCreateDto) =>
    apiFetch<ApiPageDesign>('/PageDesign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** POST /api/PageDesign/assign-product — link a product to a design */
  assignProduct: (data: AssignProductDto) =>
    apiFetch<unknown>('/PageDesign/assign-product', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** POST /api/PageDesign/assign-category — link a category to a design */
  assignCategory: (data: { targetId: number; pageDesignId: number }) =>
    apiFetch<unknown>('/PageDesign/assign-category', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** DELETE /api/PageDesign/soft-delete/{id} — soft delete a page design */
  delete: (id: number) =>
    apiFetch<unknown>(`/PageDesign/soft-delete/${id}`, {
      method: 'DELETE',
    }),

  /** GET /api/PageDesign/product/{productId} — fetch design for a product */
  getProductDesign: (productId: number) =>
    apiFetch<ApiPageDesign>(`/PageDesign/product/${productId}`, {
      method: 'GET',
    }),
};


