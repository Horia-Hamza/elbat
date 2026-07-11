import { apiFetch } from './client';
import type { ApiShippingAddress, ShippingAddressDto } from '../types/api';

export const shippingAddressApi = {
  getUserAddresses: (userId: string) => 
    apiFetch<ApiShippingAddress[]>(`/shippingaddress/user/${userId}`),

  addAddress: (dto: ShippingAddressDto) => 
    apiFetch<ApiShippingAddress>('/shippingaddress', {
      method: 'POST',
      body: JSON.stringify(dto)
    }),

  updateAddress: (id: number, dto: ShippingAddressDto) => 
    apiFetch<ApiShippingAddress>(`/shippingaddress/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    }),

  deleteAddress: (id: number) => 
    apiFetch<boolean>(`/shippingaddress/${id}`, {
      method: 'DELETE'
    }),

  getAllAddresses: () =>
    apiFetch<ApiShippingAddress[]>('/ShippingAddress')
};
