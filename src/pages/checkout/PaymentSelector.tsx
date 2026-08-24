import React from 'react';
import { Banknote, CreditCard, Check } from 'lucide-react';
import type { PaymentMethod } from './types';

interface PaymentSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = ({ selected, onChange }) => {
  return (
    <section className="payment-section" id="payment-method">
      <h2 className="section-heading">طريقة الدفع</h2>

      <div className="payment-options">
        {/* Cash on Delivery */}
        <button
          id="payment-cod"
          className={`payment-option ${selected === 'cod' ? 'active' : ''}`}
          onClick={() => onChange('cod')}
          type="button"
          aria-pressed={selected === 'cod'}
        >
          <div className="payment-option-left">
            <div className="payment-radio">
              {selected === 'cod' && <Check size={13} strokeWidth={3} />}
            </div>
            <div className="payment-icon payment-icon-cod">
              <Banknote size={22} strokeWidth={1.8} />
            </div>
            <div className="payment-info">
              <span className="payment-name">كاش عند الاستلام</span>
              <span className="payment-desc">ادفع لما تستلم الطلب على بابك</span>
            </div>
          </div>
          <span className="payment-tag">الأكثر استخداماً</span>
        </button>

        {/* Online Payment (Disabled) */}
        <button
          id="payment-online"
          className="payment-option disabled"
          style={{ opacity: 0.55, cursor: 'not-allowed', background: '#F8FAFC', borderStyle: 'dashed' }}
          type="button"
          disabled
          title="الدفع الإلكتروني غير مفعل حالياً"
        >
          <div className="payment-option-left">
            <div className="payment-radio" style={{ opacity: 0.4 }}>
            </div>
            <div className="payment-icon payment-icon-online" style={{ opacity: 0.5 }}>
              <CreditCard size={22} strokeWidth={1.8} />
            </div>
            <div className="payment-info">
              <span className="payment-name" style={{ color: '#64748B' }}>دفع أونلاين (بطاقة / محفظة)</span>
              <span className="payment-desc">غير مفعل حالياً — المتاح حالياً الدفع عند الاستلام</span>
            </div>
          </div>
          <span className="payment-tag" style={{ background: '#E2E8F0', color: '#64748B' }}>قريباً</span>
        </button>
      </div>

      {/* Online payment explanation */}
      {selected === 'online' && (
        <div className="payment-online-note">
          <p>
            هتتحول لصفحة الدفع الآمنة بعد ما تضغط "إتمام الطلب". بياناتك محمية بتشفير SSL
            ولا يتم حفظ بيانات الكارت على سيرفراتنا.
          </p>
        </div>
      )}
    </section>
  );
};

export default PaymentSelector;
