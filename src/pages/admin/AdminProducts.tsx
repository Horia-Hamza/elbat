import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useBrands } from '../../hooks/useBrands';
import { useSubCategories } from '../../hooks/useSubCategories';
import { productsApi, productImagesApi, productVideosApi } from '../../api/products';
import { pageDesignsApi } from '../../api/pageDesigns';
import { IMAGES_BASE_URL } from '../../api/client';
import { Plus, Edit, Trash2, X, ImagePlus, CheckCircle, XCircle, Loader, Palette, Video, Eye, BarChart2, Image as ImageIcon, Star } from 'lucide-react';
import type { ApiProduct } from '../../types/api';
import { PAGE_TEMPLATES } from '../../constants/pageTemplates';
import { AdminProductDetail } from './AdminProductDetail';

type FileUploadStatus = 'pending' | 'uploading' | 'done' | 'error';
interface ImageEntry {
  file: File;
  preview: string;
  altText: string;
  status: FileUploadStatus;
  errorMsg?: string;
}

interface VideoEntry {
  file: File;
  altText: string;
  status: FileUploadStatus;
  errorMsg?: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem',
  borderRadius: '6px',
  border: '1px solid var(--admin-border)',
  backgroundColor: 'var(--admin-bg-dark)',
  color: 'white',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.5rem',
  color: 'var(--admin-text-muted)',
  fontSize: '0.875rem',
};

