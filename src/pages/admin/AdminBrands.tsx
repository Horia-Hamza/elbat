import React, { useState } from 'react';
import { useBrands } from '../../hooks/useBrands';
import { brandsApi } from '../../api/brands';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Brand } from '../../types/api';
import { IMAGES_BASE_URL } from '../../api/client';

export const AdminBrands: React.FC = () => {
  const { brands, loading, refetch } = useBrands();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    website: '',
    isActive: true
  });

  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setSelectedFile(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      website: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setSelectedFile(null);
    setFormData({
      name: brand.name || '',
      slug: brand.slug || '',
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
      website: brand.website || '',
      isActive: brand.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الماركة؟')) {
      try {
        await brandsApi.deleteBrand(id);
        refetch();
      } catch (err) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBrand) {
        await brandsApi.updateBrand(editingBrand.id, formData);
      } else {
        const bodyFormData = new FormData();
        bodyFormData.append('Name', formData.name);
        bodyFormData.append('Slug', formData.slug);
        bodyFormData.append('Description', formData.description);
        bodyFormData.append('LogoUrl', formData.logoUrl);
        bodyFormData.append('Website', formData.website);
        bodyFormData.append('IsActive', formData.isActive ? 'true' : 'false');
        if (selectedFile) {
          bodyFormData.append('Logo', selectedFile);
        }
        await brandsApi.createBrand(bodyFormData);
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
        <h3 style={{ color: 'var(--admin-text-main)' }}>إدارة الماركات</h3>
        <button className="admin-btn" onClick={handleOpenAdd}>
          <Plus size={18} />
          إضافة ماركة
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>الشعار</th>
              <th>الاسم</th>
              <th>الرابط (Slug)</th>
              <th>الموقع الإلكتروني</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد ماركات حالياً.</td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td style={{ fontWeight: 'bold' }}>#{brand.id}</td>
                  <td>
                    {brand.logoUrl ? (
                      <img 
                        src={brand.logoUrl.startsWith('http') ? brand.logoUrl : `${IMAGES_BASE_URL}${brand.logoUrl}`} 
                        alt={brand.name} 
                        style={{ height: '30px', borderRadius: '4px', maxWidth: '80px', objectFit: 'contain' }} 
                      />
                    ) : (
                      <span style={{ color: 'var(--admin-text-muted)' }}>-</span>
                    )}
                  </td>
                  <td>{brand.name}</td>
                  <td style={{ color: 'var(--admin-primary)' }}>{brand.slug}</td>
                  <td>{brand.website || '-'}</td>
                  <td>
                    {brand.isActive ? (
                      <span className="admin-badge success">نشط</span>
                    ) : (
                      <span className="admin-badge neutral">مخفي</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-icon-btn" title="تعديل" onClick={() => handleOpenEdit(brand)}>
                        <Edit size={16} />
                      </button>
                      <button className="admin-icon-btn" style={{ color: 'var(--admin-danger)' }} title="حذف" onClick={() => handleDelete(brand.id)}>
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
              <h3 style={{ margin: 0 }}>{editingBrand ? 'تعديل ماركة' : 'إضافة ماركة جديدة'}</h3>
              <button className="admin-icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>اسم الماركة</label>
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
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>ملف الشعار (Logo file)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>رابط الشعار البديل (logoUrl)</label>
                <input 
                  type="text" 
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-dark)', color: 'white' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--admin-text-muted)' }}>الموقع الإلكتروني</label>
                <input 
                  type="text" 
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
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
                  <span>نشط</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="admin-btn outline" onClick={() => setIsModalOpen(false)}>إلغاء</button>
                <button type="submit" className="admin-btn" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'حفظ الماركة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
