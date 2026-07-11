import React, { useState, useEffect } from 'react';
import { shippingAddressApi } from '../../api/shippingAddress';
import { Search, MapPin, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import type { ApiShippingAddress } from '../../types/api';

export const AdminShippingAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<ApiShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shippingAddressApi.getAllAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل عناوين الشحن');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const filteredAddresses = addresses.filter(addr => {
    return (
      (addr.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (addr.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (addr.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (addr.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (addr.userId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={22} style={{ color: 'var(--admin-primary)' }} />
          <h3 style={{ margin: 0, color: 'var(--admin-text-main)' }}>عناوين الشحن للعملاء</h3>
          <span style={{
            background: 'var(--admin-primary)', color: 'white',
            borderRadius: '20px', padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700,
          }}>{addresses.length}</span>
        </div>
        <button className="admin-btn outline" onClick={fetchAddresses} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={16} /> تحديث القائمة
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <input
            type="text"
            placeholder="ابحث بالاسم، الهاتف، المدينة، المحافظة أو معرف العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 2.5rem 0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--admin-border)',
              backgroundColor: 'var(--admin-bg-dark)',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244,67,54,0.1)', border: '1px solid var(--admin-danger)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', color: 'var(--admin-danger)', fontSize: '0.88rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Addresses Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>العميل</th>
              <th>رقم الهاتف</th>
              <th>العنوان الرئيسي</th>
              <th>العنوان الإضافي</th>
              <th>المدينة</th>
              <th>المحافظة</th>
              <th>الدولة</th>
              <th>الافتراضي</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--admin-primary)', margin: '0 auto' }} />
                </td>
              </tr>
            ) : filteredAddresses.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                  لا توجد عناوين شحن متوفرة.
                </td>
              </tr>
            ) : (
              filteredAddresses.map((addr) => (
                <tr key={addr.id}>
                  <td style={{ fontWeight: 700, color: 'var(--admin-primary)' }}>#{addr.id}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{addr.fullName || <span style={{ color: 'var(--admin-text-muted)' }}>بلا اسم</span>}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>{addr.userId}</span>
                    </div>
                  </td>
                  <td>{addr.phoneNumber || <span style={{ color: 'var(--admin-text-muted)' }}>—</span>}</td>
                  <td>{addr.addressLine1}</td>
                  <td>{addr.addressLine2 || <span style={{ color: 'var(--admin-text-muted)' }}>—</span>}</td>
                  <td>{addr.city}</td>
                  <td>{addr.state || <span style={{ color: 'var(--admin-text-muted)' }}>—</span>}</td>
                  <td>{addr.country}</td>
                  <td>
                    {addr.isDefault ? (
                      <span className="admin-badge success">افتراضي</span>
                    ) : (
                      <span className="admin-badge neutral">عادي</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
