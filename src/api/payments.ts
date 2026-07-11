import { apiFetch } from './client';

export interface GuestCheckoutItem {
  productId: number;
  variantId: number | null;
  quantity: number;
}

export interface GuestCheckoutPayload {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  password: string | null;
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
};
