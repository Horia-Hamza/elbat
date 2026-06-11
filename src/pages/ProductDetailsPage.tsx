import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Plus, Minus, ShoppingCart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../data/products';
import { PRODUCTS } from '../data/products';

interface ProductDetailsPageProps {
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const product = PRODUCTS.find((p) => p.id === id) || null;

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Swipe logic
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product ? [product.image] : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
    if (product) {
      setQuantity(1);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pdp-not-found">
        <h2>عذراً، المنتج غير موجود!</h2>
        <p>ربما تم حذفه أو الرابط غير صحيح.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
  };

  const goToPrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      // RTL: swipe directions are reversed
      if (diff > 0) {
        goToPrevImage(); // swipe left in RTL = go prev
      } else {
        goToNextImage(); // swipe right in RTL = go next
      }
    }
  };

  return (
    <div className="pdp-container">
      <button onClick={() => navigate(-1)} className="pdp-back-btn">
        <ArrowRight size={20} />
        العودة للخلف
      </button>

      <div className="pdp-grid">
        
        {/* لوحة الوسائط والصور */}
        <div className="pdp-media-section">
          <div 
            className="pdp-gallery"
            ref={galleryRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Navigation arrows */}
            {productImages.length > 1 && (
              <>
                <button className="pdp-gallery-arrow pdp-gallery-arrow-right" onClick={goToPrevImage}>
                  <ChevronRight size={22} />
                </button>
                <button className="pdp-gallery-arrow pdp-gallery-arrow-left" onClick={goToNextImage}>
                  <ChevronLeft size={22} />
                </button>
              </>
            )}

            <div 
              className="pdp-gallery-track"
              style={{ transform: `translateX(${activeImageIndex * 100}%)` }}
            >
              {productImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.title} - صورة ${index + 1}`}
                  className="pdp-gallery-image"
                />
              ))}
            </div>
          </div>

          {/* Thumbnail dots */}
          {productImages.length > 1 && (
            <div className="pdp-gallery-dots">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  className={`pdp-gallery-dot ${activeImageIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          )}

          {/* Thumbnail images */}
          {productImages.length > 1 && (
            <div className="pdp-thumbnails">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  className={`pdp-thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={img} alt={`معاينة ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* لوحة التفاصيل */}
        <div className="pdp-info">
          <div className="pdp-badges">
            <span className="pdp-badge-category">
              {product.category}
            </span>
            <span className="pdp-badge-origin">
              ✈️ مستورد من {product.originCountry}
            </span>
          </div>
          
          <h1 className="pdp-title">{product.title}</h1>

          {/* التقييم */}
          <div className="pdp-rating">
            <Star style={{ color: '#FFD54F', fill: '#FFD54F' }} size={20} />
            <span className="pdp-rating-text">
              {product.rating} 
              <span className="pdp-rating-count">
                ({product.reviewsCount} تقييم من المشترين)
              </span>
            </span>
          </div>

          {/* السعر */}
          <div className="pdp-price-row">
            <span className="pdp-price">{product.price} ج.م</span>
            {product.oldPrice && (
              <span className="pdp-old-price">{product.oldPrice} ج.م</span>
            )}
          </div>

          {/* الوصف */}
          <p className="pdp-description">{product.description}</p>

          {/* خيار الألوان */}
          {product.colors && product.colors.length > 0 && (
            <div className="pdp-option-group">
              <h4 className="pdp-option-label">الألوان المتاحة:</h4>
              <div className="pdp-color-dots">
                {product.colors.map((color) => (
                  <div
                    key={color}
                    className={`pdp-color-dot ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* خيار الأحجام */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="pdp-option-group">
              <h4 className="pdp-option-label">المقاس:</h4>
              <div className="pdp-sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`pdp-size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* التحكم في الكمية وإضافة للسلة */}
          <div className="pdp-actions">
            <div className="pdp-qty-selector">
              <button onClick={handleDecrease} className="pdp-qty-btn">
                <Minus size={18} />
              </button>
              <span className="pdp-qty-val">{quantity}</span>
              <button onClick={handleIncrease} className="pdp-qty-btn">
                <Plus size={18} />
              </button>
            </div>

            <button className="btn-primary pdp-add-btn" onClick={handleAdd}>
              <ShoppingCart size={22} />
              إضافة إلى السلة
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
