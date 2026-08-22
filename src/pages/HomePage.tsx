import React, { useState, useEffect, useRef } from 'react';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { ProductCard } from '../components/ProductCard';
import type { ApiProduct } from '../types/api';
import { useCategories } from '../hooks/useCategories';
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
  activeSubCategory,
  setActiveSubCategory,
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
    title: 'متجر البطّ | منتجات مبتكرة للمنزل والعناية الشخصية',
    description: 'تسوق من متجر البطّ — أفضل المنتجات المبتكرة للمنزل والعناية الشخصية بأسعار مناسبة وشحن سريع لجميع أنحاء مصر. اكتشف عروضنا الحصرية الآن!',
    url: '/',
    type: 'website',
  });

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [hoveredDuck, setHoveredDuck] = useState<number | null>(null);

  const { categories } = useCategories();
  
  const { products, loading: productsLoading } = useProducts({
    pageNumber: 1,
    pageSize: 24,
    categoryId: activeCategory !== 'all' ? Number(activeCategory) : null,
    subCategoryId: activeSubCategory !== 'all' ? Number(activeSubCategory) : null,
  });

  const { products: latestProductsRaw } = useProducts({
    pageNumber: 1,
    pageSize: 12,
    sortDescending: true,
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

  // Global listeners for drag move + release
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      setDragState((prev) =>
        prev ? { ...prev, x: e.clientX - prev.offsetX, y: e.clientY - prev.offsetY } : null
      );
    };

    const onMouseUp = () => {
      const ds = dragStateRef.current;
      if (!ds) return;
      // Save the drop position so the duck can float away from there
      setBubbles((prev) =>
        prev.map((b) =>
          b.id === ds.id ? { ...b, releasedPos: { x: ds.x, y: ds.y } } : b
        )
      );
      setDragState(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
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
    const matchesSubCategory = activeSubCategory === 'all' || product.subCategoryId.toString() === activeSubCategory;

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
          activeSubCategory={activeSubCategory}
          onSubCategorySelect={(key) => {
            setActiveSubCategory(key);
            setActiveCategory('all');
            setShowOnlyFavs(false);
          }}
        />

        <section className="section-container" style={{ paddingTop: '1rem', minHeight: '400px' }}>
          <div className="section-header">
            <h2 className="section-title">
              {showOnlyFavs 
                ? 'المنتجات المفضلة لديك' 
                : activeSubCategory === 'all' 
                  ? (activeCategory === 'all' ? 'منتجات البط المميزه' : categories.find(c => c.id.toString() === activeCategory)?.name || 'المنتجات')
                  : subCategories.find(sc => sc.id.toString() === activeSubCategory)?.name || 'المنتجات'}
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
              onMouseEnter={() => { if (!isDragging) setHoveredDuck(b.id); }}
              onMouseLeave={() => { if (!isDragging) setHoveredDuck(null); }}
              onMouseDown={(e) => {
                e.preventDefault();
                const rect = (e.currentTarget as HTMLImageElement).getBoundingClientRect();
                // Clear any pending release animation before dragging again
                setBubbles((prev) =>
                  prev.map((bub) => bub.id === b.id ? { ...bub, releasedPos: undefined } : bub)
                );
                setDragState({
                  id: b.id,
                  x: rect.left,
                  y: rect.top,
                  offsetX: e.clientX - rect.left,
                  offsetY: e.clientY - rect.top,
                });
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
