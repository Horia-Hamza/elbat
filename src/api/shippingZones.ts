import { apiFetch } from './client';

export interface ShippingZone {
  id: number;
  name: string;
  state: string;
  cost: number;
  freeShippingThreshold: number | null;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
}

export interface ShippingZonePayload {
  name: string;
  state: string;
  cost: number;
  freeShippingThreshold: number | null;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
}

export const shippingZonesApi = {
  getAll: () =>
    apiFetch<ShippingZone[]>('/ShippingZones'),

  getActive: () =>
    apiFetch<ShippingZone[]>('/ShippingZones/active'),

  create: (payload: ShippingZonePayload) =>
    apiFetch<ShippingZone>('/ShippingZones', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: ShippingZonePayload) =>
    apiFetch<ShippingZone>(`/ShippingZones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/ShippingZones/${id}`, { method: 'DELETE' }),
};
