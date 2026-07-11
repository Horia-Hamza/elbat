import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Truck, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { shippingZonesApi } from '../../api/shippingZones';
import type { ShippingZone, ShippingZonePayload } from '../../api/shippingZones';

const EMPTY_FORM: ShippingZonePayload = {
  name: '',
  state: '',
  cost: 0,
  freeShippingThreshold: null,
  estimatedDaysMin: 1,
  estimatedDaysMax: 7,
  isActive: true,
};

const INPUT = {
  width: '100%',
  padding: '0.75rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid var(--admin-border)',
  backgroundColor: 'var(--admin-bg-dark)',
  color: 'white',
  fontSize: '0.92rem',
  boxSizing: 'border-box' as const,
  outline: 'none',
};

const LABEL = {
  display: 'block',
  marginBottom: '0.4rem',
  color: 'var(--admin-text-muted)',
  fontSize: '0.82rem',
  fontWeight: '600' as const,
};

export const AdminShippingZones: React.FC = () => {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [form, setForm] = useState<ShippingZonePayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchZones = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await shippingZonesApi.getAll();
      setZones(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setFetchError(err.message || 'فشل تحميل مناطق الشحن');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  // ── Modal helpers ─────────────────────────────────────────────
  const openAdd = () => {
    setEditingZone(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      state: zone.state,
      cost: zone.cost,
      freeShippingThreshold: zone.freeShippingThreshold,
      estimatedDaysMin: zone.estimatedDaysMin,
      estimatedDaysMax: zone.estimatedDaysMax,
      isActive: zone.isActive,
    });
    setSaveError(null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setSaveError(null); };

  const set = (key: keyof ShippingZonePayload, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (editingZone) {
        await shippingZonesApi.update(editingZone.id, form);
      } else {
        await shippingZonesApi.create(form);
      }
      closeModal();
      fetchZones();
    } catch (err: any) {
      setSaveError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (zone: ShippingZone) => {
    if (!window.confirm(`هل أنت متأكد من حذف منطقة الشحن "${zone.name}"؟`)) return;
    try {
      await shippingZonesApi.delete(zone.id);
      fetchZones();
    } catch (err: any) {
      alert(err.message || 'فشل حذف منطقة الشحن');
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="admin-card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Truck size={22} style={{ color: 'var(--admin-primary)' }} />
          <h3 style={{ margin: 0, color: 'var(--admin-text-main)' }}>مناطق الشحن</h3>
          <span style={{
            background: 'var(--admin-primary)', color: 'white',
            borderRadius: '20px', padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700,
          }}>{zones.length}</span>
        </div>
        <button className="admin-btn" onClick={openAdd}>
          <Plus size={18} /> إضافة منطقة شحن
        </button>
      </div>

      {/* Fetch Error */}
      {fetchError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244,67,54,0.1)', border: '1px solid var(--admin-danger)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', color: 'var(--admin-danger)', fontSize: '0.88rem' }}>
          <AlertCircle size={16} /> {fetchError}
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>اسم المنطقة</th>
              <th>المحافظة / الولاية</th>
              <th>تكلفة الشحن</th>
              <th>شحن مجاني من</th>
              <th>أيام التوصيل</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--admin-primary)' }} />
                </td>
              </tr>
            ) : zones.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                  لا توجد مناطق شحن حالياً — اضغط "إضافة منطقة شحن" للبدء
                </td>
              </tr>
            ) : (
              zones.map(zone => (
                <tr key={zone.id}>
                  <td style={{ fontWeight: 700, color: 'var(--admin-primary)' }}>#{zone.id}</td>
                  <td style={{ fontWeight: 600 }}>{zone.name}</td>
                  <td>{zone.state || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{zone.cost.toLocaleString()}</span>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}> ج.م</span>
                  </td>
                  <td>
                    {zone.freeShippingThreshold != null
                      ? <><span style={{ fontWeight: 600 }}>{zone.freeShippingThreshold.toLocaleString()}</span> <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>ج.م</span></>
                      : <span style={{ color: 'var(--admin-text-muted)' }}>—</span>
                    }
                  </td>
                  <td>
                    <span style={{ background: 'rgba(33,150,243,0.12)', color: '#64B5F6', borderRadius: '6px', padding: '2px 8px', fontSize: '0.82rem', fontWeight: 600 }}>
                      {zone.estimatedDaysMin}–{zone.estimatedDaysMax} يوم
                    </span>
                  </td>
                  <td>
                    {zone.isActive
                      ? <span className="admin-badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> نشط</span>
                      : <span className="admin-badge neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> معطّل</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-icon-btn" title="تعديل" onClick={() => openEdit(zone)}>
                        <Edit size={16} />
                      </button>
                      <button className="admin-icon-btn" style={{ color: 'var(--admin-danger)' }} title="حذف" onClick={() => handleDelete(zone)}>
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

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: 'var(--admin-bg-panel)', borderRadius: '14px',
            width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '2rem',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} style={{ color: 'var(--admin-primary)' }} />
                {editingZone ? 'تعديل منطقة الشحن' : 'إضافة منطقة شحن جديدة'}
              </h3>
              <button className="admin-icon-btn" onClick={closeModal}><X size={20} /></button>
            </div>

            {/* Save Error */}
            {saveError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244,67,54,0.1)', border: '1px solid var(--admin-danger)', borderRadius: '8px', padding: '0.7rem 0.9rem', marginBottom: '1rem', color: 'var(--admin-danger)', fontSize: '0.85rem' }}>
                <AlertCircle size={15} /> {saveError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Name + State */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={LABEL}>اسم المنطقة *</label>
                  <input style={INPUT} required placeholder="مثال: القاهرة" value={form.name}
                    onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label style={LABEL}>المحافظة / الولاية *</label>
                  <input style={INPUT} required placeholder="مثال: cairo" value={form.state}
                    onChange={e => set('state', e.target.value)} dir="ltr" />
                </div>
              </div>

              {/* Cost + Free threshold */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={LABEL}>تكلفة الشحن (ج.م) *</label>
                  <input style={INPUT} type="number" required min={0} step={0.01}
                    value={form.cost}
                    onChange={e => set('cost', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={LABEL}>
                    حد الشحن المجاني (ج.م)
                    <span style={{ fontWeight: 400, color: 'var(--admin-text-muted)', marginRight: '4px' }}>(اختياري)</span>
                  </label>
                  <input style={INPUT} type="number" min={0} step={0.01}
                    placeholder="اتركه فارغاً إذا لا يوجد"
                    value={form.freeShippingThreshold ?? ''}
                    onChange={e => set('freeShippingThreshold', e.target.value === '' ? null : parseFloat(e.target.value))} />
                </div>
              </div>

              {/* Delivery days */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={LABEL}>أقل مدة توصيل (أيام) *</label>
                  <input style={INPUT} type="number" required min={1}
                    value={form.estimatedDaysMin}
                    onChange={e => set('estimatedDaysMin', parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <label style={LABEL}>أقصى مدة توصيل (أيام) *</label>
                  <input style={INPUT} type="number" required min={1}
                    value={form.estimatedDaysMax}
                    onChange={e => set('estimatedDaysMax', parseInt(e.target.value) || 1)} />
                </div>
              </div>

              {/* Active toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--admin-bg-dark)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: 0 }}>
                  <div
                    onClick={() => set('isActive', !form.isActive)}
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                      background: form.isActive ? 'var(--admin-primary)' : 'var(--admin-border)',
                      position: 'relative', transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      right: form.isActive ? '3px' : '23px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'white', transition: 'right 0.2s',
                    }} />
                  </div>
                  <span style={{ color: 'var(--admin-text-main)', fontWeight: 600 }}>
                    {form.isActive ? 'منطقة نشطة' : 'منطقة معطّلة'}
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="admin-btn outline" onClick={closeModal}>إلغاء</button>
                <button type="submit" className="admin-btn" disabled={saving} style={{ minWidth: '130px' }}>
                  {saving
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> جاري الحفظ...</>
                    : editingZone ? 'حفظ التعديلات' : 'إضافة المنطقة'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
