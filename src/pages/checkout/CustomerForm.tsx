import React from 'react';
import { User, Phone, MapPin, FileText, ChevronDown, Loader2, Truck } from 'lucide-react';
import type { CustomerDetails } from './types';
import type { ShippingZone } from '../../api/shippingZones';

interface CustomerFormProps {
  details: CustomerDetails;
  onChange: (field: keyof CustomerDetails, value: string) => void;
  // Shipping zones from API
  zones: ShippingZone[];
  zonesLoading: boolean;
  selectedZone: ShippingZone | null;
  onZoneChange: (zone: ShippingZone | null) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  details,
  onChange,
  zones,
  zonesLoading,
  selectedZone,
  onZoneChange,
}) => {
  const handleZoneSelect = (zoneId: string) => {
    if (!zoneId) {
      onZoneChange(null);
      return;
    }
    const zone = zones.find((z) => z.id === Number(zoneId)) ?? null;
    onZoneChange(zone);
  };

  return (
    <section className="customer-form-section" id="customer-details">
      <h2 className="section-heading">بيانات التوصيل</h2>
      <p className="section-subheading">كل الحقول مطلوبة ما عدا الملاحظات</p>

      <div className="form-fields">
        {/* First Name + Last Name row */}
        <div className="form-row-two">
          <div className="form-group">
            <label htmlFor="customer-firstname" className="form-label">
              الاسم الأول
            </label>
            <div className="form-input-wrap">
              <User size={17} className="form-input-icon" />
              <input
                id="customer-firstname"
                type="text"
                className="form-input"
                placeholder="محمد"
                value={details.firstName}
                onChange={(e) => onChange('firstName', e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="customer-lastname" className="form-label">
              الاسم الأخير
            </label>
            <div className="form-input-wrap">
              <User size={17} className="form-input-icon" />
              <input
                id="customer-lastname"
                type="text"
                className="form-input"
                placeholder="أحمد"
                value={details.lastName}
                onChange={(e) => onChange('lastName', e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="customer-phone" className="form-label">
            رقم الموبايل
          </label>
          <div className="form-input-wrap">
            <Phone size={17} className="form-input-icon" />
            <input
              id="customer-phone"
              type="tel"
              className="form-input"
              placeholder="01XXXXXXXXX"
              value={details.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              autoComplete="tel"
              required
              dir="ltr"
            />
          </div>
        </div>

        {/* Governorate — real shipping zones from API */}
        <div className="form-group">
          <label htmlFor="customer-gov" className="form-label">
            المحافظة
          </label>
          <div className="form-input-wrap form-select-wrap">
            <MapPin size={17} className="form-input-icon" />
            <select
              id="customer-gov"
              className="form-input form-select"
              value={selectedZone?.id ?? ''}
              onChange={(e) => handleZoneSelect(e.target.value)}
              disabled={zonesLoading}
              required
            >
              <option value="">
                {zonesLoading ? 'جاري تحميل المحافظات...' : 'اختار المحافظة'}
              </option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
            <div className="select-chevron">
              {zonesLoading ? (
                <Loader2 size={16} className="spinner-icon" />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </div>

          {/* Shipping zone info card */}
          {selectedZone && (
            <div className="zone-info-card">
              <div className="zone-info-row">
                <Truck size={14} />
                <span>
                  رسوم الشحن:{' '}
                  <strong>
                    {selectedZone.cost === 0
                      ? 'مجاني 🎉'
                      : `${selectedZone.cost.toLocaleString()} ج.م`}
                  </strong>
                </span>
              </div>
              <div className="zone-info-row">
                <span>
                  التوصيل خلال:{' '}
                  <strong>
                    {selectedZone.estimatedDaysMin}–{selectedZone.estimatedDaysMax} يوم عمل
                  </strong>
                </span>
              </div>
              {selectedZone.freeShippingThreshold != null && selectedZone.cost > 0 && (
                <div className="zone-info-row zone-info-tip">
                  <span>
                    💡 شحن مجاني عند الطلب فوق{' '}
                    <strong>{selectedZone.freeShippingThreshold.toLocaleString()} ج.م</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="customer-address" className="form-label">
            العنوان بالتفصيل
          </label>
          <div className="form-input-wrap">
            <MapPin size={17} className="form-input-icon" />
            <input
              id="customer-address"
              type="text"
              className="form-input"
              placeholder="الشارع، الحي، رقم المبنى..."
              value={details.address}
              onChange={(e) => onChange('address', e.target.value)}
              autoComplete="street-address"
              required
            />
          </div>
        </div>

        {/* Notes (optional) */}
        <div className="form-group">
          <label htmlFor="customer-notes" className="form-label">
            ملاحظات إضافية
            <span className="optional-tag">(اختياري)</span>
          </label>
          <div className="form-input-wrap">
            <FileText size={17} className="form-input-icon" style={{ top: '1rem' }} />
            <textarea
              id="customer-notes"
              className="form-input form-textarea"
              placeholder="أي تعليمات خاصة للتوصيل..."
              value={details.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerForm;
