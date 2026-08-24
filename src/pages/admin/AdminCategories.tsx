import React, { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { categoriesApi } from '../../api/categories';
import { IMAGES_BASE_URL } from '../../api/client';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Category } from '../../types/api';

export const AdminCategories: React.FC = () => {
  const { categories, loading, refetch } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
    displayOrder: 0
  });

  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setImageFile(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      isActive: true,
      displayOrder: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setImageFile(null);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      isActive: category.isActive,
      displayOrder: category.displayOrder || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      try {
        await categoriesApi.deleteCategory(id);
        refetch();
      } catch (err: any) {
        alert('حدث خطأ أثناء الحذف:\n' + (err?.message || 'خطأ غير معروف'));
        console.error('Delete category error:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('Name', formData.name);
      fd.append('Slug', formData.slug);
      fd.append('Description', formData.description);
      fd.append('ImageUrl', formData.imageUrl);
      fd.append('IsActive', formData.isActive.toString());
      fd.append('DisplayOrder', formData.displayOrder.toString());
      
      if (imageFile) {
        fd.append('Image', imageFile);
      }

      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory.id, fd);
      } else {
        await categoriesApi.createCategory(fd);
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
        <h3 style={{ color: 'var(--admin-text-main)' }}>إدارة التصنيفات</h3>
        <button className="admin-btn" onClick={handleOpenAdd}>
          <Plus size={18} />
          إضافة تصنيف
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
              <th>الحالة</th>
              <th>الأقسام الفرعية</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد تصنيفات حالياً.</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td style={{ fontWeight: 'bold' }}>#{category.id}</td>
                  <td>
                    {category.imageUrl ? (
                      <img src={`${IMAGES_BASE_URL}${category.imageUrl}`} alt={category.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'var(--admin-text-muted)' }}>بدون صورة</span>
                    )}
                  </td>
                  <td>{category.name}</td>
                  <td style={{ color: 'var(--admin-primary)' }}>{category.slug}</td>
                  <td>
                    {category.isActive ? (
                      <span className="admin-badge success">نشط</span>
                    ) : (
                      <span className="admin-badge neutral">مخفي</span>
                    )}
                  </td>
                  <td>{category.subCategories?.length || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-icon-btn" title="تعديل" onClick={() => handleOpenEdit(category)}>
                        <Edit size={16} />
                      </button>
                      <button className="admin-icon-btn" style={{ color: 'var(--admin-danger)' }} title="حذف" onClick={() => handleDelete(category.id)}>
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
              <h3 style={{ margin: 0 }}>{editingCategory ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h3>
              <button className="admin-icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>اسم التصنيف</label>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>الوصف</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>رابط الصورة (imageUrl) أو اختر ملفاً</label>
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
                  {saving ? 'جاري الحفظ...' : 'حفظ التصنيف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
