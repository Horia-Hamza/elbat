import React, { useState, useEffect } from 'react';
import { X, Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { Product } from '../data/products';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
    }
  }, [product]);

  if (!product) return null;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    onClose();
  };

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="إغلاق">
          <X size={20} />
        </button>

        <div className="modal-inner-grid">
          {/* لوحة الوسائط والصورة */}
          <div className="modal-media-pane">
            <img
              src={product.image}
              alt={product.title}
              className="modal-large-img"
            />
          </div>

          {/* لوحة التفاصيل */}
          <div className="modal-details-pane">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="product-category" style={{ fontSize: '0.85rem', margin: 0 }}>
                {product.category}
              </span>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                ✈️ مستورد من {product.originCountry}
              </span>
            </div>
            <h2 className="modal-product-title">{product.title}</h2>

            {/* التقييم */}
            <div className="product-rating" style={{ marginBottom: '1.2rem' }}>
              <Star className="star-icon" size={16} />
              <span className="rating-count" style={{ fontSize: '0.85rem' }}>
                {product.rating} ({product.reviewsCount} تقييم من المشترين)
              </span>
            </div>

            {/* السعر */}
            <div className="price-box" style={{ marginBottom: '1.5rem', flexDirection: 'row', alignItems: 'baseline', gap: '0.8rem' }}>
              <span className="price-current" style={{ fontSize: '1.8rem' }}>
                {product.price} ج.م
              </span>
              {product.oldPrice && (
                <span className="price-old" style={{ fontSize: '1.1rem' }}>
                  {product.oldPrice} ج.م
                </span>
              )}
            </div>

            {/* الوصف */}
            <p className="modal-product-desc">{product.description}</p>

            {/* خيار الألوان */}
            {product.colors && product.colors.length > 0 && (
              <div className="options-row">
                <h4 className="options-title">الألوان المتاحة:</h4>
                <div className="color-dots">
                  {product.colors.map((color) => (
                    <div
                      key={color}
                      className={`color-dot ${selectedColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* خيار الأحجام */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="options-row" style={{ marginTop: '0.5rem' }}>
                <h4 className="options-title">المقاس:</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className="btn-secondary"
                      style={{
                        padding: '0.3rem 1rem',
                        fontSize: '0.85rem',
                        borderColor: selectedSize === size ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: selectedSize === size ? 'var(--primary-light)' : 'transparent',
                        color: selectedSize === size ? 'var(--primary-dark)' : 'var(--text-main)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* التحكم في الكمية وإضافة للسلة */}
            <div className="modal-quantity-row">
              <span className="options-title" style={{ marginBottom: 0 }}>الكمية:</span>
              <div className="qty-selector" style={{ transform: 'scale(1.1)' }}>
                <button className="qty-btn" onClick={handleDecrease}>
                  <Minus size={16} />
                </button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={handleIncrease}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="modal-action-row">
              <button 
                className="btn-primary" 
                style={{ flexGrow: 1, padding: '0.9rem' }}
                onClick={handleAdd}
              >
                <ShoppingCart size={20} style={{ marginLeft: '8px' }} />
                إضافة إلى السلة
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
