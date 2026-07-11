import { apiFetch } from './client';
import type { ApiReview, ReviewAddDto } from '../types/api';

export const reviewsApi = {
  getReviewsByProduct: (productId: number) => 
    apiFetch<ApiReview[]>(`/review/product/${productId}`),

  addReview: (dto: ReviewAddDto) => 
    apiFetch<ApiReview>('/review', {
      method: 'POST',
      body: JSON.stringify(dto)
    }),

  deleteReview: (id: number) => 
    apiFetch<boolean>(`/review/${id}`, {
      method: 'DELETE'
    })
};
