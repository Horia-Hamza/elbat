import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { pageDesignsApi } from '../../api/pageDesigns';
import type { ApiPageDesign } from '../../api/pageDesigns';
import {
  Palette, CheckCircle, Loader, ArrowRight, Package,
  Code2, Eye, X, RefreshCw, Plus, ChevronDown, ChevronUp,
  Globe, Tag as TagIcon, Trash2, Link as LinkIcon,
} from 'lucide-react';
import { PAGE_TEMPLATES } from '../../constants/pageTemplates';

// ── Styles ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '6px',
  border: '1px solid var(--admin-border)',
  backgroundColor: 'var(--admin-bg-dark)',
  color: 'white',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.4rem',
  color: 'var(--admin-text-muted)',
  fontSize: '0.82rem',
  fontWeight: 600,
};

const codeStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: '"Fira Code","Cascadia Code","Consolas",monospace',
  fontSize: '0.78rem',
  resize: 'vertical',
  lineHeight: 1.6,
  whiteSpace: 'pre',
  overflowX: 'auto',
};

const TARGET_TYPE_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'عام',     color: '#6b7280' },
  1: { label: 'تصنيف',   color: '#f59e0b' },
  2: { label: 'منتج',    color: '#6366f1' },
  3: { label: 'صفحة',   color: '#10b981' },
};

