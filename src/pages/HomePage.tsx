import React, { useState, useEffect, useRef } from 'react';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { ProductCard } from '../components/ProductCard';
import type { ApiProduct } from '../types/api';
import { useProducts } from '../hooks/useProducts';
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

interface HomePageProps {
  activeCategory: string;
  setActiveCategory: (key: string) => void;
  activeSubCategory: string;
  setActiveSubCategory: (key: string) => void;
  subCategories: any[];
  showOnlyFavs: boolean;
  setShowOnlyFavs: (val: boolean) => void;
  searchQuery: string;
  favorites: string[];
  handleToggleFavorite: (id: string, e: React.MouseEvent) => void;
  handleQuickAddToCart: (product: ApiProduct, e: React.MouseEvent) => void;
}

type Bubble = {
  id: number;
  left: string;
  size: string;
  delay: string;
  duration: string;
  /** Set when the duck was just released — float away from this position */
  releasedPos?: { x: number; y: number };
};

export const HomePage: React.FC<HomePageProps> = ({
  activeCategory,
  setActiveCategory,
  activeSubCategory: _activeSubCategory,
  setActiveSubCategory: _setActiveSubCategory,
  subCategories,
  showOnlyFavs,
  setShowOnlyFavs,
  searchQuery,
  favorites,
  handleToggleFavorite,
  handleQuickAddToCart,
}) => {
  const navigate = useNavigate();

  useSEO({
    title: 'متجر البط | أحدث صيحات البيجامات وملابس النوم المريحة',
    description: 'تسوقي من متجر البط — أفضل البيجامات وملابس النوم المريحة والعصرية بأسعار مناسبة وشحن سريع لجميع أنحاء مصر. اكتشفي عروضنا الحصرية الآن!',
    url: '/',
    type: 'website',
  });

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [hoveredDuck, setHoveredDuck] = useState<number | null>(null);

  // Local subcategory state for home page filtering so nav bar is not affected
  const [homeSubCategory, setHomeSubCategory] = useState<string>('all');

  const { products, loading: productsLoading } = useProducts({
    pageNumber: 1,
    pageSize: 24,
    categoryId: activeCategory !== 'all' ? Number(activeCategory) : undefined,
    subCategoryId: homeSubCategory !== 'all' ? Number(homeSubCategory) : undefined,
    isActive: true,
    inStock: true,
  });

  const { products: latestProductsRaw } = useProducts({
    pageNumber: 1,
    pageSize: 12,
    sortDescending: true,
    isActive: true,
    inStock: true,
  });

  const latestProducts = latestProductsRaw.filter(p => p.isActive).slice(0, 3);

  // Drag state: which duck is being dragged and its current screen position
  const [dragState, setDragState] = useState<{
    id: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Keep a ref so global event listeners always see the latest drag state
  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  // Helper for starting drag (works for both mouse and touch)
  const handleStartDrag = (clientX: number, clientY: number, currentTarget: HTMLImageElement, id: number) => {
    const rect = currentTarget.getBoundingClientRect();
    setBubbles((prev) =>
      prev.map((bub) => bub.id === id ? { ...bub, releasedPos: undefined } : bub)
    );
    setDragState({
      id,
      x: rect.left,
      y: rect.top,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    });
  };

  // Global listeners for drag move + release (mouse + touch)
  useEffect(() => {
    const onMove = (clientX: number, clientY: number) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      setDragState((prev) =>
        prev ? { ...prev, x: clientX - prev.offsetX, y: clientY - prev.offsetY } : null
      );
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (dragStateRef.current && e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onRelease = () => {
      const ds = dragStateRef.current;
      if (!ds) return;
      setBubbles((prev) =>
        prev.map((b) =>
          b.id === ds.id ? { ...b, releasedPos: { x: ds.x, y: ds.y } } : b
        )
      );
      setDragState(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onRelease);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onRelease);
    window.addEventListener('touchcancel', onRelease);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onRelease);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onRelease);
      window.removeEventListener('touchcancel', onRelease);
    };
  }, []);

  useEffect(() => {
    const newBubbles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      size: Math.random() * 80 + 60 + 'px',
      delay: Math.random() * 8 + 's',
      duration: Math.random() * 6 + 8 + 's',
    }));
    setBubbles(newBubbles);
  }, []);

  // التمرير السلس إلى كتالوج المنتجات
  const scrollToCatalog = () => {
    const element = document.getElementById('explore-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper to resolve parent category ID
  const getProductCategoryId = (product: ApiProduct) => {
    if (product.subCategory && product.subCategory.categoryId) {
      return product.subCategory.categoryId;
    }
    const subCat = subCategories.find(sc => sc.id === product.subCategoryId);
    return subCat ? subCat.categoryId : null;
  };

  // Client-side search, favorite, category, and subcategory filtering
  const filteredProducts = products.filter((product) => {
    // Category check
    const prodCatId = getProductCategoryId(product);
    const matchesCategory = activeCategory === 'all' || (prodCatId !== null && prodCatId.toString() === activeCategory);

    // Subcategory check
    const matchesSubCategory = homeSubCategory === 'all' || product.subCategoryId.toString() === homeSubCategory;

    // Favorites check
    const matchesFav = !showOnlyFavs || favorites.includes(product.id.toString());

    // Search check
    const queryLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !queryLower ||
      product.name.toLowerCase().includes(queryLower) ||
      (product.description && product.description.toLowerCase().includes(queryLower)) ||
      (product.shortDescription && product.shortDescription.toLowerCase().includes(queryLower));

    return matchesCategory && matchesSubCategory && matchesFav && matchesSearch;
  });

  return (
    <>

      <Hero
        onExploreClick={scrollToCatalog}
        latestProducts={latestProducts}
        onAddToCart={handleQuickAddToCart}
        onProductClick={(prod) => navigate(`/product/${prod.id}`)}
      />

      <div id="explore-products" style={{ scrollMarginTop: '100px' }}>
        <Categories
          subCategories={subCategories}
          activeSubCategory={homeSubCategory}
          onSubCategorySelect={(key) => {
            setHomeSubCategory(key);
            setActiveCategory('all');
            setShowOnlyFavs(false);
          }}
        />

        <section className="section-container" style={{ paddingTop: '1rem', minHeight: '400px' }}>
          <div className="section-header">
            <h2 className="section-title">
              {showOnlyFavs
                ? 'المنتجات المفضلة لديك'
                : homeSubCategory === 'all'
                  ? 'منتجات البط المميزه'
                  : subCategories.find(sc => sc.id.toString() === homeSubCategory)?.name || 'المنتجات'}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              تم العثور على {filteredProducts.length} منتج
            </span>
          </div>

          {productsLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <h3>جاري تحميل المنتجات...</h3>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <HelpCircle size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary-light)' }} />
              <h3>لم نعثر على أي منتجات تطابق بحثك!</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                جرب تغيير خيارات التصفية أو البحث عن مصطلح آخر.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id.toString())}
                  onToggleFavorite={(id, e) => handleToggleFavorite(id.toString(), e)}
                  onAddToCart={handleQuickAddToCart}
                  onProductClick={(prod) => navigate(`/product/${prod.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="floating-ducks-container" style={{ position: 'fixed', opacity: 0.6, zIndex: 0 }}>
        {bubbles.map((b) => {
          const isDragging = dragState?.id === b.id;
          const isReleased = !!b.releasedPos && !isDragging;
          const isHovered = hoveredDuck === b.id && !isDragging && !isReleased;

          return (
            <img
              key={b.id}
              src="/new-duck.png"
              alt=""
              className={`floating-duck-bg${isReleased ? ' duck-float-away' : ''}`}
              draggable={false}
              onMouseEnter={() => { if (!isDragging) setHoveredDuck(b.id); }}
              onMouseLeave={() => { if (!isDragging) setHoveredDuck(null); }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleStartDrag(e.clientX, e.clientY, e.currentTarget as HTMLImageElement, b.id);
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  if (e.cancelable) e.preventDefault();
                  handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget as HTMLImageElement, b.id);
                }
              }}
              onAnimationEnd={(e) => {
                // Only reset on the float-away animation ending, not the looping one
                if (e.animationName === 'floatDuckFromPos') {
                  setBubbles((prev) =>
                    prev.map((bub) => bub.id === b.id ? { ...bub, releasedPos: undefined } : bub)
                  );
                }
              }}
              style={{
                // DRAGGING: fixed position driven by JS, animation cleared so
                // CSS keyframe transforms don't offset the duck from the cursor.
                // RELEASED: fixed position at drop point, one-shot float-away animation.
                // NORMAL: absolute in container, looping float animation.
                position: isDragging || isReleased ? 'fixed' : 'absolute',
                left: isDragging ? dragState!.x : isReleased ? b.releasedPos!.x : b.left,
                top: isDragging || isReleased ? (isDragging ? dragState!.y : b.releasedPos!.y) : undefined,
                bottom: isDragging || isReleased ? undefined : '-60px',
                width: b.size,
                height: b.size,
                // Kill animation while dragging; released uses CSS class; normal loops
                animation: isDragging ? 'none' : undefined,
                animationDelay: isDragging || isReleased ? undefined : b.delay,
                animationDuration: isDragging || isReleased ? undefined : b.duration,
                animationPlayState: isHovered ? 'paused' : 'running',
                opacity: isDragging ? 0.85 : undefined,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                filter: isDragging
                  ? 'drop-shadow(0 0 20px rgba(255, 220, 50, 1)) brightness(1.3)'
                  : isHovered
                    ? 'drop-shadow(0 0 12px rgba(255, 220, 50, 0.9)) brightness(1.2)'
                    : undefined,
                transition: isDragging ? 'none' : 'filter 0.2s ease',
                zIndex: isDragging ? 9999 : isReleased ? 9998 : undefined,
                userSelect: 'none',
                transform: isDragging ? 'scale(1.1)' : undefined,
              }}
            />
          );
        })}
      </div>
    </>
  );
};
