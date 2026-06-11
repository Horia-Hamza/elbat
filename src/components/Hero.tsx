import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, Star, ShoppingCart } from 'lucide-react';
import type { Product } from '../data/products';

interface HeroProps {
  onExploreClick: () => void;
  latestProducts: Product[];
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onProductClick: (product: Product) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  latestProducts,
  onAddToCart,
  onProductClick,
}) => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {

    // بطاقات تظهر تدريجياً واحدة تلو الأخرى
    latestProducts.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleCards((prev) => [...prev, idx]);
      }, 200 + idx * 200);
    });
  }, [latestProducts.length]);

  return (
    <div className="hero-wrapper">

      {/* المحتوى التسويقي الأيمن */}
      <div className="hero-content">
        <span className="hero-tagline">
          <Sparkles size={14} style={{ marginLeft: '6px' }} />
          منتجات عالمية بلمسة محلية
        </span>
        <h1 className="hero-title">
          <span>البط</span> بيجيب لك<br />
          كل اللي بتحبه لحد بيتك!
        </h1>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={onExploreClick}>
            تسوق الآن
            <ArrowLeft size={18} />
          </button>
          <button className="btn-secondary" onClick={onExploreClick}>
            اكتشف العروض
          </button>
        </div>
      </div>

      {/* عرض أحدث المنتجات — Spotlight Showcase */}
      <div className="showcase">
        <div className="showcase-label">
          <div className="showcase-label-pulse" />
          <span>وصل حديثاً</span>
        </div>

        <div className="showcase-stack">
          {latestProducts.map((product, idx) => (
            <div
              key={product.id}
              className={`showcase-card ${idx === 0 ? 'showcase-featured' : 'showcase-side'}`}
              style={{
                opacity: visibleCards.includes(idx) ? 1 : 0,
                transform: visibleCards.includes(idx)
                  ? 'translateY(0) scale(1)'
                  : 'translateY(40px) scale(0.9)',
                transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.15}s`,
                zIndex: 10 - idx,
              }}
            >
              {/* Gradient border shimmer */}
              <div className="showcase-card-glow" />

              {/* Image */}
              <div className="showcase-card-visual" onClick={() => onProductClick(product)}>
                <img src={product.image} alt={product.title} />
                <div className="showcase-card-shine" />
                {product.tag && (
                  <span className={`badge-tag ${product.tag.type}`} style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>
                    {product.tag.text}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="showcase-card-details">
                <div className="showcase-card-row">
                  <span className="showcase-card-country">✈️ {product.originCountry}</span>
                  <div className="showcase-card-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        style={{
                          color: i < Math.floor(product.rating) ? '#FFD54F' : '#ddd',
                          fill: i < Math.floor(product.rating) ? '#FFD54F' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="showcase-card-name" onClick={() => onProductClick(product)}>
                  {product.title}
                </h4>

                <div className="showcase-card-action">
                  <div className="showcase-card-pricing">
                    <span className="showcase-card-price">{product.price.toLocaleString()}</span>
                    <span className="showcase-card-currency">ج.م</span>
                  </div>
                  <button
                    className="showcase-add-btn"
                    onClick={(e) => onAddToCart(product, e)}
                    title="أضف للسلة"
                  >
                    <ShoppingCart size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
