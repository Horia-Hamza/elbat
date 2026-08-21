import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Trash2, Loader2, ChevronDown, ChevronRight,
  Package, Search, RefreshCw, CheckCircle, XCircle, X,
} from 'lucide-react';
import { productsApi, inventoryApi } from '../../api/products';
import { productVariantsApi } from '../../api/productVariants';
import { IMAGES_BASE_URL } from '../../api/client';
import type { ApiProduct, ProductVariant, VariantType } from '../../types/api';
import { VARIANT_TYPE_LABELS } from '../../types/api';

/* ─── Shared styles ────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 0.9rem', borderRadius: 8,
  border: '1px solid var(--admin-border)',
  backgroundColor: 'var(--admin-bg-dark)',
  color: 'white', boxSizing: 'border-box', fontSize: '0.875rem',
};
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.4rem',
  color: 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600,
};

/* ─── Default add-variant form values ──────────────────────── */
const defaultForm = {
  name: '', value: '', sku: '',
  priceAdjustment: 0, type: 1 as VariantType,
  isActive: true, quantity: 0,
  lowStockThreshold: 5, trackInventory: true, allowBackorder: false,
};

/* ═══════════════════════════════════════════════════════════ */
export const AdminVariants: React.FC = () => {
  /* Products & Variants list */
  const [products, setProducts]       = useState<ApiProduct[]>([]);
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode]   = useState<'hasVariants' | 'all'>('hasVariants');

  /* Expanded product ID */
  const [expandedId, setExpandedId]   = useState<number | null>(null);

  /* Add-variant modal */
  const [modal, setModal] = useState<{ open: boolean; productId: number; productName: string }>({
    open: false, productId: 0, productName: '',
  });
  const [form, setForm]           = useState({ ...defaultForm });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk]       = useState(false);

  /* ── Fetch products and all variants (both overall & per-product for 100% coverage) ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, varRes] = await Promise.allSettled([
        productsApi.getProducts({ pageNumber: 1, pageSize: 200 }),
        productVariantsApi.getAll(),
      ]);

      const prods: ApiProduct[] = prodRes.status === 'fulfilled' ? (prodRes.value.items ?? (prodRes.value as any) ?? []) : [];
      let vars: ProductVariant[] = varRes.status === 'fulfilled' && Array.isArray(varRes.value) ? varRes.value : [];

      /* Bulk fetch per product to guarantee coverage if /api/ProductVariant without params behaves differently */
      if (prods.length > 0) {
        const subFetches = await Promise.allSettled(
          prods.map(p => productVariantsApi.getByProduct(p.id))
        );
        for (const sf of subFetches) {
          if (sf.status === 'fulfilled' && Array.isArray(sf.value)) {
            for (const v of sf.value) {
              if (!vars.some(existing => existing.id === v.id)) {
                vars.push(v);
              }
            }
          }
        }
      }

      setProducts(prods);
      setVariantsList(vars);
    } catch {
      setProducts([]);
      setVariantsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* Group variants by productId (coercing to Number for safety) */
  const variantsByProduct = React.useMemo(() => {
    const map: Record<number, ProductVariant[]> = {};
    for (const v of variantsList) {
      const pId = Number(v.productId);
      if (!pId) continue;
      if (!map[pId]) map[pId] = [];
      map[pId].push(v);
    }
    return map;
  }, [variantsList]);

  /* ── Toggle row expansion and fetch latest variants for that product ── */
  const handleToggle = async (productId: number) => {
    if (expandedId === productId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(productId);

    try {
      const fetched = await productVariantsApi.getByProduct(productId);
      if (Array.isArray(fetched)) {
        setVariantsList(prev => {
          const otherVars = prev.filter(v => Number(v.productId) !== Number(productId));
          return [...otherVars, ...fetched];
        });
      }
    } catch (err) {
      console.error('Failed to fetch variants for product', productId, err);
    }
  };

  /* ── Open add-variant modal ── */
  const openAddModal = (product: ApiProduct) => {
    setModal({ open: true, productId: product.id, productName: product.name });
    setForm({ ...defaultForm });
    setSaveError(null);
    setSaveOk(false);
  };

  /* ── Submit new variant ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      const created = await productVariantsApi.create({
        ...form,
        productId: modal.productId,
        sku: form.sku || undefined,
      });

      setVariantsList(prev => [...prev, created]);
      setSaveOk(true);
      setExpandedId(modal.productId);
      setForm({ ...defaultForm });
    } catch (err: any) {
      setSaveError(err?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete variant (inventory first, then variant) ── */
  const handleDelete = async ( variant: ProductVariant) => {
    if (!window.confirm(`هل أنت متأكد من حذف المتغير "${variant.name}"؟\nسيتم حذف بيانات المخزون المرتبطة به أيضاً.`)) return;
    try {
      if (variant.inventory?.id) {
        try {
          await inventoryApi.deleteInventory(variant.inventory.id);
        } catch (invErr: any) {
          console.warn('تحذير: فشل حذف المخزون:', invErr?.message);
        }
      }
      await productVariantsApi.delete(variant.id);
      setVariantsList(prev => prev.filter(v => v.id !== variant.id));
    } catch (err: any) {
      alert(err?.message || 'فشل حذف المتغير');
    }
  };

  /* ── Filtered products list ── */
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id).includes(searchQuery);
      const hasVars = (variantsByProduct[p.id]?.length ?? 0) > 0;
      if (filterMode === 'hasVariants') return matchesSearch && hasVars;
      return matchesSearch;
    });
  }, [products, searchQuery, filterMode, variantsByProduct]);


  return (
    <div>
      {/* ── Page header ── */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={22} style={{ color: 'var(--admin-primary)' }} />
            <h3 style={{ margin: 0, color: 'var(--admin-text-main)' }}>إدارة متغيرات المنتجات</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--admin-bg-dark)', padding: '3px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <button
                type="button"
                onClick={() => setFilterMode('hasVariants')}
                style={{
                  padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  backgroundColor: filterMode === 'hasVariants' ? 'var(--admin-primary)' : 'transparent',
                  color: filterMode === 'hasVariants' ? 'white' : 'var(--admin-text-muted)',
                }}
              >
                المنتجات التي تحتوي على متغيرات
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                style={{
                  padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  backgroundColor: filterMode === 'all' ? 'var(--admin-primary)' : 'transparent',
                  color: filterMode === 'all' ? 'white' : 'var(--admin-text-muted)',
                }}
              >
                جميع المنتجات ({products.length})
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, width: 200, paddingRight: '2.2rem' }}
              />
            </div>
            <button
              className="admin-btn outline"
              onClick={fetchData}
              title="تحديث القائمة"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem' }}
            >
              <RefreshCw size={14} /> تحديث
            </button>
          </div>
        </div>
      </div>

      {/* ── Products list ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--admin-text-muted)' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
          <p>جاري تحميل المتغيرات والمنتجات...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
          <Package size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p>{filterMode === 'hasVariants' ? 'لا توجد منتجات تحتوي على متغيرات حالياً.' : 'لا توجد منتجات مطابقة للبحث.'}</p>
          {filterMode === 'hasVariants' && (
            <button
              className="admin-btn outline"
              onClick={() => setFilterMode('all')}
              style={{ marginTop: '0.75rem' }}
            >
              عرض جميع المنتجات لإضافة متغيرات
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredProducts.map(product => {
            const isExpanded = expandedId === product.id;
            const variants   = variantsByProduct[product.id] ?? [];

            return (
              <div key={product.id} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>

                {/* Product row (clickable header) */}
                <div
                  onClick={() => handleToggle(product.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.85rem 1.25rem', cursor: 'pointer',
                    background: isExpanded ? 'rgba(99,102,241,.07)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--admin-border)' : 'none',
                    transition: 'background .15s',
                    userSelect: 'none',
                  }}
                >
                  {/* Expand icon */}
                  <span style={{ color: 'var(--admin-primary)', flexShrink: 0 }}>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>

                  {/* Product image */}
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--admin-bg-dark)', border: '1px solid var(--admin-border)' }}>
                    {product.mainImageUrl
                      ? <img src={`${IMAGES_BASE_URL}${product.mainImageUrl}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} style={{ color: 'var(--admin-text-muted)' }} /></div>
                    }
                  </div>

                  {/* Name + id */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--admin-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>#{product.id} · {product.subCategoryName || '—'}</div>
                  </div>

                  {/* Variant count badge */}
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '3px 12px', borderRadius: 12,
                    background: variants.length > 0 ? 'rgba(99,102,241,.18)' : 'var(--admin-bg-dark)',
                    color: variants.length > 0 ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
                    border: variants.length > 0 ? '1px solid rgba(99,102,241,.3)' : '1px solid var(--admin-border)',
                    flexShrink: 0,
                  }}>
                    {variants.length > 0 ? `${variants.length} متغيرات` : 'بدون متغيرات'}
                  </span>

                  {/* Add button */}
                  <button
                    className="admin-btn"
                    onClick={e => { e.stopPropagation(); openAddModal(product); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', fontSize: '0.8rem', flexShrink: 0 }}
                  >
                    <Plus size={14} /> إضافة متغير
                  </button>
                </div>

                {/* Expanded variants section */}
                {isExpanded && (
                  <div style={{ padding: '1rem 1.25rem', background: 'rgba(0,0,0,.15)' }}>

                    {/* No variant yet */}
                    {variants.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                        <Layers size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <p style={{ margin: '0 0 0.75rem' }}>هذا المنتج ليس لديه متغيرات بعد.</p>
                        <button
                          className="admin-btn"
                          onClick={e => { e.stopPropagation(); openAddModal(product); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                        >
                          <Plus size={14} /> أضف متغير الآن
                        </button>
                      </div>
                    )}

                    {/* Variants list for this product */}
                    {variants.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                        {variants.map(v => {
                          const typeLabel  = VARIANT_TYPE_LABELS[v.type] ?? `نوع ${v.type}`;
                          const isColor    = v.type === 1 && (/^#[0-9A-Fa-f]{3,6}$/.test(v.value) || /^[0-9A-Fa-f]{6}$/.test(v.value));
                          const colorHex   = isColor ? (v.value.startsWith('#') ? v.value : `#${v.value}`) : null;
                          const stock      = v.inventory;
                          const stockColor = !stock ? '#9ca3af' : stock.isOutOfStock ? '#ef4444' : stock.isLowStock ? '#f59e0b' : '#22c55e';
                          return (
                            <div key={v.id} style={{
                              background: 'var(--admin-bg-panel)', borderRadius: 10,
                              border: '1px solid var(--admin-border)',
                              padding: '0.8rem 1rem',
                              display: 'flex', flexDirection: 'column', gap: '0.55rem',
                            }}>
                              {/* Top row: swatch/badge + name + delete */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                {colorHex
                                  ? <div style={{ width: 28, height: 28, borderRadius: 6, background: colorHex, border: '2px solid var(--admin-border)', flexShrink: 0 }} title={v.value} />
                                  : (
                                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'white' }}>{v.value.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                  )
                                }
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                                  <div style={{ fontSize: '0.68rem', color: '#a5b4fc', background: 'rgba(99,102,241,.12)', display: 'inline-block', padding: '1px 6px', borderRadius: 8, marginTop: 2 }}>{typeLabel}</div>
                                </div>
                                <button
                                  onClick={() => handleDelete( v)}
                                  title="حذف المتغير والمخزون المرتبط به"
                                  style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Details */}
                              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div>القيمة: <strong style={{ color: 'var(--admin-text-main)' }}>{v.value}</strong></div>
                                {v.sku && <div>SKU: <code style={{ color: 'var(--admin-primary)', fontSize: '0.72rem' }}>{v.sku}</code></div>}
                                {v.priceAdjustment !== 0 && (
                                  <div>تعديل السعر: <strong style={{ color: v.priceAdjustment > 0 ? '#22c55e' : '#ef4444' }}>{v.priceAdjustment > 0 ? '+' : ''}{v.priceAdjustment} ج.م</strong></div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                                  <span style={{ color: stockColor, fontWeight: 700 }}>●</span>
                                  {stock
                                    ? <span>المخزون: <strong style={{ color: stockColor }}>{stock.availableQuantity} / {stock.quantity}</strong></span>
                                    : <span style={{ color: '#f59e0b' }}>⚠ لا توجد بيانات مخزون</span>
                                  }
                                </div>
                              </div>

                              {/* Status badge */}
                              <div>
                                {v.isActive
                                  ? <span style={{ fontSize: '0.68rem', background: 'rgba(34,197,94,.12)', color: '#22c55e', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>✓ نشط</span>
                                  : <span style={{ fontSize: '0.68rem', background: 'rgba(239,68,68,.1)', color: '#ef4444', padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>✗ مخفي</span>
                                }
                                <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', marginRight: '0.5rem' }}>#{v.id}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


      {/* ══ Add Variant Modal ══════════════════════════════════ */}
      {modal.open && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(3px)', padding: '1rem',
        }}>
          <div style={{
            background: 'var(--admin-bg-panel)', borderRadius: 16,
            width: '100%', maxWidth: 520, maxHeight: '90vh',
            overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'fadeScaleIn 0.2s ease',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--admin-border)',
              position: 'sticky', top: 0, background: 'var(--admin-bg-panel)', zIndex: 10,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} style={{ color: 'var(--admin-primary)' }} />
                  إضافة متغير جديد
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.15rem' }}>
                  للمنتج: <strong style={{ color: 'var(--admin-primary)' }}>{modal.productName}</strong> (#{modal.productId})
                </div>
              </div>
              <button
                onClick={() => setModal(m => ({ ...m, open: false }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', borderRadius: 8, padding: '0.3rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Type */}
              <div>
                <label style={labelStyle}>نوع المتغير *</label>
                <select
                  required
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: parseInt(e.target.value) as VariantType }))}
                >
                  {([1, 2, 3, 4, 5] as VariantType[]).map(t => (
                    <option key={t} value={t}>{VARIANT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Name + Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>الاسم * <span style={{ opacity: 0.6, fontWeight: 400 }}>(مثال: أحمر)</span></label>
                  <input
                    required style={inputStyle} placeholder="مثال: أحمر"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>القيمة * <span style={{ opacity: 0.6, fontWeight: 400 }}>(مثال: #FF0000)</span></label>
                  <input
                    required style={inputStyle} placeholder="مثال: #FF0000"
                    value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  />
                </div>
              </div>

              {/* Live color preview */}
              {form.type === 1 && /^#[0-9A-Fa-f]{3,6}$/.test(form.value) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--admin-text-muted)', background: 'var(--admin-bg-dark)', borderRadius: 8, padding: '0.5rem 0.8rem' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: form.value, border: '2px solid var(--admin-border)' }} />
                  معاينة اللون: <strong style={{ color: 'var(--admin-text-main)' }}>{form.value}</strong>
                </div>
              )}

              {/* SKU + Price Adjustment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>SKU <span style={{ opacity: 0.6, fontWeight: 400 }}>(اختياري)</span></label>
                  <input
                    style={inputStyle} placeholder="مثال: SHIRT-RED"
                    value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>تعديل السعر (ج.م) <span style={{ opacity: 0.6, fontWeight: 400 }}>(+ أو -)</span></label>
                  <input
                    type="number" style={inputStyle} placeholder="0"
                    value={form.priceAdjustment}
                    onChange={e => setForm(f => ({ ...f, priceAdjustment: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Quantity + Low-stock threshold */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>الكمية المتاحة *</label>
                  <input
                    type="number" min={0} required style={inputStyle} placeholder="100"
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>حد المخزون المنخفض</label>
                  <input
                    type="number" min={0} style={inputStyle} placeholder="5"
                    value={form.lowStockThreshold}
                    onChange={e => setForm(f => ({ ...f, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', background: 'var(--admin-bg-dark)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                {([
                  { key: 'isActive',       label: 'نشط' },
                  { key: 'trackInventory', label: 'تتبع المخزون' },
                  { key: 'allowBackorder', label: 'الطلب المسبق' },
                ] as const).map(cb => (
                  <label key={cb.key} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={form[cb.key] as boolean}
                      onChange={e => setForm(f => ({ ...f, [cb.key]: e.target.checked }))}
                    />
                    {cb.label}
                  </label>
                ))}
              </div>

              {/* Messages */}
              {saveError && (
                <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid var(--admin-danger)', borderRadius: 8, padding: '0.7rem 1rem', color: 'var(--admin-danger)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={16} /> {saveError}
                </div>
              )}
              {saveOk && (
                <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.4)', borderRadius: 8, padding: '0.7rem 1rem', color: '#22c55e', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> تم إضافة المتغير بنجاح!
                </div>
              )}

              {/* Footer buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem', borderTop: '1px solid var(--admin-border)', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className="admin-btn outline"
                  onClick={() => setModal(m => ({ ...m, open: false }))}
                >
                  {saveOk ? 'إغلاق' : 'إلغاء'}
                </button>
                {!saveOk ? (
                  <button
                    type="submit"
                    disabled={saving}
                    className="admin-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 130 }}
                  >
                    {saving
                      ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> جاري الحفظ...</>
                      : <><Layers size={14} /> إضافة المتغير</>
                    }
                  </button>
                ) : (
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => { setSaveOk(false); setForm({ ...defaultForm }); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Plus size={14} /> إضافة متغير آخر لهذا المنتج
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVariants;
