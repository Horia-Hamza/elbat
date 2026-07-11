import { apiFetch } from './client';
import type { SubCategory } from '../types/api';

export const subCategoriesApi = {
  getSubCategories: () =>
    apiFetch<SubCategory[]>('/SubCategory'),

  createSubCategory: (data: FormData | Partial<SubCategory>) =>
    apiFetch<SubCategory>('/SubCategory', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  updateSubCategory: (id: number, data: FormData | Partial<SubCategory>) =>
    apiFetch<SubCategory>(`/SubCategory/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  deleteSubCategory: (id: number) =>
    apiFetch<boolean>(`/SubCategory/${id}`, {
      method: 'DELETE',
    })
};
