import { apiFetch } from './client';
import type { Brand } from '../types/api';

export const brandsApi = {
  getBrands: () => 
    apiFetch<Brand[]>('/Brand'),

  getBrandBySlug: (slug: string) => 
    apiFetch<Brand>(`/brand/slug/${slug}`),

  createBrand: (data: FormData) =>
    apiFetch<Brand>('/Brand', {
      method: 'POST',
      body: data,
    }),

  updateBrand: (id: number, data: Partial<Brand>) =>
    apiFetch<Brand>(`/Brand/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteBrand: (id: number) =>
    apiFetch<boolean>(`/Brand/${id}`, {
      method: 'DELETE',
    })
};