export const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, refetch } = useProducts({ pageNumber: 1, pageSize: 50 });
  const { brands } = useBrands();
  const { subCategories } = useSubCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [viewingProductId, setViewingProductId] = useState<number | null>(null);

  // Inventory modal state


  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'details' | 'images' | 'design' | 'videos'>('details');
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [viewingProductTab, setViewingProductTab] = useState<'info' | 'images'>('info');

  // Step 3 — page design
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PAGE_TEMPLATES[0].id);
  const [designName, setDesignName] = useState('');
  const [designCss, setDesignCss] = useState('');
  const [designIsDefault, setDesignIsDefault] = useState(false);
  const [designSaving, setDesignSaving] = useState(false);
  const [designDone, setDesignDone] = useState(false);
  const [designError, setDesignError] = useState<string | null>(null);

  // Step 4 — product videos
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([]);
  const [videoUploadDone, setVideoUploadDone] = useState(false);

  const emptyForm = {
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    basePrice: 0,
    salePrice: 0,
    sku: '',
    barcode: '',
    weight: 0,
    dimensions: '',
    isActive: true,
    isFeatured: false,
    subCategoryId: 1,
    brandId: 1,
    metaTitle: '',
    metaDescription: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setImageEntries([]);
    setVideoEntries([]);
    setUploadDone(false);
    setVideoUploadDone(false);
    setDesignDone(false);
    setDesignError(null);
    setDesignName('');
    setDesignCss('');
    setDesignIsDefault(false);
    setSelectedTemplateId(PAGE_TEMPLATES[0].id);
    setFormData({
      ...emptyForm,
      subCategoryId: subCategories.length > 0 ? subCategories[0].id : 0,
      brandId: brands.length > 0 ? brands[0].id : 0,
    });
    setStep('details');
    setCreatedProductId(null);
    setMainImageIndex(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ApiProduct) => {
    setEditingProduct(product);
    setImageEntries([]);
    setVideoEntries([]);
    setUploadDone(false);
    setVideoUploadDone(false);
    setDesignDone(false);
    setDesignError(null);
    setDesignName(product.name || '');
    setDesignCss('');
    setDesignIsDefault(false);
    setSelectedTemplateId(PAGE_TEMPLATES[0].id);
    setStep('details');
    setCreatedProductId(product.id);
    setMainImageIndex(0);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      basePrice: product.basePrice || 0,
      salePrice: product.salePrice || 0,
      sku: product.sku || '',
      barcode: '',
      weight: 0,
      dimensions: '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      subCategoryId: product.subCategoryId || 1,
      brandId: product.brandId || 1,
      metaTitle: '',
      metaDescription: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await productsApi.deleteProduct(id);
        refetch();
      } catch (err: any) {
        const msg = err?.message || 'خطأ غير معروف';
        alert('حدث خطأ أثناء الحذف:\n' + msg);
        console.error('Delete product error:', err);
      }
    }
  };




  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      shortDescription: formData.shortDescription,
      basePrice: formData.basePrice,
      salePrice: formData.salePrice,
      sku: formData.sku,
      barcode: formData.barcode,
      weight: formData.weight,
      dimensions: formData.dimensions,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      subCategoryId: formData.subCategoryId,
      brandId: formData.brandId,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
    };

    if (!payload.subCategoryId || payload.subCategoryId <= 0) {
      alert('يرجى اختيار القسم الفرعي');
      setSaving(false);
      return;
    }
    if (!payload.brandId || payload.brandId <= 0) {
      alert('يرجى اختيار الماركة');
      setSaving(false);
      return;
    }

    console.log('🚀 Submitting product payload:', JSON.stringify(payload, null, 2));

    try {
      let productId: number;
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, payload);
        productId = editingProduct.id;
      } else {
        const created = await productsApi.createProduct(payload);
        console.log('✅ Product created:', created);
        productId = created.id;
        // Pre-fill design name
        setDesignName(payload.name);
      }
      setCreatedProductId(productId);
      setStep('images');
    } catch (err: any) {
      console.error('❌ Product save error:', err);
      alert('خطأ أثناء حفظ المنتج:\n' + (err?.message || err?.toString() || 'خطأ غير معروف'));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImages = async () => {
    if (!createdProductId || imageEntries.length === 0) {
      setIsModalOpen(false);
      refetch();
      return;
    }
    setSaving(true);
    setUploadDone(false);

    let firstUploadedId: number | null = null;

    // Upload sequentially so server isn't overwhelmed
    for (let idx = 0; idx < imageEntries.length; idx++) {
      const entry = imageEntries[idx];
    const isMain = idx === mainImageIndex;

      // Mark as uploading
      setImageEntries(prev =>
        prev.map((e, i) => i === idx ? { ...e, status: 'uploading' } : e)
      );

      try {
        const uploaded = await productImagesApi.uploadImage({
          productId: createdProductId,
          file: entry.file,
          altText: entry.altText || entry.file.name,
          isMain,
          displayOrder: idx,
        });

        if (isMain && uploaded.id) {
          firstUploadedId = uploaded.id;
        }

        setImageEntries(prev =>
          prev.map((e, i) => i === idx ? { ...e, status: 'done' } : e)
        );
      } catch (err: any) {
        setImageEntries(prev =>
          prev.map((e, i) => i === idx
            ? { ...e, status: 'error', errorMsg: err?.message || 'فشل الرفع' }
            : e)
        );
      }
    }

    // Set main image explicitly after all uploads
    if (firstUploadedId && createdProductId) {
      try {
        await productImagesApi.setMainImage(createdProductId, firstUploadedId);
      } catch { /* ignore */ }
    }

    setSaving(false);
    setUploadDone(true);
    refetch();
    // Automatically advance to design step
    setStep('design');
  };

  const handleUploadVideos = async () => {
    if (!createdProductId || videoEntries.length === 0) {
      setIsModalOpen(false);
      refetch();
      return;
    }
    setSaving(true);
    setVideoUploadDone(false);

    for (let idx = 0; idx < videoEntries.length; idx++) {
      setVideoEntries(prev => prev.map((e, i) => i === idx ? { ...e, status: 'uploading' } : e));
      try {
        await productVideosApi.uploadVideo({
          productId: createdProductId,
          file: videoEntries[idx].file,
          altText: videoEntries[idx].altText || videoEntries[idx].file.name,
          displayOrder: idx,
        });
        setVideoEntries(prev => prev.map((e, i) => i === idx ? { ...e, status: 'done' } : e));
      } catch (err: any) {
        setVideoEntries(prev => prev.map((e, i) => i === idx
          ? { ...e, status: 'error', errorMsg: err?.message || 'فشل الرفع' }
          : e));
      }
    }

    setSaving(false);
    setVideoUploadDone(true);
    refetch();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageEntries([]);
    setVideoEntries([]);
    setUploadDone(false);
    setVideoUploadDone(false);
    setDesignDone(false);
    setDesignError(null);
    refetch();
  };

  const handleFilesSelected = (files: FileList) => {
    const entries: ImageEntry[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      altText: file.name.replace(/\.[^.]+$/, ''),
      status: 'pending',
    }));
    setImageEntries(entries);
    setMainImageIndex(0);
    setUploadDone(false);
  };

  const removeImageEntry = (idx: number) => {
    setImageEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const updateAltText = (idx: number, text: string) => {
    setImageEntries(prev =>
      prev.map((e, i) => i === idx ? { ...e, altText: text } : e)
    );
  };

  // ── Step 3: Create page design + assign to product ────────────
  const handleSubmitDesign = async () => {
    if (!createdProductId) return;
    setDesignSaving(true);
    setDesignError(null);
    try {
      const template = PAGE_TEMPLATES.find(t => t.id === selectedTemplateId) || PAGE_TEMPLATES[0];
      const targetName = designName || `تصميم ${createdProductId}`;
      await pageDesignsApi.create({
        name: targetName,
        targetType: 2,
        htmlTemplate: template.html,
        cssStyles: designCss || template.css,
        isActive: true,
        isDefault: designIsDefault,
      });

      // Resolve ID dynamically (index + 1)
      const allDesigns = await pageDesignsApi.getAll();
      const idx = allDesigns.map(d => d.name).lastIndexOf(targetName);
      const calculatedId = idx !== -1 ? idx + 1 : null;

      if (calculatedId) {
        await pageDesignsApi.assignProduct({
          targetId: createdProductId,
          pageDesignId: calculatedId,
        });
      } else {
        throw new Error('لم يتم العثور على التصميم بعد إنشائه لتحديد معرفه للربط.');
      }
      setDesignDone(true);
    } catch (err: any) {
      setDesignError(err?.message || 'حدث خطأ أثناء إنشاء التصميم');
    } finally {
      setDesignSaving(false);
    }
  };

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--admin-text-main)' }}>قائمة المنتجات</h3>
        <button className="admin-btn" onClick={handleOpenAdd}>
          <Plus size={18} />
          إضافة منتج جديد
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>صورة</th>
              <th>اسم المنتج</th>
              <th>الماركة</th>
              <th>القسم الفرعي</th>
              <th>السعر</th>
              <th>المخزون</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</td></tr>
            ) : (products || []).length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد منتجات حالياً.</td></tr>
            ) : (
              (products || []).map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 'bold' }}>#{product.id}</td>
                  <td>
                    {product.mainImageUrl ? (
                      <img
                        src={`${IMAGES_BASE_URL}${product.mainImageUrl}`}
                        alt={product.name}
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ color: 'var(--admin-text-muted)' }}>بدون صورة</span>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>
                    {brands.find(b => b.id === product.brandId)?.name || (
                      <span style={{ color: 'var(--admin-text-muted)' }}>— (ID: {product.brandId})</span>
                    )}
                  </td>
                  <td>
                    {subCategories.find(sc => sc.id === product.subCategoryId)?.name || (
                      <span style={{ color: 'var(--admin-text-muted)' }}>— (ID: {product.subCategoryId})</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{product.basePrice} ج.م</td>
                  <td>
                    <span className={`admin-badge ${product.inStock ? 'success' : 'neutral'}`}>
                      {product.inStock ? 'متوفر' : 'نفذ'}
                    </span>
                  </td>
                  <td>
                    {product.isActive
                      ? <span className="admin-badge success">نشط</span>
                      : <span className="admin-badge neutral">مخفي</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Manage Images */}
                      <button
                        className="admin-icon-btn"
                        title="إدارة الصور"
                        style={{ color: '#f59e0b' }}
                        onClick={() => { setViewingProductTab('images'); setViewingProductId(product.id); }}
                      >
                        <ImageIcon size={16} />
                      </button>
                      {/* View full details */}
                      <button
                        className="admin-icon-btn"
                        title="عرض التفاصيل"
                        style={{ color: 'var(--admin-text-muted)' }}
                        onClick={() => { setViewingProductTab('info'); setViewingProductId(product.id); }}
                      >
                        <Eye size={16} />
                      </button>
                      {/* Edit product details → opens modal */}
                      <button
                        className="admin-icon-btn"
                        title="تعديل البيانات"
                        onClick={() => handleOpenEdit(product)}
                      >
                        <Edit size={16} />
                      </button>
                      {/* Design page → navigate to dedicated page */}
                      <button
                        className="admin-icon-btn"
                        title="تصميم صفحة المنتج"
                        style={{ color: 'var(--admin-primary)' }}
                        onClick={() => navigate(`/admin/page-designs/${product.id}`)}
                      >
                        <Palette size={16} />
                      </button>

                      {/* Delete */}
                      <button
                        className="admin-icon-btn"
                        style={{ color: 'var(--admin-danger)' }}
                        title="حذف"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>



      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--admin-bg-panel)',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
                {/* Step indicators — 4 steps */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                { key: 'details', label: '① بيانات المنتج' },
                { key: 'images',  label: '② الصور' },
                { key: 'design',  label: '③ تصميم الصفحة' },
                { key: 'videos',  label: '④ الفيديو' },
              ].map(s => (
                <span key={s.key} style={{
                  fontSize: '0.8rem', padding: '2px 10px', borderRadius: '20px',
                  background: step === s.key ? 'var(--admin-primary)' : 'var(--admin-border)',
                  color: 'white',
                }}>{s.label}</span>
              ))}
            </div>
              </div>
              <button className="admin-icon-btn" onClick={closeModal}><X size={20} /></button>
            </div>

            {/* Step 1 — Product Details */}
            {step === 'details' && (
              <form onSubmit={handleSubmitDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>اسم المنتج *</label>
                    <input type="text" required style={inputStyle} value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const generatedSlug = val.toLowerCase().trim()
                          .replace(/\s+/g, '-')
                          .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9_-]/g, '');
                        setFormData({ ...formData, name: val, slug: generatedSlug || formData.slug });
                      }} />
                  </div>
                  <div>
                    <label style={labelStyle}>الرابط (Slug) *</label>
                    <input type="text" required style={inputStyle} value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>الوصف</label>
                  <textarea rows={3} style={inputStyle} value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value, shortDescription: e.target.value.substring(0, 100) })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>السعر الأساسي *</label>
                    <input type="number" required min="0" style={inputStyle} value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label style={labelStyle}>سعر التخفيض</label>
                    <input type="number" min="0" style={inputStyle} value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>SKU</label>
                    <input type="text" style={inputStyle} value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Barcode</label>
                    <input type="text" style={inputStyle} value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>القسم الفرعي *</label>
                    <select required style={inputStyle} value={formData.subCategoryId}
                      onChange={(e) => setFormData({ ...formData, subCategoryId: parseInt(e.target.value) || 1 })}>
                      {subCategories.length === 0 && <option value={1}>جاري التحميل...</option>}
                      {subCategories.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.name} (ID: {sc.id})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>الماركة *</label>
                    <select required style={inputStyle} value={formData.brandId}
                      onChange={(e) => setFormData({ ...formData, brandId: parseInt(e.target.value) || 1 })}>
                      {brands.length === 0 && <option value={1}>جاري التحميل...</option>}
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name} (ID: {b.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>الوزن</label>
                    <input type="number" style={inputStyle} value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label style={labelStyle}>الأبعاد</label>
                    <input type="text" style={inputStyle} value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                    <span>نشط</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} />
                    <span>منتج مميز</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="admin-btn outline" onClick={closeModal}>إلغاء</button>
                  <button type="submit" className="admin-btn" disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'التالي: رفع الصور ①→②'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2 — Image Upload */}
            {step === 'images' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Product ID info */}
                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', background: 'var(--admin-bg-dark)', padding: '0.6rem 1rem', borderRadius: '6px' }}>
                  📦 منتج ID: <strong style={{ color: 'var(--admin-primary)' }}>#{createdProductId}</strong> — يمكنك رفع الصور الآن أو تخطي هذه الخطوة.
                </div>

                {/* Drop zone */}
                {!saving && !uploadDone && (
                  <label style={{
                    border: '2px dashed var(--admin-border)',
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'block',
                    transition: 'border-color 0.2s',
                  }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files); }}
                  >
                    <ImagePlus size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--admin-text-muted)', display: 'block' }} />
                    <p style={{ color: 'var(--admin-text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                      اسحب الصور هنا أو انقر للاختيار — الصورة الأولى ستكون الرئيسية
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files) handleFilesSelected(e.target.files); }}
                    />
                    <span style={{
                      display: 'inline-block', padding: '0.4rem 1.2rem',
                      border: '1px solid var(--admin-border)', borderRadius: '20px',
                      fontSize: '0.8rem', color: 'var(--admin-text-muted)',
                    }}>اختر ملفات</span>
                  </label>
                )}

                {/* Image list with status */}
                {imageEntries.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {imageEntries.map((entry, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        background: 'var(--admin-bg-dark)', borderRadius: '8px', padding: '0.6rem 0.75rem',
                        border: '1px solid ' + (
                          i === mainImageIndex ? 'var(--admin-primary)'
                          : entry.status === 'done' ? 'var(--admin-success, #22c55e)'
                          : entry.status === 'error' ? 'var(--admin-danger)'
                          : entry.status === 'uploading' ? 'var(--admin-primary)'
                          : 'var(--admin-border)'
                        ),
                      }}>
                        {/* Thumbnail */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img
                            src={entry.preview}
                            alt={entry.altText}
                            style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px',
                              border: i === mainImageIndex ? '2px solid var(--admin-primary)' : '2px solid transparent' }}
                          />
                          {i === mainImageIndex && (
                            <span style={{
                              position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
                              fontSize: '0.55rem', background: 'var(--admin-primary)', color: 'white',
                              padding: '1px 5px', borderRadius: '10px', whiteSpace: 'nowrap',
                            }}>رئيسية</span>
                          )}
                        </div>

                        {/* Alt text input */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.file.name}
                          </div>
                          <input
                            type="text"
                            placeholder="نص بديل (AltText)"
                            value={entry.altText}
                            disabled={entry.status === 'uploading' || entry.status === 'done'}
                            onChange={(e) => updateAltText(i, e.target.value)}
                            style={{ ...inputStyle, padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          />
                          {entry.status === 'error' && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-danger)', marginTop: '2px' }}>
                              ❌ {entry.errorMsg}
                            </div>
                          )}
                        </div>

                        {/* Set Main + Status icon / remove */}
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {/* Set as Main button — only when pending */}
                          {entry.status === 'pending' && i !== mainImageIndex && (
                            <button
                              onClick={() => setMainImageIndex(i)}
                              title="تعيين كصورة رئيسية"
                              style={{
                                background: 'rgba(99,102,241,0.1)',
                                border: '1px solid rgba(99,102,241,0.4)',
                                borderRadius: 6,
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                color: '#6366f1',
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Star size={11} /> رئيسية
                            </button>
                          )}
                          {entry.status === 'pending' && !saving && (
                            <button
                              onClick={() => removeImageEntry(i)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
                              title="إزالة"
                            >
                              <X size={16} />
                            </button>
                          )}
                          {entry.status === 'uploading' && <Loader size={18} style={{ color: 'var(--admin-primary)', animation: 'spin 1s linear infinite' }} />}
                          {entry.status === 'done' && <CheckCircle size={18} style={{ color: '#22c55e' }} />}
                          {entry.status === 'error' && <XCircle size={18} style={{ color: 'var(--admin-danger)' }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload summary when done */}
                {uploadDone && (
                  <div style={{
                    textAlign: 'center', padding: '1rem',
                    background: 'rgba(34,197,94,0.08)', borderRadius: '8px',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}>
                    <CheckCircle size={28} style={{ color: '#22c55e', marginBottom: '0.4rem' }} />
                    <div style={{ color: '#22c55e', fontWeight: 600 }}>
                      تم رفع {imageEntries.filter(e => e.status === 'done').length} من {imageEntries.length} صورة بنجاح
                    </div>
                    {imageEntries.some(e => e.status === 'error') && (
                      <div style={{ color: 'var(--admin-danger)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
                        فشل رفع {imageEntries.filter(e => e.status === 'error').length} صورة
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="admin-btn outline" onClick={closeModal} disabled={saving}>
                    {uploadDone ? 'إغلاق' : 'تخطي وحفظ'}
                  </button>
                  {!uploadDone && (
                    <button
                      className="admin-btn"
                      onClick={handleUploadImages}
                      disabled={saving || imageEntries.length === 0}
                    >
                      {saving
                        ? `جاري الرفع... (${imageEntries.filter(e => e.status === 'done').length}/${imageEntries.length})`
                        : imageEntries.length > 0
                          ? `رفع ${imageEntries.length} صورة ↑`
                          : 'اختر صوراً أولاً'}
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Step 3 — Page Design */}
            {step === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Header info */}
                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', background: 'var(--admin-bg-dark)', padding: '0.6rem 1rem', borderRadius: '6px' }}>
                  <Palette size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                  اختر تصميم HTML لصفحة المنتج <strong style={{ color: 'var(--admin-primary)' }}>#{createdProductId}</strong> وسيتم ربطه تلقائياً.
                </div>

                {/* Template cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
                  {PAGE_TEMPLATES.map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() => !designSaving && !designDone && setSelectedTemplateId(tpl.id)}
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: `2px solid ${selectedTemplateId === tpl.id ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                        cursor: designSaving || designDone ? 'not-allowed' : 'pointer',
                        transition: 'border-color 0.2s, transform 0.15s',
                        transform: selectedTemplateId === tpl.id ? 'scale(1.02)' : 'scale(1)',
                        opacity: designSaving || designDone ? 0.7 : 1,
                      }}
                    >
                      {/* Preview swatch */}
                      <div style={{
                        background: tpl.previewGradient,
                        height: '80px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem',
                      }}>{tpl.previewIcon}</div>
                      <div style={{ padding: '0.75rem', background: 'var(--admin-bg-dark)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{tpl.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', lineHeight: 1.4 }}>{tpl.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Design name */}
                <div>
                  <label style={labelStyle}>اسم التصميم *</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={designName}
                    disabled={designSaving || designDone}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="مثال: صفحة منتج البط الكلاسيكية"
                  />
                </div>

                {/* CSS override (optional) */}
                <div>
                  <label style={labelStyle}>CSS إضافي (اختياري)</label>
                  <textarea
                    rows={3}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }}
                    value={designCss}
                    disabled={designSaving || designDone}
                    onChange={(e) => setDesignCss(e.target.value)}
                    placeholder="/* أضف أي تخصيصات CSS هنا */"
                  />
                </div>

                {/* Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={designIsDefault}
                    disabled={designSaving || designDone}
                    onChange={(e) => setDesignIsDefault(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.88rem' }}>تعيين كتصميم افتراضي (isDefault)</span>
                </label>

                {/* Error */}
                {designError && (
                  <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid var(--admin-danger)', borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--admin-danger)', fontSize: '0.85rem' }}>
                    ❌ {designError}
                  </div>
                )}

                {/* Success */}
                {designDone && (
                  <div style={{ textAlign: 'center', padding: '1.2rem', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.3)', borderRadius: '8px' }}>
                    <CheckCircle size={28} style={{ color: '#22c55e', marginBottom: '0.4rem' }} />
                    <div style={{ color: '#22c55e', fontWeight: 700 }}>تم إنشاء تصميم الصفحة وربطه بالمنتج بنجاح! 🎉</div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="admin-btn outline" onClick={closeModal} disabled={designSaving}>
                    {designDone ? 'تخطي' : 'تخطي'}
                  </button>
                  {!designDone && (
                    <button
                      className="admin-btn"
                      onClick={handleSubmitDesign}
                      disabled={designSaving || !designName.trim()}
                    >
                      {designSaving
                        ? <><Loader size={15} style={{ display: 'inline', marginLeft: '6px', animation: 'spin 1s linear infinite' }} />جاري الإنشاء...</>
                        : '🎨 إنشاء وربط التصميم'}
                    </button>
                  )}
                  {/* Always show advance button once done */}
                  {designDone && (
                    <button className="admin-btn" onClick={() => setStep('videos')}>
                      التالي: رفع الفيديو ③→④
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 4 — Video Upload */}
            {step === 'videos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', background: 'var(--admin-bg-dark)', padding: '0.6rem 1rem', borderRadius: '6px' }}>
                  <Video size={14} style={{ display: 'inline', marginLeft: '6px' }} />
                  ارفع فيديو المنتج <strong style={{ color: 'var(--admin-primary)' }}>#{createdProductId}</strong> — يمكنك تخطي هذه الخطوة.
                </div>

                {/* Drop zone */}
                {!saving && !videoUploadDone && (
                  <label style={{
                    border: '2px dashed var(--admin-border)',
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'block',
                    transition: 'border-color 0.2s',
                  }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) {
                        const entries: VideoEntry[] = Array.from(e.dataTransfer.files).map(f => ({
                          file: f,
                          altText: f.name.replace(/\.[^.]+$/, ''),
                          status: 'pending',
                        }));
                        setVideoEntries(entries);
                        setVideoUploadDone(false);
                      }
                    }}
                  >
                    <Video size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--admin-text-muted)', display: 'block' }} />
                    <p style={{ color: 'var(--admin-text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                      اسحب ملفات الفيديو هنا أو انقر للاختيار
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files) {
                          const entries: VideoEntry[] = Array.from(e.target.files).map(f => ({
                            file: f,
                            altText: f.name.replace(/\.[^.]+$/, ''),
                            status: 'pending',
                          }));
                          setVideoEntries(entries);
                          setVideoUploadDone(false);
                        }
                      }}
                    />
                    <span style={{
                      display: 'inline-block', padding: '0.4rem 1.2rem',
                      border: '1px solid var(--admin-border)', borderRadius: '20px',
                      fontSize: '0.8rem', color: 'var(--admin-text-muted)',
                    }}>اختر ملفات فيديو</span>
                  </label>
                )}

                {/* Video list with status */}
                {videoEntries.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {videoEntries.map((entry, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        background: 'var(--admin-bg-dark)', borderRadius: '8px', padding: '0.6rem 0.75rem',
                        border: '1px solid ' + (
                          entry.status === 'done'     ? 'var(--admin-success, #22c55e)'
                          : entry.status === 'error'    ? 'var(--admin-danger)'
                          : entry.status === 'uploading'? 'var(--admin-primary)'
                          : 'var(--admin-border)'
                        ),
                      }}>

                        {/* Icon */}
                        <div style={{ flexShrink: 0, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                          <Video size={28} style={{ color: 'var(--admin-primary)', opacity: 0.8 }} />
                        </div>

                        {/* Name + alt text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.file.name} — {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                          <input
                            type="text"
                            placeholder="نص بديل (AltText)"
                            value={entry.altText}
                            disabled={entry.status === 'uploading' || entry.status === 'done'}
                            onChange={(e) => setVideoEntries(prev =>
                              prev.map((v, vi) => vi === i ? { ...v, altText: e.target.value } : v)
                            )}
                            style={{ ...inputStyle, padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          />
                          {entry.status === 'error' && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-danger)', marginTop: 2 }}>❌ {entry.errorMsg}</div>
                          )}
                        </div>

                        {/* Status icon / remove */}
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                          {entry.status === 'pending' && !saving && (
                            <button
                              onClick={() => setVideoEntries(prev => prev.filter((_, vi) => vi !== i))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
                              title="إزالة"
                            >
                              <X size={16} />
                            </button>
                          )}
                          {entry.status === 'uploading' && <Loader size={18} style={{ color: 'var(--admin-primary)', animation: 'spin 1s linear infinite' }} />}
                          {entry.status === 'done'     && <CheckCircle size={18} style={{ color: '#22c55e' }} />}
                          {entry.status === 'error'    && <XCircle size={18} style={{ color: 'var(--admin-danger)' }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload done summary */}
                {videoUploadDone && (
                  <div style={{
                    textAlign: 'center', padding: '1rem',
                    background: 'rgba(34,197,94,0.08)', borderRadius: '8px',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}>
                    <CheckCircle size={28} style={{ color: '#22c55e', marginBottom: '0.4rem' }} />
                    <div style={{ color: '#22c55e', fontWeight: 600 }}>
                      تم رفع {videoEntries.filter(e => e.status === 'done').length} من {videoEntries.length} فيديو بنجاح
                    </div>
                    {videoEntries.some(e => e.status === 'error') && (
                      <div style={{ color: 'var(--admin-danger)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
                        فشل رفع {videoEntries.filter(e => e.status === 'error').length} فيديو
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="admin-btn outline" onClick={closeModal} disabled={saving}>
                    {videoUploadDone ? 'إغلاق' : 'تخطي وحفظ'}
                  </button>
                  {!videoUploadDone && (
                    <button
                      className="admin-btn"
                      onClick={handleUploadVideos}
                      disabled={saving || videoEntries.length === 0}
                    >
                      {saving
                        ? `جاري الرفع... (${videoEntries.filter(e => e.status === 'done').length}/${videoEntries.length})`
                        : videoEntries.length > 0
                          ? `رفع ${videoEntries.length} فيديو ↑`
                          : 'اختر ملفات أولاً'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Product Detail Panel ── */}
      {viewingProductId !== null && (
        <AdminProductDetail
          productId={viewingProductId}
          initialTab={viewingProductTab}
          onClose={() => setViewingProductId(null)}
          onEdit={(p) => {
            setViewingProductId(null);
            handleOpenEdit(p);
          }}
        />
      )}
    </div>
  );
};
