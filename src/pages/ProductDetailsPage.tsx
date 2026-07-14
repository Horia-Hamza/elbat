import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Plus, Minus, ShoppingCart, ArrowRight, ChevronLeft, ChevronRight, Loader2, Heart } from 'lucide-react';
import type { ApiProduct } from '../types/api';
import { productsApi } from '../api/products';
import { IMAGES_BASE_URL } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { trackViewContent } from '../utils/tracking';

interface ProductDetailsPageProps {
  onAddToCart: (product: ApiProduct, quantity: number, color?: string, size?: string) => void;
  onQuickAddToCart: (product: ApiProduct, e: React.MouseEvent) => void;
  onBuyNow: (product: ApiProduct, quantity: number, color?: string, size?: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  onAddToCart,
  onQuickAddToCart,
  onBuyNow,
  favorites,
  onToggleFavorite
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [iframeHeight, setIframeHeight] = useState<string>('100vh');

  // Swipe logic
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const relatedScrollRef = useRef<HTMLDivElement>(null);

  const scrollRelated = (direction: 'left' | 'right') => {
    if (relatedScrollRef.current) {
      const scrollAmount = 300;
      relatedScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const productImages = product?.images && product.images.length > 0
    ? product.images.map(img => {
      const u = img.imageUrl || img.url || '';
      return u.startsWith('http') ? u : `${IMAGES_BASE_URL}${u}`;
    })
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);

    if (id) {
      setLoading(true);
      productsApi.getProductById(Number(id))
        .then((data) => {
          setProduct(data);
          trackViewContent({
            id: data.id,
            name: data.name,
            price: data.salePrice !== null && data.salePrice !== undefined ? data.salePrice : data.basePrice
          });
          setQuantity(1);
          const firstColor = data.variants?.find(v => v.color)?.color || '';
          const firstSize = data.variants?.find(v => v.size)?.size || '';
          setSelectedColor(firstColor);
          setSelectedSize(firstSize);
          setError(null);
        })
        .catch((err) => {
          setError(err.message || 'Error fetching product');
        })
        .finally(() => setLoading(false));

      productsApi.getRelatedProducts(Number(id), 5)
        .then((data) => {
          setRelatedProducts(data);
        })
        .catch((err) => {
          console.error('Error fetching related products:', err);
        });
    }
  }, [id]);

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ADD_TO_CART') {
        const qty = event.data.quantity || 1;
        if (product) {
          onAddToCart(product, qty, selectedColor, selectedSize);
        }
      }
      if (event.data && event.data.type === 'BUY_NOW') {
        const qty = event.data.quantity || 1;
        if (product) {
          onBuyNow(product, qty, selectedColor, selectedSize);
        }
      }
      if (event.data && event.data.type === 'ADD_TO_WISHLIST') {
        if (product) {
          const mockEvent = {
            stopPropagation: () => { },
            preventDefault: () => { }
          } as unknown as React.MouseEvent;
          onToggleFavorite(String(product.id), mockEvent);
        }
      }
      if (event.data && event.data.type === 'RESIZE') {
        setIframeHeight(`${event.data.height}px`);
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [product, selectedColor, selectedSize, onAddToCart, onToggleFavorite]);

  if (loading) {
    return (
      <div className="pdp-not-found" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="spinner" size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ marginTop: '1rem', color: 'var(--primary-dark)' }}>جاري تحميل المنتج...</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pdp-not-found">
        <h2>عذراً، المنتج غير موجود!</h2>
        <p>{error || 'ربما تم حذفه أو الرابط غير صحيح.'}</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // If the product has a custom HTML template embedded in the response, resolve placeholders
  let customHtml = '';
  if (product.pageDesign) {
    const mainImgUrl = product.mainImageUrl
      ? (product.mainImageUrl.startsWith('http') ? product.mainImageUrl : `${IMAGES_BASE_URL}${product.mainImageUrl}`)
      : '/logo.png';

    const brand = product.brandName || product.brand?.name || '—';
    const subCat = product.subCategoryName || product.subCategory?.name || '—';
    const desc = product.description || product.shortDescription || '';
    const salePriceVal = product.salePrice !== null && product.salePrice !== undefined ? product.salePrice : product.basePrice;

    // Replace placeholders in the template
    const replaceAll = (t: string, p: string, v: string) => t.split(p).join(v);
    customHtml = product.pageDesign;

    customHtml = replaceAll(customHtml, '{{name}}', product.name || '');
    customHtml = replaceAll(customHtml, '{{mainImageUrl}}', mainImgUrl);
    customHtml = replaceAll(customHtml, '{{brandName}}', brand);
    customHtml = replaceAll(customHtml, '{{subCategoryName}}', subCat);
    customHtml = replaceAll(customHtml, '{{description}}', desc);
    customHtml = replaceAll(customHtml, '{{basePrice}}', `${product.basePrice}`);
    customHtml = replaceAll(customHtml, '{{salePrice}}', `${salePriceVal}`);
    customHtml = replaceAll(customHtml, '{{sku}}', product.sku || '');
    customHtml = replaceAll(customHtml, '{{id}}', `${product.id}`);

    // Inject script and style to bridge interactive buttons and hide selectors
    const scriptToInject = `
      <style>
        .selectors-section { display: none !important; }
        ${!product.inStock ? `
          .btn-cart, button[class*="cart"], button[id*="cart"],
          .btn-buy-now, .btn-buy, button[class*="buy"], button[id*="buy"] {
            background-color: #bdbdbd !important;
            background-image: none !important;
            color: #ffffff !important;
            pointer-events: none !important;
            cursor: not-allowed !important;
          }
          /* Add an out of stock banner style */
          .oos-banner {
            background-color: #EF5350;
            color: white;
            text-align: center;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
            font-family: sans-serif;
            position: sticky;
            top: 0;
            z-index: 99999;
          }
        ` : ''}
      </style>
      <script>
        window.addEventListener('DOMContentLoaded', () => {
          ${!product.inStock ? `
            // Inject an out-of-stock banner at the top of the body
            const banner = document.createElement('div');
            banner.className = 'oos-banner';
            banner.innerText = '⚠️ هذا المنتج غير متوفر حالياً (نفذت الكمية)';
            document.body.insertBefore(banner, document.body.firstChild);

            // Change button texts to out-of-stock
            document.querySelectorAll('.btn-cart, button[class*="cart"], button[id*="cart"], .btn-buy-now, .btn-buy, button[class*="buy"], button[id*="buy"]').forEach(btn => {
              btn.innerText = 'نفذت الكمية';
              btn.disabled = true;
            });
          ` : `
            const registeredCart = new Set();
            const registeredWish = new Set();
            const registeredBuy = new Set();

            const cartBtns = document.querySelectorAll('.btn-cart, button[class*="cart"], button[id*="cart"]');
            cartBtns.forEach(btn => {
              if (!registeredCart.has(btn)) {
                registeredCart.add(btn);
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  window.parent.postMessage({ type: 'ADD_TO_CART', quantity: 1 }, '*');
                });
              }
            });

            document.querySelectorAll('button').forEach(btn => {
              if (!registeredCart.has(btn)) {
                if (btn.textContent.includes('سلة') || btn.textContent.includes('السلة') || btn.textContent.includes('cart') || btn.textContent.includes('Cart')) {
                  registeredCart.add(btn);
                  btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.parent.postMessage({ type: 'ADD_TO_CART', quantity: 1 }, '*');
                  });
                }
              }
            });

            const buyBtns = document.querySelectorAll('.btn-buy-now, .btn-buy, button[class*="buy"], button[id*="buy"]');
            buyBtns.forEach(btn => {
              if (!registeredBuy.has(btn)) {
                registeredBuy.add(btn);
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  window.parent.postMessage({ type: 'BUY_NOW', quantity: 1 }, '*');
                });
              }
            });

            document.querySelectorAll('button').forEach(btn => {
              if (!registeredBuy.has(btn)) {
                if (btn.textContent.includes('شراء الآن') || btn.textContent.includes('الشراء الآن') || btn.textContent.includes('شراء') || btn.textContent.includes('buy') || btn.textContent.includes('Buy')) {
                  registeredBuy.add(btn);
                  btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.parent.postMessage({ type: 'BUY_NOW', quantity: 1 }, '*');
                  });
                }
              }
            });

            const wishBtns = document.querySelectorAll('.btn-wish, button[class*="wish"], button[id*="wish"]');
            wishBtns.forEach(btn => {
              if (!registeredWish.has(btn)) {
                registeredWish.add(btn);
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  window.parent.postMessage({ type: 'ADD_TO_WISHLIST' }, '*');
                });
              }
            });

            document.querySelectorAll('button').forEach(btn => {
              if (!registeredWish.has(btn)) {
                if (btn.textContent.includes('المفضلة') || btn.textContent.includes('مفضلة') || btn.textContent.includes('wish') || btn.textContent.includes('Wish')) {
                  registeredWish.add(btn);
                  btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.parent.postMessage({ type: 'ADD_TO_WISHLIST' }, '*');
                  });
                }
              }
            });
          `}

          // Dynamic height adjustment to prevent double scrollbars
          const reportHeight = () => {
            const height = document.documentElement.scrollHeight || document.body.scrollHeight;
            window.parent.postMessage({ type: 'RESIZE', height: height }, '*');
          };

          // Send height on load, DOM load and resize
          reportHeight();
          window.addEventListener('load', reportHeight);
          window.addEventListener('resize', reportHeight);

          // Watch for changes in the document body size
          if (window.ResizeObserver) {
            const observer = new ResizeObserver(reportHeight);
            observer.observe(document.body);
          }
        });
      </script>
    `;

    if (customHtml.includes('</body>')) {
      customHtml = customHtml.replace('</body>', `${scriptToInject}</body>`);
    } else {
      customHtml += scriptToInject;
    }
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
    <div style={{ width: '100%' }}>
      {product.pageDesign ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <iframe
            srcDoc={customHtml}
            style={{ width: '100%', height: iframeHeight, border: 'none', overflow: 'hidden' }}
            title={product.name}
            scrolling="no"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      ) : (
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

                {/* Images — each absolutely fills the gallery, active one fades/slides in */}
                {productImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} - صورة ${index + 1}`}
                    className="pdp-gallery-image"
                    style={{
                      opacity: activeImageIndex === index ? 1 : 0,
                      transform: activeImageIndex === index
                        ? 'translateX(0)'
                        : index < activeImageIndex
                          ? 'translateX(60px)'
                          : 'translateX(-60px)',
                      pointerEvents: activeImageIndex === index ? 'none' : 'none',
                      transition: 'opacity 0.35s ease, transform 0.35s ease',
                    }}
                  />
                ))}
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
                {product.inStock === false && (
                  <span className="pdp-badge-origin" style={{ backgroundColor: '#EF5350', color: '#fff', fontWeight: 'bold' }}>
                    🚫 نفذت الكمية (غير متوفر)
                  </span>
                )}
                <span className="pdp-badge-category">
                  {product.subCategory?.name || 'تصنيف'}
                </span>
                <span className="pdp-badge-origin">
                  ✈️ مستورد
                </span>
              </div>

              <h1 className="pdp-title">{product.name}</h1>

              {/* التقييم */}
              <div className="pdp-rating">
                <Star style={{ color: '#FFD54F', fill: '#FFD54F' }} size={20} />
                <span className="pdp-rating-text">
                  {product.averageRating || 0}
                  <span className="pdp-rating-count">
                    ({product.reviewCount || 0} تقييم من المشترين)
                  </span>
                </span>
              </div>

              {/* السعر */}
              <div className="pdp-price-row">
                {product.salePrice && product.salePrice < product.basePrice ? (
                  <>
                    <span className="pdp-price">{product.salePrice} ج.م</span>
                    <span className="pdp-old-price">{product.basePrice} ج.م</span>
                  </>
                ) : (
                  <span className="pdp-price">{product.basePrice} ج.م</span>
                )}
              </div>

              {/* الوصف */}
              <p className="pdp-description">{product.description || product.shortDescription}</p>

              {/* خيار الألوان */}
              {product.variants && product.variants.filter(v => v.color).length > 0 && (
                <div className="pdp-option-group">
                  <h4 className="pdp-option-label">الألوان المتاحة:</h4>
                  <div className="pdp-color-dots">
                    {Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))).map((color) => (
                      <div
                        key={color as string}
                        className={`pdp-color-dot ${selectedColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color as string }}
                        onClick={() => setSelectedColor(color as string)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* خيار الأحجام */}
              {product.variants && product.variants.filter(v => v.size).length > 0 && (
                <div className="pdp-option-group">
                  <h4 className="pdp-option-label">المقاس:</h4>
                  <div className="pdp-sizes">
                    {Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))).map((size) => (
                      <button
                        key={size as string}
                        className={`pdp-size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size as string)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* التحكم في الكمية وإضافة للسلة */}
              <div className="pdp-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="pdp-qty-selector">
                  <button onClick={handleDecrease} className="pdp-qty-btn">
                    <Minus size={18} />
                  </button>
                  <span className="pdp-qty-val">{quantity}</span>
                  <button onClick={handleIncrease} className="pdp-qty-btn">
                    <Plus size={18} />
                  </button>
                </div>

                {product.inStock === false ? (
                  <button className="btn-primary pdp-add-btn disabled" disabled style={{ flex: 1, backgroundColor: '#bdbdbd', cursor: 'not-allowed' }}>
                    🚫 غير متوفر حالياً
                  </button>
                ) : (
                  <button className="btn-primary pdp-add-btn" onClick={handleAdd} style={{ flex: 1 }}>
                    <ShoppingCart size={22} />
                    إضافة إلى السلة
                  </button>
                )}

                <button
                  className={`favorite-toggle ${favorites.includes(String(product.id)) ? 'is-fav' : ''}`}
                  onClick={(e) => onToggleFavorite(String(product.id), e)}
                  style={{
                    position: 'relative', top: 'auto', left: 'auto',
                    width: '48px', height: '48px', flexShrink: 0,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', cursor: 'pointer', transition: 'var(--transition)'
                  }}
                  title={favorites.includes(String(product.id)) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                >
                  <Heart size={22} fill={favorites.includes(String(product.id)) ? "#E91E63" : "none"} color={favorites.includes(String(product.id)) ? "#E91E63" : "var(--text-muted)"} />
                </button>
              </div>

              {/* زر الشراء الآن */}
              {product.inStock === false ? (
                <button
                  className="pdp-buy-now-btn disabled"
                  disabled
                  style={{ backgroundColor: '#bdbdbd', cursor: 'not-allowed', marginTop: '1rem' }}
                >
                  🚫 نفذت الكمية
                </button>
              ) : (
                <button
                  className="pdp-buy-now-btn"
                  onClick={() => onBuyNow(product, quantity, selectedColor, selectedSize)}
                >
                  ⚡ شراء الآن
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* منتجات ذات صلة */}
      {relatedProducts.length > 0 && (
        <div className="pdp-container" style={{ marginTop: '2rem' }}>
          <div className="related-products-section">
            <div className="related-products-header">
              <h2 className="related-products-title">
                ✨ منتجات ذات صلة قد تعجبك
              </h2>
              {/* Arrows */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => scrollRelated('right')}
                  className="related-arrow-btn"
                  title="السابق"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => scrollRelated('left')}
                  className="related-arrow-btn"
                  title="التالي"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>

            {/* Slider list */}
            <div
              ref={relatedScrollRef}
              className="related-products-slider"
            >
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="related-products-slide"
                >
                  <ProductCard
                    product={p}
                    isFavorite={favorites.includes(String(p.id))}
                    onToggleFavorite={(pid, e) => onToggleFavorite(String(pid), e)}
                    onAddToCart={onQuickAddToCart}
                    onProductClick={(clickedProd) => navigate(`/product/${clickedProd.id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
