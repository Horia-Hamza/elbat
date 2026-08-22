import React, { useState } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, Save, HelpCircle, Globe, Share2 } from 'lucide-react';
import { getStoreSettings, saveStoreSettings } from '../../utils/storeSettings';

export const AdminDashboard: React.FC = () => {
  const [settings, setSettings] = useState(getStoreSettings());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    saveStoreSettings(settings);
    setSaveStatus('تم حفظ جميع إعدادات وبيانات المتجر بنجاح! سيتم تطبيق التغييرات فوراً.');
    setTimeout(() => setSaveStatus(null), 5000);
  };

  return (
    <div>
      <div className="admin-stats-grid">
        <div className="admin-card stat-card">
          <div className="stat-icon blue">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <h4>إجمالي الطلبات</h4>
            <div className="stat-val">1,284</div>
          </div>
        </div>
        
        <div className="admin-card stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h4>إجمالي المبيعات</h4>
            <div className="stat-val">48,390 ج.م</div>
          </div>
        </div>
        
        <div className="admin-card stat-card">
          <div className="stat-icon orange">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h4>المنتجات النشطة</h4>
            <div className="stat-val">342</div>
          </div>
        </div>
        
        <div className="admin-card stat-card">
          <div className="stat-icon red">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h4>العملاء الجدد</h4>
            <div className="stat-val">89</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Contact Info & Social Settings Card */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem' }}>
            <Globe size={20} style={{ color: 'var(--admin-primary)' }} />
            <h3 style={{ color: 'var(--admin-text-main)', margin: 0 }}>بيانات وإعدادات المتجر العامة</h3>
          </div>

          {/* Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>
              البريد الإلكتروني للمتجر (Email):
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Phone Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>
              رقم الهاتف للتواصل (Phone):
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* WhatsApp API Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>
              رقم الواتساب للربط المباشر (WhatsApp Link Number - بدون مفتاح وبدون مسافات):
            </label>
            <input
              type="text"
              placeholder="مثال: 201065613067"
              value={settings.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Facebook Link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>
              رابط صفحة فيسبوك (Facebook Page):
            </label>
            <input
              type="text"
              value={settings.facebook}
              onChange={(e) => handleInputChange('facebook', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Instagram Link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>
              رابط صفحة إنستجرام (Instagram):
            </label>
            <input
              type="text"
              value={settings.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* TikTok Link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>
              رابط صفحة تيك توك (TikTok):
            </label>
            <input
              type="text"
              value={settings.tiktok}
              onChange={(e) => handleInputChange('tiktok', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Pixel and Ad Settings Card */}
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem' }}>
              <Share2 size={20} style={{ color: '#10b981' }} />
              <h3 style={{ color: 'var(--admin-text-main)', margin: 0 }}>إعدادات التتبع والإعلانات</h3>
            </div>

            {/* Meta Pixel Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>
                معرّف Meta (Facebook) Pixel ID:
              </label>
              <input
                type="text"
                placeholder="مثال: 2538832046546163"
                value={settings.fbPixelId}
                onChange={(e) => handleInputChange('fbPixelId', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* TikTok Pixel Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-text-main)' }}>
                معرّف TikTok Pixel ID:
              </label>
              <input
                type="text"
                placeholder="مثال: CQ5K1HBC77U0O1FG8900"
                value={settings.tiktokPixelId}
                onChange={(e) => handleInputChange('tiktokPixelId', e.target.value)}
                style={inputStyle}
              />
            </div>

            {saveStatus && (
              <div style={{ fontSize: '0.85rem', color: '#10b981', backgroundColor: '#ecfdf5', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                {saveStatus}
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                backgroundColor: 'var(--admin-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-primary)'}
            >
              <Save size={16} />
              حفظ جميع الإعدادات
            </button>
          </div>

          {/* Help Guidelines Card */}
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem' }}>
              <HelpCircle size={20} style={{ color: '#ff9800' }} />
              <h3 style={{ color: 'var(--admin-text-main)', margin: 0 }}>مساعد لوحة التحكم</h3>
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.8rem', lineHeight: '1.5' }}>
              <div>
                <strong style={{ color: 'var(--admin-text-main)', display: 'block', marginBottom: '0.15rem' }}>📌 ربط وحفظ البيانات:</strong>
                البيانات المحفوظة يتم إمدادها تلقائياً لكافة صفحات المتجر والسياسات، بما في ذلك أسفل الصفحة (Footer) وزر الواتساب للتواصل والسياسات الرسمية للمتجر لضمان التوافق المطلق مع شركات الدفع والشحن.
              </div>

              <div>
                <strong style={{ color: 'var(--admin-text-main)', display: 'block', marginBottom: '0.15rem' }}>📌 معرّفات البكسل (Pixel IDs):</strong>
                يُمكن الحصول على معرّف Meta Pixel ID من خلال تبويب **Datasets** الجديد في Events Manager فيسبوك. بينما يتم نسخ TikTok Pixel ID من لوحة TikTok Ads Manager.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '0.6rem 0.8rem',
  border: '1px solid var(--admin-border)',
  borderRadius: '8px',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
  backgroundColor: 'var(--admin-bg-light)',
  color: 'var(--admin-text-main)',
};

export default AdminDashboard;
