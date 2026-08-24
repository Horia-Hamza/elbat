import React, { useState } from 'react';
import { useSubCategories } from '../../hooks/useSubCategories';
import { useCategories } from '../../hooks/useCategories';
import { subCategoriesApi } from '../../api/subcategories';
import { IMAGES_BASE_URL } from '../../api/client';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { SubCategory } from '../../types/api';

export const AdminSubCategories: React.FC = () => {
  const { subCategories, loading, refetch } = useSubCategories();
  const { categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
    displayOrder: 0,
    categoryId: 1
  });

  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingSubCategory(null);
    setImageFile(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      isActive: true,
      displayOrder: 0,
      categoryId: categories.length > 0 ? categories[0].id : 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setImageFile(null);
    setFormData({
      name: subCategory.name || '',
      slug: subCategory.slug || '',
      description: subCategory.description || '',
      imageUrl: subCategory.imageUrl || '',
      isActive: subCategory.isActive,
      displayOrder: subCategory.displayOrder || 0,
      categoryId: subCategory.categoryId || 1
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم الفرعي؟')) {
      try {
        await subCategoriesApi.deleteSubCategory(id);
        refetch();
      } catch (err: any) {
        alert('حدث خطأ أثناء الحذف:\n' + (err?.message || 'خطأ غير معروف'));
        console.error('Delete sub-category error:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (imageFile) {
        // Send as FormData to support file upload
        const fd = new FormData();
        fd.append('Name', formData.name);
        fd.append('Slug', formData.slug);
        fd.append('Description', formData.description);
        fd.append('ImageUrl', formData.imageUrl);
        fd.append('IsActive', formData.isActive.toString());
        fd.append('DisplayOrder', formData.displayOrder.toString());
        fd.append('CategoryId', formData.categoryId.toString());
        fd.append('Image', imageFile);

        if (editingSubCategory) {
          await subCategoriesApi.updateSubCategory(editingSubCategory.id, fd);
        } else {
          await subCategoriesApi.createSubCategory(fd);
        }
      } else {
        // Send as JSON with null for empty properties
        const jsonPayload = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || "",
          image: null,
          imageUrl: formData.imageUrl || null,
          isActive: formData.isActive,
          displayOrder: formData.displayOrder || 1,
          categoryId: formData.categoryId
        };

        if (editingSubCategory) {
          await subCategoriesApi.updateSubCategory(editingSubCategory.id, jsonPayload);
        } else {
          await subCategoriesApi.createSubCategory(jsonPayload);
        }
      }
      
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--admin-text-main)' }}>إدارة الأقسام الفرعية</h3>
        <button className="admin-btn" onClick={handleOpenAdd}>
          <Plus size={18} />
          إضافة قسم فرعي
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>صورة</th>
              <th>الاسم</th>
              <th>الرابط (Slug)</th>
              <th>معرف القسم الأساسي</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</td>
              </tr>
            ) : (subCategories || []).length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد أقسام فرعية حالياً.</td>
              </tr>
            ) : (
              (subCategories || []).map((subCat) => (
                <tr key={subCat.id}>
                  <td style={{ fontWeight: 'bold' }}>#{subCat.id}</td>
                  <td>
                    {subCat.imageUrl ? (
                      <img src={`${IMAGES_BASE_URL}${subCat.imageUrl}`} alt={subCat.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'var(--admin-text-muted)' }}>بدون صورة</span>
                    )}
                  </td>
                  <td>{subCat.name}</td>
                  <td style={{ color: 'var(--admin-primary)' }}>{subCat.slug}</td>
                  <td>{subCat.categoryId}</td>
                  <td>
                    {subCat.isActive ? (
                      <span className="admin-badge success">نشط</span>
                    ) : (
                      <span className="admin-badge neutral">مخفي</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-icon-btn" title="تعديل" onClick={() => handleOpenEdit(subCat)}>
                        <Edit size={16} />
                      </button>
                      <button className="admin-icon-btn" style={{ color: 'var(--admin-danger)' }} title="حذف" onClick={() => handleDelete(subCat.id)}>
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
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--admin-bg-panel)',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingSubCategory ? 'تعديل القسم الفرعي' : 'إضافة قسم فرعي جديد'}</h3>
              <button className="admin-icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>اسم القسم الفرعي</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const generatedSlug = val.toLowerCase().trim()
                      .replace(/\s+/g, '-')
                      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9_-]/g, '');
                    setFormData({...formData, name: val, slug: generatedSlug || formData.slug});
                  }}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>الرابط (Slug)</label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>القسم الأساسي (CategoryId)</label>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: parseInt(e.target.value) || 1})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>
                  ))}
                  {categories.length === 0 && <option value={1}>الرجاء إضافة تصنيف أولاً</option>}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>الوصف</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>رابط الصورة أو رفع صورة (Image/ImageUrl)</label>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="رابط الصورة (اختياري)"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white', marginBottom: '0.5rem' }}
                />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span>نشط (يظهر في القائمة)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="admin-btn outline" onClick={() => setIsModalOpen(false)}>إلغاء</button>
                <button type="submit" className="admin-btn" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'حفظ القسم الفرعي'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
