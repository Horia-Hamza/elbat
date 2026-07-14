import React from 'react';
import { Star, Heart, Plus } from 'lucide-react';
import type { ApiProduct } from '../types/api';
import { IMAGES_BASE_URL } from '../api/client';

interface ProductCardProps {
  product: ApiProduct;
  isFavorite: boolean;
  onToggleFavorite: (id: number, e: React.MouseEvent) => void;
  onAddToCart: (product: ApiProduct, e: React.MouseEvent) => void;
  onProductClick: (product: ApiProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onProductClick
}) => {
  const imageUrl = product.mainImageUrl
    ? (product.mainImageUrl.startsWith('http') ? product.mainImageUrl : `${IMAGES_BASE_URL}${product.mainImageUrl}`)
    : (product.images && product.images.length > 0
        ? (() => {
            const u = product.images[0].imageUrl || product.images[0].url || '';
            return u ? (u.startsWith('http') ? u : `${IMAGES_BASE_URL}${u}`) : '/logo.png';
          })()
        : '/logo.png');

  return (
    <div className="product-card">
      {/* شارة الخصم أو المنتج الجديد أو نفذت الكمية */}
      {product.inStock === false ? (
        <span className="badge-tag out-of-stock" style={{ backgroundColor: '#EF5350', color: '#fff' }}>
          نفذت الكمية
        </span>
      ) : product.isFeatured ? (
        <span className="badge-tag new">
          مميز
        </span>
      ) : null}

      {/* زر التفضيل */}
      <button
        className={`favorite-toggle ${isFavorite ? 'is-fav' : ''}`}
        onClick={(e) => onToggleFavorite(product.id, e)}
        title={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      >
        <Heart size={18} fill={isFavorite ? "#E91E63" : "none"} />
      </button>

      {/* صورة المنتج */}
      <div className="product-img-wrapper" onClick={() => onProductClick(product)}>
        <img
          src={imageUrl}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
      </div>

      {/* تفاصيل المنتج */}
      <div className="product-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span className="product-category">{product.subCategory?.name || 'تصنيف'}</span>
        </div>
        <h3 className="product-card-title" onClick={() => onProductClick(product)}>
          {product.name}
        </h3>

        {/* التقييم */}
        <div className="product-rating">
          <Star className="star-icon" size={14} />
          <span className="rating-count">
            {product.averageRating || 0} ({product.reviewCount || 0} تقييم)
          </span>
        </div>

        {/* السعر وزر الإضافة */}
        <div className="product-footer">
          <div className="price-box">
            {product.salePrice && product.salePrice < product.basePrice ? (
              <>
                <span className="price-old">{product.basePrice} ج.م</span>
                <span className="price-current">{product.salePrice} ج.م</span>
              </>
            ) : (
              <span className="price-current">{product.basePrice} ج.م</span>
            )}
          </div>

          {product.inStock === false ? (
            <button
              className="add-to-cart-btn disabled"
              style={{ backgroundColor: '#bdbdbd', cursor: 'not-allowed' }}
              disabled
              title="نفذت الكمية"
            >
              <Plus size={20} />
            </button>
          ) : (
            <button
              className="add-to-cart-btn"
              onClick={(e) => onAddToCart(product, e)}
              title="أضف إلى السلة"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
