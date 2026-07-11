import { apiFetch } from './client';
import type { ApiCoupon } from '../types/api';

export const couponsApi = {
  validateCoupon: (code: string) => 
    apiFetch<ApiCoupon>(`/coupon/validate/${code}`),

  getAllCoupons: () => 
    apiFetch<ApiCoupon[]>('/coupon')
};
