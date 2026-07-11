import React, { useEffect, useState, useRef } from 'react';
import {
  X, Star, Package, Tag, Layers, Image as ImageIcon,
  Video, Palette, ExternalLink, Loader2, AlertTriangle,
  CheckCircle, XCircle, ShoppingBag, Calendar, Hash,
  Bot, Copy, Check, Wand2, Send, BarChart2, Trash2,
} from 'lucide-react';
import { productsApi, inventoryApi, productImagesApi } from '../../api/products';
import { pageDesignsApi } from '../../api/pageDesigns';
import { IMAGES_BASE_URL } from '../../api/client';
import { apiFetch } from '../../api/client';
import type { ApiProduct } from '../../types/api';
import type { ApiInventory } from '../../api/products';

interface AdminProductDetailProps {
  productId: number;
  onClose: () => void;
  onEdit: (product: ApiProduct) => void;
  initialTab?: TabKey;
}

type TabKey = 'info' | 'images' | 'videos' | 'design' | 'ai' | 'create-design' | 'inventory';

const BASE = IMAGES_BASE_URL;

function resolveUrl(path: string | null | undefined) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE}${path}`;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.7rem 0.9rem', borderRadius: 8,
  border: '1px solid var(--admin-border)',
  backgroundColor: 'var(--admin-bg-dark)',
  color: 'white', boxSizing: 'border-box', fontSize: '0.875rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.4rem',
  color: 'var(--admin-text-muted)', fontSize: '0.8rem',
};

/* ─── Copy-button helper ─────────────────────────────────────── */
const CopyBtn: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      background: copied ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.07)',
      border: `1px solid ${copied ? 'rgba(34,197,94,.4)' : 'var(--admin-border)'}`,
      color: copied ? '#22c55e' : 'var(--admin-text-muted)',
      borderRadius: 6, padding: '0.3rem 0.8rem', cursor: 'pointer',
      fontSize: '0.75rem', fontWeight: 600, transition: 'all .2s',
      whiteSpace: 'nowrap',
    }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'تم النسخ!' : (label || 'نسخ')}
    </button>
  );
};

/* ─── Collapsible JSON block ─────────────────────────────────── */
const JsonBlock: React.FC<{ title: string; data: unknown; defaultOpen?: boolean }> = ({ title, data, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const json = JSON.stringify(data, null, 2);
  return (
    <div style={{ border: '1px solid var(--admin-border)', borderRadius: 8, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.6rem 0.9rem', background: 'var(--admin-bg-dark)',
        border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600,
      }}>
        <span>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CopyBtn text={json} label="نسخ JSON" />
          <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <pre style={{
          margin: 0, padding: '0.9rem 1rem', overflowX: 'auto',
          fontSize: '0.72rem', lineHeight: 1.6,
          color: '#a5f3fc', background: '#0a0f1a',
          maxHeight: 340,
        }}>{json}</pre>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
export const AdminProductDetail: React.FC<AdminProductDetailProps> = ({ productId, onClose, onEdit, initialTab }) => {
  const [product, setProduct]     = useState<ApiProduct | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const backdropRef               = useRef<HTMLDivElement>(null);

  const [refreshCount, setRefreshCount] = useState(0);
  const [imageSaving, setImageSaving]   = useState(false);
  const [imageError, setImageError]     = useState<string | null>(null);

  /* Image upload form state */
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newAltText, setNewAltText]     = useState('');
  const [uploadIsMain, setUploadIsMain] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);

  /* Extra data fetched alongside the product */
  const [reviews, setReviews]     = useState<unknown[]>([]);
  const [inventory, setInventory] = useState<ApiInventory | null>(null);

  /* Inventory form */
  const [invForm, setInvForm] = useState({
    quantity: 100,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: false,
    variantId: '' as string,
  });
  const [invSaving, setInvSaving] = useState(false);
  const [invSuccess, setInvSuccess] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);

  /* Create-design form */
  const [designName, setDesignName]   = useState('');
  const [designHtml, setDesignHtml]   = useState('');
  const [designCss, setDesignCss]     = useState('');
  const [designSaving, setDesignSaving] = useState(false);
  const [designResult, setDesignResult] = useState<{ success: boolean; message: string } | null>(null);

  /* ── Fetch all data ── */
  useEffect(() => {
    setLoading(true); setError(null);
    setReviews([]); setInventory(null);

    productsApi.getProductById(productId)
      .then(data => {
        if (!product || product.id !== data.id) {
          setActiveTab(initialTab ?? 'info');
        }
        setProduct(data);
        setActiveImageIdx(0);
        setDesignName(`تصميم ${data.name}`);

        // fire-and-forget: reviews
        apiFetch<any>(`/Review?productId=${productId}&pageNumber=1&pageSize=50`)
          .then(r => setReviews(Array.isArray(r?.items) ? r.items : Array.isArray(r) ? r : []))
          .catch(() => {/* silently ignore */});

        // fire-and-forget: inventory
        apiFetch<ApiInventory>(`/Inventory?productId=${productId}`)
          .then(r => {
            setInventory(r);
            if (r) {
              setInvForm({
                quantity: r.quantity,
                lowStockThreshold: r.lowStockThreshold,
                trackInventory: r.trackInventory ?? true,
                allowBackorder: r.allowBackorder,
                variantId: r.variantId ? r.variantId.toString() : '',
              });
            }
          })
          .catch(() => {/* silently ignore */});
      })
      .catch(err => setError(err?.message || 'فشل تحميل المنتج'))
      .finally(() => setLoading(false));
  }, [productId, refreshCount]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const images = (product?.images ?? []).map(img => {
    const u = img.imageUrl || img.url || '';
    return { url: resolveUrl(u) || '', altText: img.altText || '', isMain: img.isMain, id: img.id };
  });
  const videos = product?.videos ?? [];

  /* ── Build the aggregated AI context ── */
  const buildAiContext = () => {
    if (!product) return '';
    const resolvedImages = (product.images ?? []).map(img => ({
      ...img,
      fullImageUrl: resolveUrl(img.imageUrl || img.url || '') || '',
    }));
    const resolvedVideos = (product.videos ?? []).map(vid => ({
      ...vid,
      fullVideoUrl: resolveUrl(vid.videoUrl) || '',
    }));
    return JSON.stringify({
      product: {
        ...product,
        images: resolvedImages,
        videos: resolvedVideos,
        pageDesign: undefined, // omit large HTML from context
      },
      reviews,
      inventory,
      meta: {
        imagesBaseUrl: BASE,
        mainImageFullUrl: resolveUrl(product.mainImageUrl) || '',
        note: 'Use {{name}}, {{mainImageUrl}}, {{basePrice}}, {{salePrice}}, {{description}}, {{brandName}}, {{subCategoryName}}, {{sku}}, {{id}} as template placeholders in the HTML.',
      },
    }, null, 2);
  };

  const AI_PROMPT = product ? `أنت مصمم ويب محترف. المطلوب إنشاء صفحة منتج HTML كاملة باللغة العربية (RTL) لمنتج اسمه "${product.name}".

