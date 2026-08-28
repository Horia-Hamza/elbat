import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { subCategoriesApi } from '../api/subcategories';
import { useProducts } from '../hooks/useProducts';
import { Loader2, PackageSearch } from 'lucide-react';
import type { ApiProduct } from '../types/api';
import { useSEO } from '../hooks/useSEO';
import { useState, useEffect } from 'react';

interface SubCategoryPageProps {
  favorites: string[];
  handleToggleFavorite: (id: string, e: React.MouseEvent) => void;
  handleQuickAddToCart: (product: ApiProduct, e: React.MouseEvent) => void;
}

export const SubCategoryPage: React.FC<SubCategoryPageProps> = ({
  favorites,
  handleToggleFavorite,
  handleQuickAddToCart,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const subCategoryId = id ? parseInt(id, 10) : null;

  // ── Subcategory metadata ─────────────────────────────────────
  const [subCatName, setSubCatName] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    if (!subCategoryId || isNaN(subCategoryId)) return;
    subCategoriesApi.getSubCategories().then((all: any[]) => {
      const found = Array.isArray(all) ? all.find((sc) => sc.id === subCategoryId) : null;
      if (found) {
        setSubCatName(found.name || '');
        setCategoryName(found.categoryName || '');
      }
    }).catch(() => {});
  }, [subCategoryId]);

  // ── Products — same hook used on the Home page ───────────────
  const { products, loading: productsLoading } = useProducts(
    subCategoryId && !isNaN(subCategoryId)
      ? { pageNumber: 1, pageSize: 100, subCategoryId }
      : { pageNumber: 1, pageSize: 0 }
  );

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive !== false),
    [products]
  );

  useSEO({
    title: subCatName ? `${subCatName} | متجر البط` : 'أقسام المتجر | متجر البط',
    description: subCatName
      ? `تصفح منتجات ${subCatName} في متجر البط — أفضل المنتجات بأسعار مناسبة وشحن سريع لجميع أنحاء مصر.`
      : 'متجر البط — تصفح منتجاتنا واكتشف عروضنا الحصرية.',
    url: id ? `/subcategory/${id}` : undefined,
    type: 'website',
  });

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
        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>جاري تحميل منتجات القسم...</span>
      </div>
    );
  }

  return (
    <div
      className="section-container subcategory-page-container"
      style={{ padding: '1rem 1.5rem 4rem', direction: 'rtl' }}
    >
      {/* ── Breadcrumb + header ── */}
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
          <span style={{ color: 'var(--text-muted)' }}>{categoryName || 'الأقسام'}</span>
          <span>&gt;</span>
          <span style={{ fontWeight: 'bold' }}>{subCatName || '...'}</span>
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
          {subCatName || '...'}
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
              لا توجد منتجات متوفرة في هذا القسم حالياً!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              يرجى التحقق لاحقاً أو استكشاف أقسام أخرى بالمتجر.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
              style={{ padding: '0.5rem 2rem', marginTop: '0.5rem' }}
            >
              تصفح المتجر
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
