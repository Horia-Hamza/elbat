import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { productsApi } from '../api/products';
import { Loader2, PackageSearch } from 'lucide-react';
import type { ApiProduct } from '../types/api';
import { useSEO } from '../hooks/useSEO';

interface ProductsPageProps {
  favorites: string[];
  handleToggleFavorite: (id: string, e: React.MouseEvent) => void;
  handleQuickAddToCart: (product: ApiProduct, e: React.MouseEvent) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  favorites,
  handleToggleFavorite,
  handleQuickAddToCart,
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);

  useSEO({
    title: 'جميع المنتجات | متجر البط',
    description: 'تصفح جميع المنتجات في متجر البط — أفضل البيجامات وملابس النوم بأسعار مناسبة وشحن سريع لجميع أنحاء مصر.',
    url: '/products',
    type: 'website',
  });

  useEffect(() => {
    let isMounted = true;
    setProductsLoading(true);

    productsApi
      .filterProducts({
        pageNumber: 1,
        pageSize: 50,
        isActive: true,
        inStock: true,
      })
      .then((res: any) => {
        if (!isMounted) return;
        const items = Array.isArray(res) ? res : res?.items || res?.data || [];
        setProducts(items);
      })
      .catch((err) => {
        console.error('Error fetching all products via /Product/filter:', err);
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setProductsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive !== false),
    [products]
  );

  // ── Loading state ────────────────────────────────────────────
  if (productsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
          color: 'var(--primary)',
        }}
      >
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>جاري تحميل جميع المنتجات...</span>
      </div>
    );
  }

  return (
    <div
      className="section-container products-page-container"
      style={{ padding: '1rem 1.5rem 4rem', direction: 'rtl' }}
    >
      {/* ── Breadcrumb + Banner ── */}
      <div
        className="subcategory-banner"
        style={{
          background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(35,107,147,0.02) 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.25rem',
          marginBottom: '1rem',
          border: '1px solid rgba(35,107,147,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.15rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)' }}>
          <span style={{ cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/')}>الرئيسية</span>
          <span>&gt;</span>
          <span style={{ fontWeight: 'bold' }}>كل المنتجات</span>
        </div>

        <h1
          className="subcategory-banner-title"
          style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: 'var(--primary-dark)',
            margin: '0.1rem 0 0',
          }}
        >
          جميع المنتجات
        </h1>
      </div>

      {/* ── Products grid ── */}
      <div style={{ marginBottom: '1rem' }}>
        {activeProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: '#fff',
              borderRadius: 'var(--radius-md)',
              border: '1.5px dashed var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <PackageSearch size={52} style={{ color: 'var(--primary)', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
              لا توجد منتجات متوفرة حالياً!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              يرجى التحقق لاحقاً.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
              style={{ padding: '0.5rem 2rem', marginTop: '0.5rem' }}
            >
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {activeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.includes(product.id.toString())}
                onToggleFavorite={(pid, e) => handleToggleFavorite(pid.toString(), e)}
                onAddToCart={handleQuickAddToCart}
                onProductClick={(prod) => navigate(`/product/${prod.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
