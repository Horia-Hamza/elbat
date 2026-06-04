import React, { useState } from 'react';
import { X, CreditCard, ChevronLeft, ChevronRight, Truck, Check, Sparkles } from 'lucide-react';
import type { CartItem } from './CartDrawer';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onCheckoutSuccess: (orderId: string, customerName: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onCheckoutSuccess
}) => {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Order Summary

  // بيانات الشحن
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('الرياض');
  const [address, setAddress] = useState('');

  // بيانات الدفع
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // حساب التكلفة
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shippingFee;

  // معالجة مدخلات رقم البطاقة لتباعد كل 4 أرقام
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // معالجة تاريخ الانتهاء MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setExpiry(val);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName.trim() || !phone.trim() || !address.trim()) {
        alert('الرجاء تعبئة جميع بيانات الشحن الإلزامية!');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16 || !cardName.trim() || expiry.length < 5 || cvv.length < 3) {
        alert('الرجاء إدخال تفاصيل بطاقة دفع صحيحة ومكتملة!');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePlaceOrder = () => {
    // محاكاة وضع الطلب ونقل المستخدم للنجاح والتتبع
    const mockOrderId = 'BAT-' + Math.floor(Math.random() * 900000 + 100000);
    onCheckoutSuccess(mockOrderId, fullName);
    setStep(1); // إعادة التصفير
    // تفريغ البيانات
    setFullName('');
    setPhone('');
    setAddress('');
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        {/* زر الإغلاق */}
        <button className="modal-close-btn" onClick={onClose} title="إغلاق">
          <X size={20} />
        </button>

        {/* شريط خطوات الدفع */}
        <div className="checkout-steps">
          <div className={`step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 1 ? <Check size={16} /> : '1'}</div>
            <span className="step-label">بيانات الشحن</span>
          </div>
          <div className={`step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 2 ? <Check size={16} /> : '2'}</div>
            <span className="step-label">تفاصيل الدفع</span>
          </div>
          <div className={`step-node ${step >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">تأكيد الطلب</span>
          </div>
        </div>

        {/* جسم النماذج */}
        <div className="checkout-form-body">
          {/* الخطوة 1: الشحن */}
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} />
                معلومات التوصيل والشحن
              </h3>
              <div className="form-group">
                <label className="form-label">الاسم الكامل *</label>
                <input
                  type="text"
                  placeholder="أدخل اسمك الثلاثي"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">رقم الجوال *</label>
                  <input
                    type="tel"
                    placeholder="05xxxxxxx"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">المدينة</label>
                  <select 
                    className="form-input" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    style={{ appearance: 'auto' }}
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">عنوان التوصيل بالتفصيل *</label>
                <textarea
                  placeholder="الحي، اسم الشارع، رقم المبنى..."
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* الخطوة 2: الدفع */}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} />
                الدفع الإلكتروني الآمن
              </h3>

              {/* 💳 بطاقة الدفع التفاعلية */}
              <div className="card-simulation-container">
                <div className="credit-card-mock">
                  <div>
                    <img 
                      src="/logo.png" 
                      alt="شعار مائي للبطاقة" 
                      className="card-duck-logo"
                    />
                    <div className="card-chip" />
                  </div>

                  <div className="card-number-display">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="card-meta-row">
                    <div>
                      <div className="card-meta-label">حامل البطاقة</div>
                      <div className="card-meta-val">{cardName || 'الاسم الكامل'}</div>
                    </div>
                    <div>
                      <div className="card-meta-label">الانتهاء</div>
                      <div className="card-meta-val">{expiry || 'MM/YY'}</div>
                    </div>
                    <div>
                      <div className="card-meta-label">CVV</div>
                      <div className="card-meta-val">{cvv || '•••'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* حقول مدخلات البطاقة */}
              <div className="form-group">
                <label className="form-label">اسم صاحب البطاقة *</label>
                <input
                  type="text"
                  placeholder="كما هو مكتوب على البطاقة"
                  className="form-input"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">رقم البطاقة *</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="form-input"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">تاريخ انتهاء الصلاحية *</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="form-input"
                    value={expiry}
                    onChange={handleExpiryChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">الرمز السري (CVV) *</label>
                  <input
                    type="password"
                    placeholder="•••"
                    className="form-input"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* الخطوة 3: ملخص الطلب */}
          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--secondary-hover)' }} />
                مراجعة وتأكيد طلبك
              </h3>
              
              <div style={{ backgroundColor: 'var(--primary-light)', padding: '1.2rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.8rem' }}>📍 عنوان الشحن والتوصيل</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{fullName}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{city} - {address}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>الهاتف: {phone}</p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  🛒 ملخص المنتجات
                </h4>
                
                <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-main)' }}>
                        {item.product.title} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                        {item.size && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> ({item.size})</span>}
                      </span>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>{item.product.price * item.quantity} ج.م</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal} ج.م</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <span>تكلفة الشحن الدولي والتوصيل:</span>
                  <span>{shippingFee === 0 ? 'شحن مجاني' : `${shippingFee} ج.م`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', borderTop: '1px dashed var(--border)', paddingTop: '0.6rem', marginTop: '0.6rem' }}>
                  <span>المبلغ الإجمالي للدفع:</span>
                  <span>{total} ج.م</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* أزرار التنقل والتحكم */}
        <div className="checkout-actions">
          {step > 1 ? (
            <button className="btn-secondary" onClick={handlePrevStep} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              السابق
              <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn-secondary" onClick={onClose}>
              إلغاء الطلب
            </button>
          )}

          {step < 3 ? (
            <button className="btn-primary" onClick={handleNextStep} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChevronLeft size={16} />
              الخطوة التالية
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handlePlaceOrder}
              style={{ backgroundColor: 'var(--success)', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)' }}
            >
              دفع وتأكيد الطلب الآن 💳
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
