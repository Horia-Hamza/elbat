// ============================================================
// Backend API — TypeScript types aligned to actual Swagger schema
// ============================================================

/** Standard response envelope from every endpoint */
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

// ── Category ─────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  subCategories?: SubCategory[];
}

// ── SubCategory ───────────────────────────────────────────────
export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  categoryId: number;
}

// ── Brand ─────────────────────────────────────────────────────
export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  isActive: boolean;
}

// ── Product ───────────────────────────────────────────────────
export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  basePrice: number;
  salePrice: number | null;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  subCategoryId: number;
  subCategory?: SubCategory;
  brandId: number | null;
  brand?: Brand;
  /** Average star rating (0–5) */
  averageRating?: number;
  reviewCount?: number;
  /** Images array from product details endpoint */
  images?: ProductImage[];
  /** Variants from product details endpoint */
  variants?: ProductVariant[];
  mainImageUrl?: string | null;
  brandName?: string | null;
  subCategoryName?: string | null;
  inStock?: boolean;
  totalSold?: number;
  createdAt?: string;
  /** ID of the custom page design assigned to this product */
  pageDesignId?: number | null;
  /** Rendered HTML template for the custom page design (if assigned) */
  pageDesign?: string | null;
  /** Videos uploaded for this product */
  videos?: ProductVideo[];
}

export interface ProductImage {
  id: number;
  productId?: number;
  variantId?: number | null;
  url?: string;
  imageUrl?: string;
  altText: string | null;
  displayOrder: number;
  isMain: boolean;
}

export interface ProductVideo {
  id: number;
  productId: number;
  variantId: number | null;
  videoUrl: string;
  altText: string | null;
  isMain: boolean;
  displayOrder: number;
}


// ── VariantType enum ──────────────────────────────────────────
export type VariantType = 1 | 2 | 3 | 4 | 5;
export const VARIANT_TYPE_LABELS: Record<VariantType, string> = {
  1: 'لون (Color)',
  2: 'مقاس (Size)',
  3: 'خامة (Material)',
  4: 'ستايل (Style)',
  5: 'مخصص (Custom)',
};

// ── ProductVariant ─────────────────────────────────────────────
export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  color?: string;
  size?: string;
  sku: string | null;
  priceAdjustment: number;
  type: VariantType;
  isActive: boolean;
  productId: number;
  inventory: VariantInventory | null;
  images: ProductImage[];
}

export interface VariantInventory {
  id: number;
  productId: number;
  variantId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  allowBackorder: boolean;
}

export interface ApiInventory {
  id: number;
  productId: number;
  variantId?: number | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  allowBackorder: boolean;
}

export interface CreateProductVariantDto {
  name: string;
  value: string;
  sku?: string;
  priceAdjustment: number;
  isActive: boolean;
  productId: number;
  type: VariantType;
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
}

// ── Pagination ────────────────────────────────────────────────
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilterParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string | null;
  sortBy?: string | null;
  sortDescending?: boolean;
  categoryId?: number | null;
  subCategoryId?: number | null;
  brandId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isActive?: boolean | null;
  isFeatured?: boolean | null;
  inStock?: boolean | null;
}

// ── Cart ──────────────────────────────────────────────────────
export interface ApiCartItem {
  id: number;
  userId: string;
  productId: number;
  variantId: number | null;
  quantity: number;
  productName?: string;
  productImageUrl?: string;
  unitPrice?: number;
  totalPrice?: number;
  variantName?: string;
  inStock?: boolean;
  product?: ApiProduct;
  variant?: ProductVariant;
}

export interface CartItemAddUpdateDto {
  userId: string;
  productId: number;
  variantId?: number | null;
  quantity: number;
}

// ── Wishlist ──────────────────────────────────────────────────
export interface ApiWishlistItem {
  id: number;
  userId: string;
  productId: number;
  productName?: string;
  productImageUrl?: string;
  basePrice?: number;
  salePrice?: number | null;
  inStock?: boolean;
  addedAt?: string;
  product?: ApiProduct;
}

// ── Order ─────────────────────────────────────────────────────
export interface OrderItemAddDto {
  productId: number;
  variantId?: number | null;
  quantity: number;
}

export interface OrderAddDto {
  userId: string;
  shippingAddressId: number;
  couponId?: number | null;
  notes?: string | null;
  items: OrderItemAddDto[];
}

export interface ApiOrder {
  id: number;
  orderNumber: string;
  userId: string;
  status: number;
  paymentStatus: number;
  totalAmount: number;
  createdAt: string;
}

// ── ShippingAddress ───────────────────────────────────────────
export interface ShippingAddressDto {
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  isDefault: boolean;
}

export interface ApiShippingAddress extends ShippingAddressDto {
  id: number;
}

// ── Review ────────────────────────────────────────────────────
export interface ReviewAddDto {
  userId: string;
  productId: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
}

export interface ApiReview {
  id: number;
  userId: string;
  productId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
}

// ── Coupon ────────────────────────────────────────────────────
export interface ApiCoupon {
  id: number;
  code: string;
  description: string | null;
  discountType: number; // 1=Percentage, 2=FixedAmount
  discountValue: number;
  minimumOrderAmount: number | null;
  maximumDiscountAmount: number | null;
  isActive: boolean;
  expiryDate: string;
}
