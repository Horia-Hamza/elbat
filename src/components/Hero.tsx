import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, Star, ShoppingCart, Clock } from 'lucide-react';
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
  const [bubbles, setBubbles] = useState<
    { id: number; left: string; size: string; delay: string; duration: string }[]
  >([]);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    const newBubbles = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      size: Math.random() * 40 + 15 + 'px',
      delay: Math.random() * 6 + 's',
      duration: Math.random() * 5 + 6 + 's',
    }));
    setBubbles(newBubbles);

    // بطاقات تظهر تدريجياً واحدة تلو الأخرى
    latestProducts.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleCards((prev) => [...prev, idx]);
      }, 200 + idx * 200);
    });
  }, [latestProducts.length]);

  return (
    <div className="hero-wrapper">
      {/* فقاعات الخلفية المائية */}
      <div className="water-bubbles">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDelay: b.delay,
              animationDuration: b.duration,
            }}
          />
        ))}
      </div>

      {/* المحتوى التسويقي الأيمن */}
      <div className="hero-content">
        <span className="hero-tagline">
          <Sparkles size={14} style={{ marginLeft: '6px' }} />
          بوابتك الآمنة للتسوق وشحن المنتجات العالمية مباشرة إلى مصر
        </span>
        <h1 className="hero-title">
          متجر <span>البط العالمي</span>
          <br />
          ماركاتك المفضلة لباب بيتك!
        </h1>
        <p className="hero-desc">
          تسوّق الآن أفضل المنتجات التكنولوجية والأجهزة الأصلية والأزياء من الولايات
          المتحدة، ألمانيا، إنجلترا، واليابان. نحن نتكفل بكافة تفاصيل الشحن الدولي
          والتخليص الجمركي ونوصلها لك مباشرة بأسهل طرق دفع محلية وبدون تعقيدات.
        </p>
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

      {/* لوحة أحدث المنتجات */}
      <div className="hero-latest-pane">
        <div className="hero-latest-header">
          <Clock size={16} />
          <span>أحدث الإضافات</span>
        </div>

        <div className="hero-latest-cards">
          {latestProducts.map((product, idx) => (
            <div
              key={product.id}
              className="hero-mini-card"
              style={{
                opacity: visibleCards.includes(idx) ? 1 : 0,
                transform: visibleCards.includes(idx)
                  ? 'translateX(0) scale(1)'
                  : 'translateX(30px) scale(0.95)',
                transitionDelay: `${idx * 0.08}s`,
              }}
            >
              {/* صورة المنتج */}
              <div
                className="hero-mini-card-img"
                onClick={() => onProductClick(product)}
              >
                <img src={product.image} alt={product.title} />
                {product.tag && (
                  <span className={`badge-tag ${product.tag.type}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                    {product.tag.text}
                  </span>
                )}
              </div>

              {/* تفاصيل المنتج */}
              <div className="hero-mini-card-info">
                <span className="hero-mini-origin">✈️ {product.originCountry}</span>
                <h4
                  className="hero-mini-title"
                  onClick={() => onProductClick(product)}
                >
                  {product.title}
                </h4>

                <div className="hero-mini-footer">
                  <div>
                    <div className="hero-mini-rating">
                      <Star size={11} style={{ color: '#FFD54F', fill: '#FFD54F' }} />
                      <span>{product.rating}</span>
                    </div>
                    <span className="hero-mini-price">{product.price} ج.م</span>
                  </div>
                  <button
                    className="hero-mini-cart-btn"
                    onClick={(e) => onAddToCart(product, e)}
                    title="أضف إلى السلة"
                  >
                    <ShoppingCart size={15} />
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
