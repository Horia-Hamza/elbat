import React, { useState, useEffect } from 'react';
import { X, Heart, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ApiProduct, ApiWishlistItem } from '../types/api';
import { productsApi } from '../api/products';
import { wishlistApi } from '../api/wishlist';
import { IMAGES_BASE_URL } from '../api/client';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onQuickAddToCart: (product: ApiProduct, e: React.MouseEvent) => void;
  onClearWishlist?: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onToggleFavorite,
  onQuickAddToCart,
  onClearWishlist,
}) => {
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || favorites.length === 0) {
      setFavoriteProducts([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const loadWishlistProducts = async () => {
      const token = localStorage.getItem('elbat_token');
      if (token) {
        try {
          // Call GET /api/Wishlist ONCE to get all items
          const res = await wishlistApi.getWishlist();
          const wishlistArray: ApiWishlistItem[] = Array.isArray(res) ? res : (res as any)?.data || [];
          if (isMounted && Array.isArray(wishlistArray) && wishlistArray.length > 0) {
            const products: ApiProduct[] = wishlistArray.map((item) => {
              if (item.product) return item.product;
              return {
                id: item.productId,
                name: item.productName || 'منتج',
                slug: '',
                description: null,
                shortDescription: null,
                basePrice: item.basePrice || 0,
                salePrice: item.salePrice ?? null,
                sku: null,
                isActive: true,
                isFeatured: false,
                subCategoryId: 0,
                brandId: null,
                mainImageUrl: item.productImageUrl || null,
                inStock: item.inStock ?? true,
              };
            });
            setFavoriteProducts(products);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error fetching wishlist from API:', e);
        }
      }

      // Guest or fallback: fetch individual details
      try {
        const fetchPromises = favorites.map((idStr) => {
          const numId = parseInt(idStr, 10);
          if (isNaN(numId)) return Promise.resolve(null);
          return productsApi.getProductById(numId).catch(() => null);
        });
        const results = await Promise.all(fetchPromises);
        if (isMounted) {
          const validProducts = results.filter((p): p is ApiProduct => p !== null);
          setFavoriteProducts(validProducts);
        }
      } catch (e) {
        console.error('Error loading fallback products:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWishlistProducts();

    return () => {
      isMounted = false;
    };
  }, [isOpen, favorites]);

  const getProductImage = (p: ApiProduct) => {
    if (p.mainImageUrl) {
      return p.mainImageUrl.startsWith('http') ? p.mainImageUrl : `${IMAGES_BASE_URL}${p.mainImageUrl}`;
    }
    if (p.images && p.images.length > 0) {
      const u = p.images[0].imageUrl || p.images[0].url || '';
      return u ? (u.startsWith('http') ? u : `${IMAGES_BASE_URL}${u}`) : '/logo.png';
    }
    return '/logo.png';
  };

  return (
    <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-drawer wishlist-drawer" onClick={(e) => e.stopPropagation()}>
        {/* ── Drawer Header ── */}
        <div className="cart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="cart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={22} fill="#E91E63" color="#E91E63" />
            <span>قائمة المفضلة ({favorites.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {favorites.length > 0 && onClearWishlist && (
              <button
                onClick={onClearWishlist}
                title="مسح الكل"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <Trash2 size={14} />
                <span>مسح الكل</span>
              </button>
            )}
            <button className="close-btn" onClick={onClose} title="إغلاق">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Drawer Body ── */}
        <div className="cart-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                gap: '0.5rem',
                color: 'var(--primary)',
              }}
            >
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>جاري تحميل المنتجات المفضلة...</span>
            </div>
          ) : favorites.length === 0 || favoriteProducts.length === 0 ? (
            <div className="empty-cart-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Heart size={56} style={{ color: '#E91E63', opacity: 0.3, margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>قائمة المفضلة فارغة!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                لم تقومي بإضافة أي منتجات إلى قائمة المفضلة بعد.
              </p>
              <button
                className="btn-secondary"
                onClick={onClose}
                style={{ marginTop: '1.25rem', padding: '0.6rem 1.8rem' }}
              >
                استكشاف المنتجات
              </button>
            </div>
          ) : (
            favoriteProducts.map((product) => {
              const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.basePrice;
              const hasDiscount = product.salePrice && product.salePrice < product.basePrice;

              return (
                <div
                  key={product.id}
                  className="cart-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0.85rem 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {/* Product Image */}
                  <div
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => {
                      onClose();
                      navigate(`/product/${product.id}`);
                    }}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0, direction: 'rtl' }}>
                    <h4
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        margin: '0 0 4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      onClick={() => {
                        onClose();
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      {product.name}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '0.95rem' }}>
                        {price} ج.م
                      </span>
                      {hasDiscount && (
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {product.basePrice} ج.م
                        </span>
                      )}
                    </div>

                    <button
                      className="btn-primary"
                      onClick={(e) => {
                        onQuickAddToCart(product, e);
                      }}
                      style={{
                        padding: '0.35rem 0.85rem',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <ShoppingBag size={14} />
                      إضافة للسلة
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => onToggleFavorite(product.id.toString(), e)}
                    title="حذف من المفضلة"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF5350',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '50%',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