## البيانات الكاملة للمنتج:
\`\`\`json
${buildAiContext()}
\`\`\`

## المتطلبات:
- صفحة HTML كاملة ومستقلة (لا تحتاج React أو أي framework)
- تصميم عصري وجميل جداً باستخدام CSS نقي مدمج داخل <style>
- اتجاه RTL، خط عربي (Cairo من Google Fonts)
- استخدم هذه المتغيرات كـ placeholders في الـ HTML: {{name}}، {{mainImageUrl}}، {{basePrice}}، {{salePrice}}، {{description}}، {{brandName}}، {{subCategoryName}}، {{sku}}، {{id}}
- زر "أضف إلى السلة" يجب أن يحتوي على class="btn-cart" أو text يحتوي على كلمة "سلة"
- صورة المنتج تُعرض من {{mainImageUrl}}
- أسعار معروضة بوضوح (سعر التخفيض والأصلي)
- الصفحة يجب أن تكون مبهرة بصرياً

## المطلوب منك إرجاعه:
1. كود HTML كامل (من <!DOCTYPE> إلى </html>) مع CSS مدمج داخله
2. إذا أردت CSS منفصل، اكتبه في قسم منفصل بعد HTML

لا تشرح، فقط اكتب الكود مباشرة.` : '';

  /* ── Submit new design ── */
  const handleCreateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !designHtml.trim()) return;
    setDesignSaving(true);
    setDesignResult(null);
    try {
      // 1. Create design
      await pageDesignsApi.create({
        name: designName || `تصميم ${product.name}`,
        targetType: 2,
        htmlTemplate: designHtml,
        cssStyles: designCss || undefined,
        isActive: true,
        isDefault: false,
      });
      // 2. Resolve id by listing all and finding the last with same name
      const all = await pageDesignsApi.getAll();
      const nm  = designName || `تصميم ${product.name}`;
      const idx = all.map(d => d.name).lastIndexOf(nm);
      const designId = idx !== -1 ? idx + 1 : null;
      if (designId) {
        await pageDesignsApi.assignProduct({ targetId: product.id, pageDesignId: designId });
        setDesignResult({ success: true, message: `✅ تم إنشاء التصميم (ID: ${designId}) وربطه بالمنتج بنجاح!` });
      } else {
        setDesignResult({ success: true, message: '✅ تم إنشاء التصميم ولكن تعذّر الربط التلقائي — ارجع لقسم التصاميم وافعلها يدوياً.' });
      }
    } catch (err: any) {
      setDesignResult({ success: false, message: `❌ ${err?.message || 'حدث خطأ'}` });
    } finally {
      setDesignSaving(false);
    }
  };

  /* ── Submit inventory ── */
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvSaving(true);
    setInvError(null);
    setInvSuccess(false);
    try {
      const result = await inventoryApi.create({
        productId,
        variantId: invForm.variantId ? parseInt(invForm.variantId) : null,
        quantity: invForm.quantity,
        lowStockThreshold: invForm.lowStockThreshold,
        trackInventory: invForm.trackInventory,
        allowBackorder: invForm.allowBackorder,
      });
      setInventory(result);
      setInvSuccess(true);
    } catch (err: any) {
      setInvError(err?.message || 'حدث خطأ أثناء إضافة المخزون');
    } finally {
      setInvSaving(false);
    }
  };

  /* ── Set main image ── */
  const handleSetMainImage = async (imageId: number) => {
    setImageSaving(true);
    setImageError(null);
    try {
      await productImagesApi.setMainImage(productId, imageId);
      setRefreshCount(prev => prev + 1);
    } catch (err: any) {
      setImageError(err?.message || 'حدث خطأ أثناء تعيين الصورة الرئيسية');
    } finally {
      setImageSaving(false);
    }
  };

  /* ── Upload image ── */
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageFile) return;
    setUploadingImage(true);
    setUploadError(null);
    try {
      await productImagesApi.uploadImage({
        productId,
        file: newImageFile,
        altText: newAltText || newImageFile.name,
        isMain: uploadIsMain,
      });
      setNewImageFile(null);
      setNewAltText('');
      setUploadIsMain(false);
      setRefreshCount(prev => prev + 1);
    } catch (err: any) {
      setUploadError(err?.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  /* ── Delete image ── */
  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    setImageSaving(true);
    setImageError(null);
    try {
      await productImagesApi.deleteImage(imageId);
      // If we deleted the active image, reset active idx to 0
      setActiveImageIdx(0);
      setRefreshCount(prev => prev + 1);
    } catch (err: any) {
      setImageError(err?.message || 'حدث خطأ أثناء حذف الصورة');
    } finally {
      setImageSaving(false);
    }
  };

  /* ── POST body preview ── */
  const postBodyPreview = () => JSON.stringify({
    name: designName || `تصميم ${product?.name || ''}`,
    targetType: 2,
    htmlTemplate: designHtml || '<!-- paste your HTML here -->',
    cssStyles: designCss || null,
    isActive: true,
    isDefault: false,
  }, null, 2);

  const STAT_STYLE: React.CSSProperties = {
    background: 'var(--admin-bg-dark)', borderRadius: 10,
    padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem',
  };

  const TABS: { key: TabKey; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { key: 'info',          label: 'التفاصيل',     icon: <Package size={13} /> },
    { key: 'images',        label: `الصور (${images.length})`, icon: <ImageIcon size={13} /> },
    { key: 'videos',        label: `الفيديو (${videos.length})`, icon: <Video size={13} /> },
    { key: 'design',        label: 'التصميم الحالي', icon: <Palette size={13} /> },
    { key: 'inventory',     label: '📊 المخزون',   icon: <BarChart2 size={13} /> },
    { key: 'ai',            label: '🤖 سياق AI',   icon: <Bot size={13} /> },
    { key: 'create-design', label: '🎨 إنشاء تصميم', icon: <Wand2 size={13} /> },
  ];

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1100, display: 'flex', justifyContent: 'flex-end',
        backdropFilter: 'blur(3px)',
      }}
    >
      {/* ── Slide-in panel ── */}
      <div style={{
        width: '100%', maxWidth: 700, height: '100%',
        backgroundColor: 'var(--admin-bg-panel)',
        boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease',
        overflowY: 'auto',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--admin-border)',
          position: 'sticky', top: 0, zIndex: 20, backgroundColor: 'var(--admin-bg-panel)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={20} style={{ color: 'var(--admin-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>
              {loading ? 'جاري التحميل...' : (product?.name || `منتج #${productId}`)}
            </span>
            {product && (
              <span style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12,
                background: product.isActive ? 'rgba(34,197,94,.18)' : 'rgba(156,163,175,.18)',
                color: product.isActive ? '#22c55e' : '#9ca3af', fontWeight: 600,
              }}>
                {product.isActive ? 'نشط' : 'مخفي'}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--admin-text-muted)', borderRadius: 8, padding: '0.3rem',
          }}>
            <X size={22} />
          </button>
        </div>

        {/* ── Loading / Error ── */}
        {loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Loader2 size={40} style={{ color: 'var(--admin-primary)', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--admin-text-muted)' }}>جاري تحميل بيانات المنتج...</span>
          </div>
        )}
        {error && !loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
            <AlertTriangle size={40} style={{ color: 'var(--admin-danger)' }} />
            <span style={{ color: 'var(--admin-danger)', textAlign: 'center' }}>{error}</span>
          </div>
        )}

        {/* ── Main content ── */}
        {!loading && !error && product && (
          <>
            {/* ── Hero strip ── */}
            <div style={{
              display: 'flex', gap: '1.25rem', padding: '1.1rem 1.5rem',
              borderBottom: '1px solid var(--admin-border)', alignItems: 'flex-start',
            }}>
              <div style={{
                width: 100, height: 100, flexShrink: 0, borderRadius: 12, overflow: 'hidden',
                border: '2px solid var(--admin-border)', background: 'var(--admin-bg-dark)',
              }}>
                {product.mainImageUrl
                  ? <img src={resolveUrl(product.mainImageUrl) || ''} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={28} style={{ color: 'var(--admin-text-muted)' }} /></div>
                }
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <div style={STAT_STYLE}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>السعر الأساسي</span>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--admin-text-main)' }}>{product.basePrice} ج.م</span>
                  </div>
                  {product.salePrice != null && product.salePrice > 0 && (
                    <div style={{ ...STAT_STYLE, borderLeft: '2px solid var(--admin-primary)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>سعر التخفيض</span>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--admin-primary)' }}>{product.salePrice} ج.م</span>
                    </div>
                  )}
                  <div style={STAT_STYLE}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>التقييم</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, fontSize: '0.88rem' }}>
                      <Star size={12} style={{ color: '#FFD54F', fill: '#FFD54F' }} />
                      {(product.averageRating ?? 0).toFixed(1)}
                      <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>({product.reviewCount ?? 0})</span>
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    product.inStock ? { t: '✓ متوفر', c: '#22c55e', bg: 'rgba(34,197,94,.15)' } : { t: '✗ نفذ', c: '#ef4444', bg: 'rgba(239,68,68,.15)' },
                    product.isFeatured ? { t: '⭐ مميز', c: '#f59e0b', bg: 'rgba(245,158,11,.15)' } : null,
                    product.pageDesignId ? { t: '🎨 تصميم مخصص', c: '#6366f1', bg: 'rgba(99,102,241,.15)' } : null,
                  ].filter(Boolean).map((b: any) => (
                    <span key={b.t} style={{ fontSize: '0.72rem', padding: '2px 9px', borderRadius: 12, background: b.bg, color: b.c, fontWeight: 600 }}>{b.t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Tab bar — 2×3 grid so all 6 are always visible ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              borderBottom: '1px solid var(--admin-border)',
              position: 'sticky', top: 60, zIndex: 15,
              backgroundColor: 'var(--admin-bg-panel)',
            }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => !tab.disabled && setActiveTab(tab.key)}
                  style={{
                    background: activeTab === tab.key ? 'rgba(99,102,241,.1)' : 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid var(--admin-primary)' : '2px solid transparent',
                    borderRight: '1px solid var(--admin-border)',
                    cursor: tab.disabled ? 'not-allowed' : 'pointer',
                    padding: '0.6rem 0.4rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                    fontSize: '0.72rem', fontWeight: 600,
                    color: activeTab === tab.key ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
                    opacity: tab.disabled ? 0.4 : 1,
                    transition: 'all .15s',
                    textAlign: 'center', lineHeight: 1.3,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ══════════════ TAB: INFO ══════════════ */}
            {activeTab === 'info' && (
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  {[
                    { icon: <Hash size={13}/>, label: 'ID', value: `#${product.id}` },
                    { icon: <Tag size={13}/>, label: 'SKU', value: product.sku || '—' },
                    { icon: <Layers size={13}/>, label: 'القسم الفرعي', value: product.subCategoryName || `ID: ${product.subCategoryId}` },
                    { icon: <ShoppingBag size={13}/>, label: 'الماركة', value: product.brandName || `ID: ${product.brandId}` },
                    { icon: <Package size={13}/>, label: 'إجمالي المبيعات', value: `${product.totalSold ?? 0} قطعة` },
                    { icon: <Calendar size={13}/>, label: 'تاريخ الإنشاء', value: product.createdAt ? new Date(product.createdAt).toLocaleDateString('ar-EG') : '—' },
                  ].map(row => (
                    <div key={row.label} style={{ background: 'var(--admin-bg-dark)', borderRadius: 8, padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--admin-text-muted)', fontSize: '0.7rem' }}>{row.icon}{row.label}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--admin-text-main)', wordBreak: 'break-all' }}>{row.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--admin-bg-dark)', borderRadius: 8, padding: '0.65rem 0.85rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginBottom: '0.2rem' }}>Slug</div>
                  <code style={{ fontSize: '0.8rem', color: 'var(--admin-primary)', wordBreak: 'break-all' }}>{product.slug}</code>
                </div>
                {product.description && (
                  <div style={{ background: 'var(--admin-bg-dark)', borderRadius: 8, padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginBottom: '0.4rem' }}>الوصف</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--admin-text-main)', lineHeight: 1.7, margin: 0 }}>{product.description}</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                    {product.isActive ? <CheckCircle size={15} style={{ color: '#22c55e' }} /> : <XCircle size={15} style={{ color: '#ef4444' }} />}
                    <span style={{ color: product.isActive ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{product.isActive ? 'المنتج نشط' : 'المنتج مخفي'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                    {product.inStock ? <CheckCircle size={15} style={{ color: '#22c55e' }} /> : <XCircle size={15} style={{ color: '#ef4444' }} />}
                    <span style={{ color: product.inStock ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{product.inStock ? 'متوفر في المخزون' : 'نفذ من المخزون'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ TAB: IMAGES ══════════════ */}
            {activeTab === 'images' && (
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {images.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ borderRadius: 14, overflow: 'hidden', border: '2px solid var(--admin-border)', aspectRatio: '16/9', background: 'var(--admin-bg-dark)' }}>
                      <img src={images[activeImageIdx]?.url} alt={images[activeImageIdx]?.altText} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {images.map((img, i) => (
                        <button key={img.id} onClick={() => setActiveImageIdx(i)} style={{
                          width: 58, height: 58, padding: 0, border: 'none', cursor: 'pointer',
                          borderRadius: 8, overflow: 'hidden', position: 'relative',
                          outline: activeImageIdx === i ? '2px solid var(--admin-primary)' : '2px solid transparent',
                          outlineOffset: 2,
                        }}>
                          <img src={img.url} alt={img.altText} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {img.isMain && <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--admin-primary)', color: 'white', fontSize: '0.52rem', textAlign: 'center', padding: '1px 0', fontWeight: 700 }}>رئيسية</span>}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>{images[activeImageIdx]?.altText}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        {images[activeImageIdx] && !images[activeImageIdx].isMain && (
                          <button
                            onClick={() => handleSetMainImage(images[activeImageIdx].id)}
                            disabled={imageSaving}
                            style={{
                              background: 'var(--admin-primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              padding: '0.35rem 0.8rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all .2s'
                            }}
                          >
                            {imageSaving ? (
                              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Star size={12} />
                            )}
                            تعيين كرئيسية
                          </button>
                        )}
                        {images[activeImageIdx]?.isMain && (
                          <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle size={13} /> الصورة الرئيسية الحالية
                          </span>
                        )}

                        {/* Delete Image button */}
                        {images[activeImageIdx] && (
                          <button
                            onClick={() => handleDeleteImage(images[activeImageIdx].id)}
                            disabled={imageSaving}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: 'var(--admin-danger)',
                              border: '1px solid var(--admin-danger)',
                              borderRadius: 6,
                              padding: '0.35rem 0.8rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all .2s'
                            }}
                          >
                            {imageSaving ? (
                              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            حذف
                          </button>
                        )}

                        <a href={images[activeImageIdx]?.url} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-primary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                          <ExternalLink size={12}/> فتح
                        </a>
                      </div>
                    </div>
                    {imageError && (
                      <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid var(--admin-danger)', borderRadius: 8, padding: '0.7rem 1rem', color: 'var(--admin-danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        ❌ {imageError}
                      </div>
                    )}
                  </div>
                )}

                {images.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 1.5rem', color: 'var(--admin-text-muted)', background: 'var(--admin-bg-dark)', borderRadius: 10 }}>
                    <ImageIcon size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                    <p style={{ margin: 0 }}>لا توجد صور لهذا المنتج بعد. يرجى رفع صورة أدناه.</p>
                  </div>
                )}

                {/* Beautiful Uploader Form */}
                <div style={{ background: 'var(--admin-bg-dark)', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--admin-border)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--admin-text-main)' }}>
                    <ImageIcon size={16} style={{ color: 'var(--admin-primary)' }} />
                    رفع صورة جديدة للمنتج
                  </h4>
                  <form onSubmit={handleUploadImage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>اختر ملف الصورة *</label>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setNewImageFile(e.target.files[0]);
                          }
                        }}
                        style={{ ...inputStyle, padding: '0.5rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>النص البديل (Alt Text) — اختياري</label>
                        <input
                          type="text"
                          value={newAltText}
                          onChange={(e) => setNewAltText(e.target.value)}
                          placeholder="مثال: صورة مقربة للمنتج بلون أحمر"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <input
                          type="checkbox"
                          checked={uploadIsMain}
                          onChange={(e) => setUploadIsMain(e.target.checked)}
                        />
                        <span>تعيين كصورة رئيسية تلقائياً</span>
                      </label>
                    </div>

                    {uploadError && (
                      <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid var(--admin-danger)', borderRadius: 8, padding: '0.7rem 1rem', color: 'var(--admin-danger)', fontSize: '0.82rem' }}>
                        ❌ {uploadError}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="submit"
                        disabled={uploadingImage || !newImageFile}
                        className="admin-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            جاري الرفع...
                          </>
                        ) : (
                          'رفع وحفظ الصورة'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ══════════════ TAB: VIDEOS ══════════════ */}
            {activeTab === 'videos' && (
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {videos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    <Video size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                    <p>لا توجد فيديوهات لهذا المنتج</p>
                  </div>
                ) : videos.map((vid, i) => {
                  const src = resolveUrl(vid.videoUrl) || '';
                  return (
                    <div key={vid.id} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--admin-border)', background: 'var(--admin-bg-dark)' }}>
                      <video controls style={{ width: '100%', maxHeight: 300, display: 'block', background: '#000' }} preload="metadata">
                        <source src={src} />
                        متصفحك لا يدعم الفيديو.
                      </video>
                      <div style={{ padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{vid.altText || `فيديو ${i + 1}`}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>ID: {vid.id} · ترتيب: {vid.displayOrder}</div>
                        </div>
                        <a href={src} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.77rem', textDecoration: 'none' }}>
                          <ExternalLink size={13}/> فتح
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══════════════ TAB: CURRENT DESIGN ══════════════ */}
            {activeTab === 'design' && (
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {!product.pageDesignId ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    <Palette size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                    <p>لم يُعيَّن تصميم مخصص لهذا المنتج</p>
                    <button className="admin-btn" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('create-design')}>🎨 إنشاء تصميم الآن</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.3)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                      <Palette size={18} style={{ color: '#6366f1' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#6366f1' }}>تصميم مخصص مفعّل</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Design ID: #{product.pageDesignId}</div>
                      </div>
                    </div>
                    {product.pageDesign && (
                      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--admin-border)', height: 420 }}>
                        <iframe srcDoc={product.pageDesign} style={{ width: '100%', height: '100%', border: 'none' }} title="معاينة التصميم" sandbox="allow-same-origin allow-scripts" />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ══════════════ TAB: AI CONTEXT ══════════════ */}
            {activeTab === 'ai' && (
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Header info */}
                <div style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 10, padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <Bot size={16} style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.9rem' }}>بيانات جاهزة لنموذج AI</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--admin-text-muted)', lineHeight: 1.6 }}>
                    انسخ البيانات أدناه وأعطها لنموذج الذكاء الاصطناعي مع طلب إنشاء صفحة HTML للمنتج. ثم ارجع لتبويب <strong style={{ color: '#6366f1' }}>🎨 إنشاء تصميم</strong> وألصق الكود الناتج.
                  </p>
                </div>

                {/* AI Prompt — full copy */}
                <div style={{ border: '1px solid var(--admin-border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.9rem', background: 'var(--admin-bg-dark)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--admin-text-main)' }}>🤖 Prompt جاهز للنسخ (أرسله مباشرة للـ AI)</span>
                    <CopyBtn text={AI_PROMPT} label="نسخ الـ Prompt كاملاً" />
                  </div>
                  <pre style={{ margin: 0, padding: '0.9rem 1rem', fontSize: '0.7rem', lineHeight: 1.65, color: '#e2e8f0', background: '#0d1117', maxHeight: 220, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    {AI_PROMPT}
                  </pre>
                </div>

                {/* Individual JSON sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <JsonBlock title={`📦 المنتج الرئيسي — GET /api/Product/${productId}`} data={{
                    ...product, images: undefined, videos: undefined, pageDesign: undefined,
                    _note: 'pageDesign HTML omitted for brevity'
                  }} defaultOpen />
                  <JsonBlock title={`🖼 الصور (${images.length}) — product.images`} data={product.images ?? []} />
                  <JsonBlock title={`🎬 الفيديوهات (${videos.length}) — product.videos`} data={videos} />
                  <JsonBlock title={`⭐ التقييمات (${reviews.length}) — GET /api/Review?productId=${productId}`} data={reviews} />
                  <JsonBlock title={`📊 المخزون — GET /api/Inventory?productId=${productId}`} data={inventory} />
                </div>

                {/* Copy everything at once */}
                <div style={{ background: 'var(--admin-bg-dark)', borderRadius: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>نسخ كل البيانات دفعة واحدة</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>JSON كامل: المنتج + الصور + الفيديوهات + التقييمات + المخزون</div>
                  </div>
                  <CopyBtn text={buildAiContext()} label="📋 نسخ الكل" />
                </div>
              </div>
            )}

            {/* ══════════════ TAB: CREATE DESIGN ══════════════ */}
            {activeTab === 'create-design' && (
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Workflow hint */}
                <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 10, padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--admin-text-muted)', lineHeight: 1.7 }}>
                  <strong style={{ color: '#22c55e' }}>الخطوات:</strong> ① اذهب لتبويب <strong>🤖 سياق AI</strong> وانسخ الـ Prompt → ② أرسله للـ AI واحصل على الـ HTML → ③ الصق الكود هنا واضغط إرسال
                </div>

                <form onSubmit={handleCreateDesign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Name */}
                  <div>
                    <label style={labelStyle}>اسم التصميم *</label>
                    <input type="text" required style={inputStyle} value={designName}
                      onChange={e => setDesignName(e.target.value)}
                      placeholder={`تصميم ${product.name}`} />
                  </div>

                  {/* HTML */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>HTML Template * (الصق كود HTML الكامل هنا)</label>
                      {designHtml && <CopyBtn text={designHtml} label="نسخ" />}
                    </div>
                    <textarea
                      required rows={12}
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.72rem', resize: 'vertical', lineHeight: 1.55 }}
                      value={designHtml}
                      onChange={e => setDesignHtml(e.target.value)}
                      placeholder={'<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>...</head>\n<body>...</body>\n</html>'}
                    />
                    <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', marginTop: '0.3rem' }}>
                      المتغيرات المتاحة: {'{{name}} {{mainImageUrl}} {{basePrice}} {{salePrice}} {{description}} {{brandName}} {{subCategoryName}} {{sku}} {{id}}'}
                    </div>
                  </div>

                  {/* CSS (optional) */}
                  <div>
                    <label style={labelStyle}>CSS إضافي (اختياري — إذا أرجع الـ AI CSS منفصل)</label>
                    <textarea
                      rows={5}
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.72rem', resize: 'vertical', lineHeight: 1.55 }}
                      value={designCss}
                      onChange={e => setDesignCss(e.target.value)}
                      placeholder="/* أضف CSS إضافي هنا إن وجد */"
                    />
                  </div>

                  {/* POST body preview */}
                  <details style={{ fontSize: '0.75rem' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--admin-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      👁 معاينة Body المرسل لـ POST /api/PageDesign
                    </summary>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.3rem' }}>
                      <CopyBtn text={postBodyPreview()} label="نسخ الـ Body" />
                    </div>
                    <pre style={{ background: '#0d1117', color: '#a5f3fc', padding: '0.9rem', borderRadius: 8, fontSize: '0.7rem', overflowX: 'auto', maxHeight: 220, margin: 0 }}>
                      {postBodyPreview()}
                    </pre>
                  </details>

                  {/* Live HTML preview */}
                  {designHtml && (
                    <details>
                      <summary style={{ cursor: 'pointer', color: 'var(--admin-text-muted)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                        🖼 معاينة حية للـ HTML
                      </summary>
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--admin-border)', height: 380 }}>
                        <iframe
                          srcDoc={designHtml}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          title="HTML preview"
                          sandbox="allow-same-origin allow-scripts"
                        />
                      </div>
                    </details>
                  )}

                  {/* Result */}
                  {designResult && (
                    <div style={{
                      borderRadius: 8, padding: '0.8rem 1rem',
                      background: designResult.success ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
                      border: `1px solid ${designResult.success ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                      color: designResult.success ? '#22c55e' : '#ef4444',
                      fontWeight: 600, fontSize: '0.85rem',
                    }}>
                      {designResult.message}
                    </div>
                  )}

                  {/* Submit */}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="admin-btn outline" onClick={() => { setDesignHtml(''); setDesignCss(''); setDesignResult(null); }}>
                      مسح
                    </button>
                    <button type="submit" className="admin-btn" disabled={designSaving || !designHtml.trim()}
                      style={{ background: designSaving ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {designSaving
                        ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/> جاري الإرسال...</>
                        : <><Send size={15}/> إرسال لـ /api/PageDesign وربط بالمنتج</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ══════════════ TAB: INVENTORY ══════════════ */}
            {activeTab === 'inventory' && (
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <form onSubmit={handleInventorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Current stats */}
                  {inventory && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      {[
                        { label: 'الكمية الكلية', value: inventory.quantity, color: 'var(--admin-text-main)' },
                        { label: 'محجوز', value: inventory.reservedQuantity, color: '#f59e0b' },
                        { label: 'متاح', value: inventory.availableQuantity, color: '#22c55e' },
                      ].map(stat => (
                        <div key={stat.label} style={{ background: 'var(--admin-bg-dark)', borderRadius: 8, padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quantity */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>الكمية (quantity) *</label>
                      <input
                        type="number" min={0} required
                        style={inputStyle}
                        value={invForm.quantity}
                        onChange={e => setInvForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>حد المخزون المنخفض</label>
                      <input
                        type="number" min={0}
                        style={inputStyle}
                        value={invForm.lowStockThreshold}
                        onChange={e => setInvForm(f => ({ ...f, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  {/* Variant ID (optional) */}
                  <div>
                    <label style={labelStyle}>Variant ID (اختياري)</label>
                    <input
                      type="number" min={0}
                      style={inputStyle}
                      placeholder="0 = بدون متغير"
                      value={invForm.variantId}
                      onChange={e => setInvForm(f => ({ ...f, variantId: e.target.value }))}
                    />
                  </div>

                  {/* Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'var(--admin-bg-dark)', padding: '1rem', borderRadius: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={invForm.trackInventory}
                        onChange={e => setInvForm(f => ({ ...f, trackInventory: e.target.checked }))}
                      />
                      <span style={{ fontSize: '0.88rem' }}>تتبع المخزون (trackInventory)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={invForm.allowBackorder}
                        onChange={e => setInvForm(f => ({ ...f, allowBackorder: e.target.checked }))}
                      />
                      <span style={{ fontSize: '0.88rem' }}>السماح بالطلب عند نفاد المخزون (allowBackorder)</span>
                    </label>
                  </div>

                  {/* Feedback */}
                  {invError && (
                    <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid var(--admin-danger)', borderRadius: 8, padding: '0.7rem 1rem', color: 'var(--admin-danger)', fontSize: '0.85rem' }}>
                      ❌ {invError}
                    </div>
                  )}
                  {invSuccess && (
                    <div style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 8, padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>تم تحديث المخزون بنجاح! ✅</span>
                    </div>
                  )}

                  {/* Submit */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" className="admin-btn" disabled={invSaving}
                      style={{ background: invSaving ? undefined : 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {invSaving
                        ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/> جاري الحفظ...</>
                        : '✔ حفظ المخزون'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Footer ── */}
            <div style={{
              position: 'sticky', bottom: 0, padding: '0.9rem 1.5rem',
              borderTop: '1px solid var(--admin-border)',
              background: 'var(--admin-bg-panel)',
              display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
            }}>
              <button className="admin-btn outline" onClick={onClose} style={{ fontSize: '0.85rem' }}>إغلاق</button>
              <button className="admin-btn" onClick={() => { onEdit(product); onClose(); }} style={{ fontSize: '0.85rem' }}>✏️ تعديل المنتج</button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};