// ── Main Component ──────────────────────────────────────────────
export const AdminPageDesigns: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts({ pageNumber: 1, pageSize: 200 });
  const { categories } = useCategories();

  // ── Designs list ─────────────────────────────────────────────
  const [designs, setDesigns] = useState<ApiPageDesign[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [previewDesign, setPreviewDesign] = useState<ApiPageDesign | null>(null);

  // States for row assignments
  const [rowProductIds, setRowProductIds] = useState<Record<number, number>>({});
  const [rowCategoryIds, setRowCategoryIds] = useState<Record<number, number>>({});
  const [rowActions, setRowActions] = useState<Record<number, { loading?: boolean; error?: string | null; success?: string | null }>>({});

  const fetchDesigns = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await pageDesignsApi.getAll();
      setDesigns(data || []);
    } catch (err: any) {
      setListError(err?.message || 'فشل تحميل التصاميم');
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { fetchDesigns(); }, [fetchDesigns]);

  // ── Create form ──────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(
    productId ? parseInt(productId) : 0
  );
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState<number>(2);
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [cssStyles, setCssStyles] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [assignToProduct, setAssignToProduct] = useState<boolean>(!!productId);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // open form automatically if navigated with a productId
  useEffect(() => {
    if (productId) setShowForm(true);
  }, [productId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const resetForm = () => {
    setName(''); setHtmlTemplate(''); setCssStyles('');
    setIsActive(true); setIsDefault(false);
    setSelectedProductId(0); setAssignToProduct(false);
    setDone(false); setFormError(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setFormError('يرجى إدخال اسم للتصميم'); return; }
    if (!htmlTemplate.trim()) { setFormError('يرجى إدخال كود HTML'); return; }
    if (assignToProduct && (!selectedProductId || selectedProductId <= 0)) {
      setFormError('يرجى اختيار منتج للربط'); return;
    }
    setSaving(true); setFormError(null);
    try {
      await pageDesignsApi.create({
        name: name.trim(),
        targetType,
        htmlTemplate: htmlTemplate.trim(),
        cssStyles: cssStyles.trim() || '',
        isActive,
        isDefault,
      });
      if (assignToProduct && selectedProductId > 0) {
        // Fetch all designs to resolve the ID (index + 1) of the newly created one
        const allDesigns = await pageDesignsApi.getAll();
        const createdIdx = allDesigns.map(d => d.name).lastIndexOf(name.trim());
        const calculatedId = createdIdx !== -1 ? createdIdx + 1 : null;

        if (calculatedId) {
          await pageDesignsApi.assignProduct({
            targetId: selectedProductId,
            pageDesignId: calculatedId,
          });
        } else {
          throw new Error('فشل العثور على التصميم بعد إنشائه لتحديد معرف الربط.');
        }
      }
      setDone(true);
      fetchDesigns(); // refresh list
    } catch (err: any) {
      setFormError(err?.message || 'حدث خطأ أثناء الإنشاء');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignProduct = async (idx: number, designId: number, targetId: number) => {
    if (!targetId || targetId <= 0) {
      setRowActions(prev => ({ ...prev, [idx]: { error: 'يرجى اختيار منتج' } }));
      return;
    }
    setRowActions(prev => ({ ...prev, [idx]: { loading: true } }));
    try {
      await pageDesignsApi.assignProduct({ targetId, pageDesignId: designId });
      setRowActions(prev => ({
        ...prev,
        [idx]: { success: 'تم ربط المنتج بالتصميم بنجاح! 🚀' }
      }));
      setTimeout(() => {
        setRowActions(prev => ({ ...prev, [idx]: {} }));
      }, 3000);
    } catch (err: any) {
      setRowActions(prev => ({
        ...prev,
        [idx]: { error: err?.message || 'فشل الربط بالمنتج' }
      }));
    }
  };

  const handleAssignCategory = async (idx: number, designId: number, targetId: number) => {
    if (!targetId || targetId <= 0) {
      setRowActions(prev => ({ ...prev, [idx]: { error: 'يرجى اختيار تصنيف' } }));
      return;
    }
    setRowActions(prev => ({ ...prev, [idx]: { loading: true } }));
    try {
      await pageDesignsApi.assignCategory({ targetId, pageDesignId: designId });
      setRowActions(prev => ({
        ...prev,
        [idx]: { success: 'تم ربط التصنيف بالتصميم بنجاح! 🚀' }
      }));
      setTimeout(() => {
        setRowActions(prev => ({ ...prev, [idx]: {} }));
      }, 3000);
    } catch (err: any) {
      setRowActions(prev => ({
        ...prev,
        [idx]: { error: err?.message || 'فشل الربط بالتصنيف' }
      }));
    }
  };

  const handleDeleteDesign = async (idx: number, designId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التصميم؟')) {
      setRowActions(prev => ({ ...prev, [idx]: { loading: true } }));
      try {
        await pageDesignsApi.delete(designId);
        fetchDesigns(); // refresh list
      } catch (err: any) {
        setRowActions(prev => ({
          ...prev,
          [idx]: { error: err?.message || 'فشل حذف التصميم' }
        }));
      }
    }
  };


  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="admin-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Palette size={22} style={{ color: 'var(--admin-primary)' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>تصميم الصفحات</h2>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              عرض وإنشاء قوالب HTML لصفحات المنتجات
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className="admin-btn outline"
            onClick={() => fetchDesigns()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} />
            تحديث
          </button>
          <button
            className="admin-btn"
            onClick={() => { setShowForm(f => !f); if (done) resetForm(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <Plus size={14} />
            تصميم جديد
            {showForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            className="admin-btn outline"
            onClick={() => navigate('/admin/products')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <ArrowRight size={14} />
            المنتجات
          </button>
        </div>
      </div>

      {/* ── Create Form (collapsible) ─────────────────────────── */}
      {showForm && (
        <div className="admin-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} style={{ color: 'var(--admin-primary)' }} />
              إنشاء تصميم جديد
            </h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* Left meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>جاهز اختيار قالب (اختياري)</label>
                <select
                  style={inputStyle}
                  disabled={saving || done}
                  onChange={(e) => {
                    const tplId = e.target.value;
                    if (tplId) {
                      const selectedTpl = PAGE_TEMPLATES.find(t => t.id === tplId);
                      if (selectedTpl) {
                        setName(selectedTpl.name);
                        setHtmlTemplate(selectedTpl.html);
                        setCssStyles(selectedTpl.css);
                      }
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">— اختر قالباً للبدء به —</option>
                  {PAGE_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.previewIcon} {t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>اسم التصميم *</label>
                <input type="text" style={inputStyle} value={name} disabled={saving || done}
                  onChange={e => setName(e.target.value)} placeholder="اسم التصميم" />
              </div>
              <div>
                <label style={labelStyle}>نوع الهدف (targetType)</label>
                <select style={inputStyle} value={targetType} disabled={saving || done}
                  onChange={e => setTargetType(parseInt(e.target.value))}>
                  <option value={1}>1 — تصنيف</option>
                  <option value={2}>2 — منتج</option>
                  <option value={3}>3 — صفحة</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.83rem' }}>
                  <input type="checkbox" checked={isActive} disabled={saving || done} onChange={e => setIsActive(e.target.checked)} />
                  isActive — مفعّل
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.83rem' }}>
                  <input type="checkbox" checked={isDefault} disabled={saving || done} onChange={e => setIsDefault(e.target.checked)} />
                  isDefault — افتراضي
                </label>
              </div>

              {/* Assign product toggle */}
              <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <input type="checkbox" checked={assignToProduct} disabled={saving || done}
                    onChange={e => setAssignToProduct(e.target.checked)} />
                  <Package size={14} style={{ color: 'var(--admin-primary)' }} />
                  ربط بمنتج
                </label>
                {assignToProduct && (
                  productsLoading
                    ? <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>جاري التحميل...</div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '220px', overflowY: 'auto' }}>
                        {products.map(p => (
                          <div key={p.id} onClick={() => !saving && !done && setSelectedProductId(p.id)}
                            style={{
                              padding: '0.5rem 0.65rem', borderRadius: '7px', cursor: 'pointer',
                              border: `1px solid ${selectedProductId === p.id ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                              background: selectedProductId === p.id ? 'rgba(99,102,241,0.08)' : 'var(--admin-bg-dark)',
                              fontSize: '0.8rem', fontWeight: selectedProductId === p.id ? 700 : 400,
                            }}>
                            {p.name} <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.68rem' }}>#{p.id}</span>
                          </div>
                        ))}
                      </div>
                )}
                {assignToProduct && selectedProduct && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-primary)', fontWeight: 700 }}>
                    ✔ {selectedProduct.name}
                  </div>
                )}
              </div>
            </div>

            {/* Right code editors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={labelStyle}><Code2 size={13} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />htmlTemplate *</label>
                  {htmlTemplate.trim() && (
                    <button onClick={() => setPreviewDesign({ name, targetType, htmlTemplate, cssStyles, isActive, isDefault })}
                      style={{ background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.25)', borderRadius: '6px', color: 'var(--admin-primary)', cursor: 'pointer', fontSize: '0.72rem', padding: '2px 9px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Eye size={11} /> معاينة
                    </button>
                  )}
                </div>
                <textarea rows={14} style={codeStyle} value={htmlTemplate} disabled={saving || done}
                  onChange={e => setHtmlTemplate(e.target.value)} spellCheck={false}
                  placeholder={'<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n...\n</html>'} />
                {htmlTemplate.length > 0 && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>{htmlTemplate.length.toLocaleString()} حرف</div>
                )}
              </div>
              <div>
                <label style={labelStyle}><Code2 size={13} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />cssStyles (اختياري)</label>
                <textarea rows={4} style={codeStyle} value={cssStyles} disabled={saving || done}
                  onChange={e => setCssStyles(e.target.value)} spellCheck={false}
                  placeholder="/* CSS إضافي */" />
              </div>

              {formError && (
                <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid var(--admin-danger)', borderRadius: '8px', padding: '0.7rem 1rem', color: 'var(--admin-danger)', fontSize: '0.83rem' }}>
                  ❌ {formError}
                </div>
              )}
              {done && (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)', borderRadius: '8px' }}>
                  <CheckCircle size={26} style={{ color: '#22c55e' }} />
                  <div style={{ color: '#22c55e', fontWeight: 700, marginTop: '0.3rem' }}>تم الإنشاء بنجاح! 🎉</div>
                  <button className="admin-btn" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }} onClick={resetForm}>+ تصميم جديد</button>
                </div>
              )}
              {!done && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button className="admin-btn outline" onClick={resetForm} disabled={saving} style={{ fontSize: '0.85rem' }}>مسح</button>
                  <button className="admin-btn" onClick={handleSubmit}
                    disabled={saving || !name.trim() || !htmlTemplate.trim()} style={{ minWidth: '140px', justifyContent: 'center', fontSize: '0.85rem' }}>
                    {saving
                      ? <><Loader size={14} style={{ display: 'inline', marginLeft: '5px', animation: 'spin 1s linear infinite' }} />جاري...</>
                      : '🚀 إنشاء التصميم'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Designs List ──────────────────────────────────────── */}
      <div className="admin-card">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>
            جميع التصاميم
            {!listLoading && <span style={{ marginRight: '0.5rem', fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontWeight: 400 }}>({designs.length} تصميم)</span>}
          </h3>
        </div>

        {listLoading && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
            <div>جاري التحميل...</div>
          </div>
        )}

        {listError && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-danger)' }}>❌ {listError}</div>
        )}

        {!listLoading && !listError && designs.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            لا توجد تصاميم بعد — أنشئ أول تصميم بالضغط على "تصميم جديد"
          </div>
        )}

        {!listLoading && !listError && designs.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>نوع الهدف</th>
                  <th>HTML</th>
                  <th>CSS</th>
                  <th>الحالة</th>
                  <th>افتراضي</th>
                  <th>ربط بمنتج أو تصنيف</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {designs.map((d, idx) => {
                  const typeInfo = TARGET_TYPE_LABELS[d.targetType] || { label: `${d.targetType}`, color: '#6b7280' };
                  const designId = idx + 1; // calculated design ID
                  const action = rowActions[idx] || {};

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.name || <span style={{ color: 'var(--admin-text-muted)', fontStyle: 'italic' }}>بدون اسم</span>}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: `${typeInfo.color}18`, color: typeInfo.color,
                          border: `1px solid ${typeInfo.color}40`,
                          borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700,
                        }}>
                          {d.targetType === 1 ? <TagIcon size={11} /> : d.targetType === 2 ? <Package size={11} /> : <Globe size={11} />}
                          {typeInfo.label}
                        </span>
                      </td>
                      <td>
                        {d.htmlTemplate ? (
                          <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>
                            ✔ {d.htmlTemplate.length.toLocaleString()} حرف
                          </span>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        {d.cssStyles && d.cssStyles !== 'string' ? (
                          <span style={{ fontSize: '0.75rem', color: '#a78bfa' }}>✔ {d.cssStyles.length.toLocaleString()} حرف</span>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        {d.isActive
                          ? <span className="admin-badge success">نشط</span>
                          : <span className="admin-badge neutral">معطّل</span>}
                      </td>
                      <td>
                        {d.isDefault
                          ? <span className="admin-badge success">✓ افتراضي</span>
                          : <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>—</span>}
                      </td>
                      <td>
                        {d.targetType === 2 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <select
                                style={{
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid var(--admin-border)',
                                  backgroundColor: 'var(--admin-bg-dark)',
                                  color: 'white',
                                  fontSize: '0.78rem',
                                  boxSizing: 'border-box',
                                  width: '150px'
                                }}
                                value={rowProductIds[idx] || ''}
                                onChange={e => setRowProductIds(prev => ({ ...prev, [idx]: parseInt(e.target.value) || 0 }))}
                                disabled={action.loading}
                              >
                                <option value="">— اختر منتج للربط —</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>
                                ))}
                              </select>
                              <button
                                className="admin-btn"
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                onClick={() => handleAssignProduct(idx, designId, rowProductIds[idx] || 0)}
                                disabled={action.loading || !rowProductIds[idx]}
                              >
                                {action.loading ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <LinkIcon size={11} />}
                                ربط
                              </button>
                            </div>
                            {action.success && (
                              <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>{action.success}</div>
                            )}
                            {action.error && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--admin-danger)', fontWeight: 600 }}>❌ {action.error}</div>
                            )}
                          </div>
                        ) : d.targetType === 1 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <select
                                style={{
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid var(--admin-border)',
                                  backgroundColor: 'var(--admin-bg-dark)',
                                  color: 'white',
                                  fontSize: '0.78rem',
                                  boxSizing: 'border-box',
                                  width: '150px'
                                }}
                                value={rowCategoryIds[idx] || ''}
                                onChange={e => setRowCategoryIds(prev => ({ ...prev, [idx]: parseInt(e.target.value) || 0 }))}
                                disabled={action.loading}
                              >
                                <option value="">— اختر تصنيف للربط —</option>
                                {categories.map(c => (
                                  <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>
                                ))}
                              </select>
                              <button
                                className="admin-btn"
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                onClick={() => handleAssignCategory(idx, designId, rowCategoryIds[idx] || 0)}
                                disabled={action.loading || !rowCategoryIds[idx]}
                              >
                                {action.loading ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <LinkIcon size={11} />}
                                ربط
                              </button>
                            </div>
                            {action.success && (
                              <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>{action.success}</div>
                            )}
                            {action.error && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--admin-danger)', fontWeight: 600 }}>❌ {action.error}</div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {d.htmlTemplate && (
                            <button
                              className="admin-icon-btn"
                              title="معاينة HTML"
                              style={{ color: 'var(--admin-primary)' }}
                              onClick={() => setPreviewDesign(d)}
                              disabled={action.loading}
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button
                            className="admin-icon-btn"
                            title="حذف التصميم"
                            style={{ color: 'var(--admin-danger)' }}
                            onClick={() => handleDeleteDesign(idx, designId)}
                            disabled={action.loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── HTML Preview Modal ────────────────────────────────── */}
      {previewDesign && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', background: 'var(--admin-bg-panel)', borderBottom: '1px solid var(--admin-border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Eye size={16} style={{ color: 'var(--admin-primary)' }} />
              <span style={{ fontWeight: 700 }}>{previewDesign.name || 'معاينة التصميم'}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{previewDesign.htmlTemplate.length.toLocaleString()} حرف</span>
            </div>
            <button onClick={() => setPreviewDesign(null)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
          </div>
          <iframe
            srcDoc={previewDesign.htmlTemplate}
            style={{ flex: 1, border: 'none', background: 'white' }}
            title="معاينة HTML"
            sandbox="allow-same-origin"
          />
        </div>
      )}
    </div>
  );
};
