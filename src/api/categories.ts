import { apiFetch } from './client';
import type { Category, SubCategory } from '../types/api';

export const categoriesApi = {
  getCategories: () =>
    apiFetch<Category[]>('/Category'),

  getAllWithSubcategories: () => 
    apiFetch<Category[]>('/category/with-subcategories'),

  getBySlug: (slug: string) => 
    apiFetch<Category>(`/category/slug/${slug}`),

  createCategory: (data: FormData | Partial<Category>) =>
    apiFetch<Category>('/Category', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  updateCategory: (id: number, data: FormData | Partial<Category>) =>
    apiFetch<Category>(`/Category/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  deleteCategory: (id: number) =>
    apiFetch<boolean>(`/Category/${id}`, {
      method: 'DELETE',
    }),

  getSubcategoriesByCategory: (categoryId: number) =>
    apiFetch<SubCategory[]>(`/subcategory/by-category/${categoryId}`)
};
