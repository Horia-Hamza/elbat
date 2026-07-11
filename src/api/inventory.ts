import { apiFetch } from './client';

export const inventoryApi = {
  checkStock: (productId: number, variantId?: number) => {
    let url = `/inventory/check/${productId}`;
    if (variantId) url += `?variantId=${variantId}`;
    return apiFetch<boolean>(url);
  },

  getLowStockItems: () => 
    apiFetch<any[]>('/inventory/low-stock')
};
