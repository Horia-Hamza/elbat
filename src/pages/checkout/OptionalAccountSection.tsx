import React from 'react';
import { ChevronDown, ChevronUp, Mail, Lock, UserPlus } from 'lucide-react';
import type { AccountDetails } from './types';

interface OptionalAccountSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  accountDetails: AccountDetails;
  onChange: (field: keyof AccountDetails, value: string) => void;
}

const OptionalAccountSection: React.FC<OptionalAccountSectionProps> = ({
  isOpen,
  onToggle,
  accountDetails,
  onChange,
}) => {
  return (
    <section className="optional-account-section" id="create-account">
      <button
        className="optional-account-toggle"
        onClick={onToggle}
        type="button"
        aria-expanded={isOpen}
        aria-controls="account-fields"
      >
        <div className="optional-account-toggle-left">
          <div className="optional-account-icon">
            <UserPlus size={18} strokeWidth={2} />
          </div>
          <div>
            <span className="optional-account-title">إنشاء حساب (اختياري)</span>
            <span className="optional-account-subtitle">تتبع طلباتك وتسوق أسرع في المرة الجاية</span>
          </div>
        </div>
        <div className="optional-account-chevron">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="optional-account-fields" id="account-fields">
          <p className="optional-account-note">
            ✨ كل الحقول دي اختيارية — الطلب هيكتمل حتى لو فضلتها فاضية
          </p>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="account-email" className="form-label">
              البريد الإلكتروني
              <span className="optional-tag">(اختياري)</span>
            </label>
            <div className="form-input-wrap">
              <Mail size={17} className="form-input-icon" />
              <input
                id="account-email"
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={accountDetails.email}
                onChange={(e) => onChange('email', e.target.value)}
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="account-password" className="form-label">
              كلمة المرور
              <span className="optional-tag">(اختياري)</span>
            </label>
            <div className="form-input-wrap">
              <Lock size={17} className="form-input-icon" />
              <input
                id="account-password"
                type="password"
                className="form-input"
                placeholder="على الأقل 8 أحرف"
                value={accountDetails.password}
                onChange={(e) => onChange('password', e.target.value)}
                autoComplete="new-password"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OptionalAccountSection;
