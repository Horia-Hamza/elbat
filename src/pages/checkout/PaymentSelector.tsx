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

        {/* Online Payment */}
        <button
          id="payment-online"
          className={`payment-option ${selected === 'online' ? 'active' : ''}`}
          onClick={() => onChange('online')}
          type="button"
          aria-pressed={selected === 'online'}
        >
          <div className="payment-option-left">
            <div className="payment-radio">
              {selected === 'online' && <Check size={13} strokeWidth={3} />}
            </div>
            <div className="payment-icon payment-icon-online">
              <CreditCard size={22} strokeWidth={1.8} />
            </div>
            <div className="payment-info">
              <span className="payment-name">دفع أونلاين</span>
              <span className="payment-desc">فيزا / ماستركارد / فودافون كاش / إنستاباي</span>
            </div>
          </div>
          <span className="payment-tag payment-tag-secure">🔒 آمن 100%</span>
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
