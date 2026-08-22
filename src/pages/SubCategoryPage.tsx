import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { subCategoriesApi } from '../api/subcategories';
import { Loader2, AlertCircle } from 'lucide-react';
import type { ApiProduct } from '../types/api';
import { useSEO } from '../hooks/useSEO';

interface SubCategoryPageProps {
  favorites: string[];
  handleToggleFavorite: (id: string, e: React.MouseEvent) => void;
  handleQuickAddToCart: (product: ApiProduct, e: React.MouseEvent) => void;
}

interface SubCategoryDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
  categoryId: number;
  categoryName: string;
  products: ApiProduct[];
}

export const SubCategoryPage: React.FC<SubCategoryPageProps> = ({
  favorites,
  handleToggleFavorite,
  handleQuickAddToCart,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [subCategory, setSubCategory] = useState<SubCategoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: subCategory ? `${subCategory.name} | متجر البط` : 'أقسام المتجر | متجر البط',
    description: subCategory
      ? `تصفح منتجات ${subCategory.name} في متجر البط — أفضل المنتجات بأسعار مناسبة وشحن سريع لجميع أنحاء مصر.`
      : 'متجر البط — تصفح منتجاتنا واكتشف عروضنا الحصرية.',
    url: id ? `/subcategory/${id}` : undefined,
    type: 'website',
  });

  useEffect(() => {
    if (!id) return;

    const fetchSubCategoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const subCategoryId = parseInt(id, 10);
        if (isNaN(subCategoryId)) {
          throw new Error('معرف القسم غير صحيح');
        }
        const data = await subCategoriesApi.getSubCategoryById(subCategoryId);
        setSubCategory(data);
      } catch (err: any) {
        console.error('Error fetching subcategory products:', err);
        setError(err.message || 'حدث خطأ أثناء تحميل منتجات القسم');
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategoryData();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
          color: 'var(--primary)'
        }}
      >
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>جاري تحميل منتجات القسم...</span>
      </div>
    );
  }

  if (error || !subCategory) {
    return (
      <div
        className="section-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: '1.5rem',
          padding: '2rem'
        }}
      >
        <AlertCircle size={60} style={{ color: '#EF5350' }} />
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
            عذراً، حدث خطأ ما!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{error || 'لم نتمكن من العثور على هذا القسم.'}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/')}
          style={{ padding: '0.6rem 2rem' }}
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const products = subCategory.products || [];

  return (
    <div className="section-container subcategory-page-container" style={{ padding: '1rem 1.5rem 4rem', direction: 'rtl' }}>

      {/* Category Header Banner */}
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
          gap: '0.15rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary)' }}>
          <span style={{ cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/')}>الرئيسية</span>
          <span>&gt;</span>
          <span style={{ color: 'var(--text-muted)' }}>{subCategory.categoryName || 'الأقسام'}</span>
          <span>&gt;</span>
          <span style={{ fontWeight: 'bold' }}>{subCategory.name}</span>
        </div>

        <h1
          className="subcategory-banner-title"
          style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: 'var(--primary-dark)',
            margin: '0.1rem 0 0'
          }}
        >
          {subCategory.name}
        </h1>
      </div>

      {/* Products Grid */}
      <div style={{ marginBottom: '1rem' }}>

        {products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: '#fff',
              borderRadius: 'var(--radius-md)',
              border: '1.5px dashed var(--border)'
            }}
          >
            <h3 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.2rem' }}>لا توجد منتجات متوفرة في هذا القسم حالياً!</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              يرجى التحقق لاحقاً أو استكشاف أقسام أخرى بالمتجر.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
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
