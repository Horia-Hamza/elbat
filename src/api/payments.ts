import { apiFetch } from './client';

export interface GuestCheckoutItem {
  productId: number;
  variantId: number | null;
  quantity: number;
}

export interface GuestCheckoutPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  password?: string;
  paymentMethod: number;
  country: string | null;
  state: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  couponId: number | null;
  notes: string | null;
  items: GuestCheckoutItem[];
}

export const paymentsApi = {
  checkoutAsGuest: (payload: GuestCheckoutPayload) =>
    apiFetch<any>('/Payment/CheckoutAsGuest', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  processPayment: (orderId: number, paymentMethod: string) =>
    apiFetch<any>('/payment/process', {
      method: 'POST',
      body: JSON.stringify({ orderId, paymentMethod }),
    }),

  verifyPayment: (transactionId: string) =>
    apiFetch<any>(`/payment/verify/${transactionId}`),

  getPaymentsByStatus: (page: number = 1, pageSize: number = 20) =>
    apiFetch<any>(`/Payment/admin/GetByPaymentStatus?page=${page}&pageSize=${pageSize}`),

  getLatestPaymentByOrderId: (orderId: number) =>
    apiFetch<any>(`/Payment/order/${orderId}/latest`),

  approveManualPayment: (orderId: number) =>
    apiFetch<any>(`/Payment/order/${orderId}/approve-manual-payment`, {
      method: 'POST',
    }),
};
