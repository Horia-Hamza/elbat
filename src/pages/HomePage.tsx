import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../data/products';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  activeCategory: string;
  setActiveCategory: (key: string) => void;
  showOnlyFavs: boolean;
  setShowOnlyFavs: (val: boolean) => void;
  searchQuery: string;
  favorites: string[];
  handleToggleFavorite: (id: string, e: React.MouseEvent) => void;
  handleQuickAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  activeCategory,
  setActiveCategory,
  showOnlyFavs,
  setShowOnlyFavs,
  searchQuery,
  favorites,
  handleToggleFavorite,
  handleQuickAddToCart,
}) => {
  const navigate = useNavigate();

  const [bubbles, setBubbles] = useState<
    { id: number; left: string; size: string; delay: string; duration: string }[]
  >([]);

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

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.categoryKey === activeCategory;
    const matchesSearch = product.title.includes(searchQuery) || product.description.includes(searchQuery);
    const matchesFav = !showOnlyFavs || favorites.includes(product.id);
    return matchesCategory && matchesSearch && matchesFav;
  });

  return (
    <>

      <Hero
        onExploreClick={scrollToCatalog}
        latestProducts={PRODUCTS.slice(-3)}
        onAddToCart={handleQuickAddToCart}
        onProductClick={(prod) => navigate(`/product/${prod.id}`)}
      />

      <div id="explore-products" style={{ scrollMarginTop: '100px' }}>
        <Categories
          activeCategory={activeCategory}
          onCategorySelect={(key) => {
            setActiveCategory(key);
            setShowOnlyFavs(false);
          }}
        />

        <section className="section-container" style={{ paddingTop: '1rem', minHeight: '400px' }}>
          <div className="section-header">
            <h2 className="section-title">
              {showOnlyFavs 
                ? 'المنتجات المفضلة لديك' 
                : activeCategory === 'all' 
                  ? 'منتجات البط المميزه' 
                  : CATEGORIES.find(c => c.key === activeCategory)?.name}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              تم العثور على {filteredProducts.length} منتج
            </span>
          </div>

          {filteredProducts.length === 0 ? (
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
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleQuickAddToCart}
                  onProductClick={(prod) => navigate(`/product/${prod.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="floating-ducks-container" style={{ position: 'fixed', opacity: 0.6, zIndex: 0, pointerEvents: 'none' }}>
        {bubbles.map((b) => (
          <img
            key={b.id}
            src="/new-duck.png"
            alt=""
            className="floating-duck-bg"
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
    </>
  );
};
