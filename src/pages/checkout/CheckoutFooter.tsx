import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface CheckoutFooterProps {
  isLoading: boolean;
  isDisabled: boolean;
  total: number;
  onSubmit: () => void;
}

const CheckoutFooter: React.FC<CheckoutFooterProps> = ({
  isLoading,
  isDisabled,
  total,
  onSubmit,
}) => {
  return (
    <div className="checkout-footer" id="checkout-footer">
      <div className="checkout-footer-inner">
        <button
          id="complete-order-btn"
          className={`complete-order-btn ${isDisabled ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={onSubmit}
          disabled={isDisabled || isLoading}
          type="button"
          aria-label="إتمام الطلب"
        >
          {isLoading ? (
            <span className="btn-spinner" />
          ) : (
            <>
              <Lock size={20} strokeWidth={2.5} />
              <span>إتمام الطلب — {total.toLocaleString()} EGP</span>
            </>
          )}
        </button>

        <div className="checkout-trust-note">
          <ShieldCheck size={14} strokeWidth={2} />
          <span>بياناتك محمية ومش هتتستخدم إلا لإتمام طلبك</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFooter;
