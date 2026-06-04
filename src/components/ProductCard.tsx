import React from 'react';
import { Star, Heart, Plus } from 'lucide-react';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onProductClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onProductClick
}) => {
  return (
    <div className="product-card">
      {/* شارة الخصم أو المنتج الجديد */}
      {product.tag && (
        <span className={`badge-tag ${product.tag.type}`}>
          {product.tag.text}
        </span>
      )}

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
          src={product.image}
          alt={product.title}
          className="product-img"
          loading="lazy"
        />
      </div>

      {/* تفاصيل المنتج */}
      <div className="product-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span className="product-category">{product.category}</span>
          <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
            ✈️ مستورد من {product.originCountry}
          </span>
        </div>
        <h3 className="product-card-title" onClick={() => onProductClick(product)}>
          {product.title}
        </h3>

        {/* التقييم */}
        <div className="product-rating">
          <Star className="star-icon" size={14} />
          <span className="rating-count">
            {product.rating} ({product.reviewsCount} تقييم)
          </span>
        </div>

        {/* السعر وزر الإضافة */}
        <div className="product-footer">
          <div className="price-box">
            {product.oldPrice && (
              <span className="price-old">{product.oldPrice} ج.م</span>
            )}
            <span className="price-current">{product.price} ج.م</span>
          </div>

          <button
            className="add-to-cart-btn"
            onClick={(e) => onAddToCart(product, e)}
            title="أضف إلى السلة"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
