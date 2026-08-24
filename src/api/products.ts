import { apiFetch } from './client';
import type { ApiProduct, PagedResult, ProductFilterParams, ProductImage } from '../types/api';

export const productsApi = {
  getProducts: (params: ProductFilterParams) => {
    const query = new URLSearchParams();
    
    query.append('pageNumber', params.pageNumber.toString());
    query.append('pageSize', params.pageSize.toString());
    
    if (params.searchTerm) query.append('searchTerm', params.searchTerm);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortDescending !== undefined) query.append('sortDescending', params.sortDescending.toString());
    if (params.categoryId) query.append('categoryId', params.categoryId.toString());
    if (params.subCategoryId) query.append('subCategoryId', params.subCategoryId.toString());
    if (params.brandId) query.append('brandId', params.brandId.toString());
    if (params.minPrice) query.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) query.append('maxPrice', params.maxPrice.toString());
    if (params.isActive !== undefined && params.isActive !== null) query.append('isActive', params.isActive.toString());
    if (params.isFeatured !== undefined && params.isFeatured !== null) query.append('isFeatured', params.isFeatured.toString());
    if (params.inStock !== undefined && params.inStock !== null) query.append('inStock', params.inStock.toString());

    return apiFetch<PagedResult<ApiProduct>>(`/Product?${query.toString()}`);
  },

  getProductById: (id: number) => 
    apiFetch<ApiProduct>(`/Product/${id}`),

  createProduct: (data: {
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    salePrice: number;
    sku: string;
    barcode: string;
    weight: number;
    dimensions: string;
    isActive: boolean;
    isFeatured: boolean;
    subCategoryId: number;
    brandId: number;
    metaTitle: string;
    metaDescription: string;
  }) => {
    const clean = {
      ...data,
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      slug: data.slug || '',
      sku: data.sku || '',
      barcode: data.barcode || '',
      dimensions: data.dimensions || '',
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
    };
    return apiFetch<ApiProduct>('/Product', {
      method: 'POST',
      body: JSON.stringify({ dto: clean, ...clean }),
    });
  },

  updateProduct: (id: number, data: {
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    salePrice: number;
    sku: string;
    barcode: string;
    weight: number;
    dimensions: string;
    isActive: boolean;
    isFeatured: boolean;
    subCategoryId: number;
    brandId: number;
    metaTitle: string;
    metaDescription: string;
  }) => {
    const clean = {
      ...data,
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      slug: data.slug || '',
      sku: data.sku || '',
      barcode: data.barcode || '',
      dimensions: data.dimensions || '',
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
    };
    return apiFetch<ApiProduct>(`/Product/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ dto: clean, ...clean }),
    });
  },

  deleteProduct: (id: number) =>
    apiFetch<boolean>(`/Product/${id}`, {
      method: 'DELETE',
    }),

  getRelatedProducts: (id: number, count: number = 5) =>
    apiFetch<ApiProduct[]>(`/Product/${id}/related?count=${count}`),
};

export const productImagesApi = {
  /**
   * Upload an image for a product.
   * Sends multipart/form-data with ProductId, VariantId?, File, AltText, IsMain, DisplayOrder
   */
  uploadImage: (data: {
    productId: number;
    variantId?: number;
    file: File;
    altText?: string;
    isMain?: boolean;
    displayOrder?: number;
  }) => {
    const fd = new FormData();
    fd.append('ProductId', data.productId.toString());
    if (data.variantId) fd.append('VariantId', data.variantId.toString());
    fd.append('File', data.file);
    fd.append('AltText', data.altText || '');
    fd.append('IsMain', (data.isMain ?? true).toString());
    fd.append('DisplayOrder', (data.displayOrder ?? 0).toString());
    return apiFetch<ProductImage>('/ProductImage', {
      method: 'POST',
      body: fd,
    });
  },

  /**
   * Set a specific image as the main image for a product.
   * PUT /api/ProductImage/product/{productId}/set-main/{imageId}
   */
  setMainImage: (productId: number, imageId: number) =>
    apiFetch<boolean>(`/ProductImage/product/${productId}/set-main/${imageId}`, {
      method: 'POST',
    }),

  /**
   * Delete a product image by ID
   */
  deleteImage: (imageId: number) =>
    apiFetch<boolean>(`/ProductImage/${imageId}`, {
      method: 'DELETE',
    }),

  /**
   * Get all images for a product
   * GET /api/ProductImage/product/{productId}
   */
  getImagesByProductId: (productId: number) =>
    apiFetch<ProductImage[]>(`/ProductImage/product/${productId}`),
};

/** Response shape for a single product video */
export interface ApiProductVideo {
  id: number;
  productId: number;
  variantId: number | null;
  videoUrl: string;
  altText: string | null;
  isMain: boolean;
  displayOrder: number;
}

export const productVideosApi = {
  /**
   * Upload a video for a product.
   * POST /api/ProductVideo — multipart/form-data
   */
  uploadVideo: (data: {
    productId: number;
    variantId?: number;
    file: File;
    altText?: string;
    displayOrder?: number;
  }) => {
    const fd = new FormData();
    fd.append('ProductId', data.productId.toString());
    if (data.variantId != null) fd.append('VariantId', data.variantId.toString());
    fd.append('File', data.file);
    fd.append('AltText', data.altText || '');
    fd.append('DisplayOrder', (data.displayOrder ?? 0).toString());
    return apiFetch<ApiProductVideo>('/ProductVideo', {
      method: 'POST',
      body: fd,
    });
  },

  /**
   * Delete a product video by ID
   */
  deleteVideo: (videoId: number) =>
    apiFetch<boolean>(`/ProductVideo/${videoId}`, {
      method: 'DELETE',
    })
};

/** Inventory record returned from the API */
export interface ApiInventory {
  id: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  allowBackorder: boolean;
  trackInventory?: boolean;
}

export interface InventoryCreateDto {
  productId: number;
  variantId?: number | null;
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
}

export const inventoryApi = {
  /**
   * Add or update inventory for a product.
   * POST /api/Inventory
   */
  create: (data: InventoryCreateDto) =>
    apiFetch<ApiInventory>('/Inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Delete an inventory record by ID.
   * DELETE /api/Inventory/{id}
   */
  deleteInventory: (id: number) =>
    apiFetch<boolean>(`/Inventory/${id}`, {
      method: 'DELETE',
    }),
};


