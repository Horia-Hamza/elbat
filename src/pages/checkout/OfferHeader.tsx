import React from 'react';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { BUNDLE_PRICE, BUNDLE_ORIGINAL_PRICE } from '../../data/pajamas';

const OfferHeader: React.FC = () => {
  const discount = Math.round(((BUNDLE_ORIGINAL_PRICE - BUNDLE_PRICE) / BUNDLE_ORIGINAL_PRICE) * 100);

  return (
    <div className="offer-header">
      <div className="offer-header-inner">
        {/* Urgency badge */}
        <div className="offer-badge">
          <span className="fire-emoji">🔥</span>
          <span>عرض محدود — اطلب الآن قبل نفاد الكمية</span>
        </div>

        {/* Main headline */}
        <h1 className="offer-title">
          اختار أي <span className="highlight-3">3 بجامات</span>
        </h1>

        {/* Price display */}
        <div className="offer-price-block">
          <div className="offer-current-price">
            <span className="price-label">بس بـ</span>
            <span className="price-amount">EGP {BUNDLE_PRICE.toLocaleString()}</span>
          </div>
          <div className="offer-old-price">
            <span>بدل {BUNDLE_ORIGINAL_PRICE.toLocaleString()} EGP</span>
            <span className="discount-badge">وفّر {discount}%</span>
          </div>
        </div>

        <p className="offer-subtitle">
          اختار أي ٣ بجامات من كوليكشن الموسم — قماش ناعم، مقاسات متاحة، ألوان متعددة.
        </p>

        {/* Trust badges */}
        <div className="trust-badges">
          <div className="trust-badge">
            <div className="trust-badge-icon">
              <Truck size={18} strokeWidth={2.5} />
            </div>
            <span>كاش عند الاستلام</span>
          </div>
          <div className="trust-badge">
            <div className="trust-badge-icon">
              <CreditCard size={18} strokeWidth={2.5} />
            </div>
            <span>دفع أونلاين آمن</span>
          </div>
          <div className="trust-badge">
            <div className="trust-badge-icon">
              <ShieldCheck size={18} strokeWidth={2.5} />
            </div>
            <span>شحن سريع لكل مصر</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferHeader;
