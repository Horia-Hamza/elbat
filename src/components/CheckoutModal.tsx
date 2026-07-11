import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, Truck, Check, Sparkles,
  User, MapPin, ShoppingBag, Loader2, AlertCircle, ChevronDown
} from 'lucide-react';
import type { CartItem } from './CartDrawer';
import { paymentsApi } from '../api/payments';
import { authApi } from '../api/auth';
import { shippingZonesApi } from '../api/shippingZones';
import type { ShippingZone } from '../api/shippingZones';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onCheckoutSuccess: (orderId: string, customerName: string) => void;
}

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.95rem',
  fontFamily: 'var(--font-family)',
  color: 'var(--text-main)',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: '700',
  color: 'var(--primary-dark)',
  marginBottom: '0.3rem',
};

const GROUP: React.CSSProperties = { marginBottom: '0.9rem' };

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onCheckoutSuccess,
}) => {
  const [step, setStep] = useState(1); // 1: Personal, 2: Shipping, 3: Summary

  // ── Personal Info ──────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // ── Shipping Info ──────────────────────────────
  const [country, setCountry] = useState('مصر');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // ── Shipping Zones ────────────────────────────
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);

  // ── UI State ───────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');

  // ── Totals ─────────────────────────────────────────────────
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.basePrice) * item.quantity,
    0
  );
  // Use selected zone cost if available, otherwise default 250
  const shippingFee = selectedZone
    ? (selectedZone.freeShippingThreshold != null && subtotal >= selectedZone.freeShippingThreshold
        ? 0
        : selectedZone.cost)
    : 250;
  const total = subtotal + shippingFee;

  // ── Helpers ────────────────────────────────────────────────
  const resolveVariantId = (item: CartItem): number | null => {
    if (!item.product.variants?.length) return null;
    const matched = item.product.variants.find(
      (v) => (!item.color || v.color === item.color) && (!item.size || v.size === item.size)
    );
    return matched?.id ?? item.product.variants[0].id;
  };

  // ── Fetch active zones when entering step 2 ────────────
  useEffect(() => {
    if (step === 2 && zones.length === 0 && !zonesLoading) {
      setZonesLoading(true);
      shippingZonesApi.getActive()
        .then(data => setZones(Array.isArray(data) ? data : []))
        .catch(() => setZones([]))
        .finally(() => setZonesLoading(false));
    }
  }, [step]);

  // ── Zone selection handler ──────────────────────
  const handleZoneChange = (zoneId: string) => {
    const zone = zones.find(z => z.id === Number(zoneId)) ?? null;
    setSelectedZone(zone);
    if (zone) {
      setState(zone.state);   // auto-fill state (sent to API)
      setCity(zone.name);     // city = Arabic display name
      setCountry('مصر');      // default country
    } else {
      setState('');
      setCity('');
    }
  };

  // ── Navigation ──────────────────────────────────
  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      // Validate based on payment method
      if (paymentMethod === 'online') {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
          setError('الرجاء تعبئة الاسم الأول، الاسم الأخير، البريد الإلكتروني، رقم الجوال، وكلمة المرور للدفع الإلكتروني.');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('الرجاء إدخال بريد إلكتروني صحيح.');
          return;
        }
      } else {
        // COD: Email & Password are optional. First Name, Last Name, and Phone are required.
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
          setError('الرجاء تعبئة الاسم الأول، الاسم الأخير، ورقم الجوال.');
          return;
        }
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('الرجاء إدخال بريد إلكتروني صحيح.');
          return;
        }
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedZone) {
        setError('الرجاء اختيار المحافظة أولاً.');
        return;
      }
      if (!addressLine1.trim()) {
        setError('الرجاء إدخال عنوان التوصيل.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  // ── Place Order ────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setError(null);
    setLoading(true);

    const items = cartItems.map((item) => ({
      productId: item.product.id,
      variantId: resolveVariantId(item),
      quantity: item.quantity,
    }));

    const checkoutPayload = {
      firstName,
      lastName,
      email:         email.trim()         || null,
      phoneNumber: phone,
      password:      password.trim()      || null,
      country:       country.trim()       || null,
      state:         state.trim()         || null,
      city:          city.trim()          || null,
      addressLine1:  addressLine1.trim()  || null,
      addressLine2:  addressLine2.trim()  || null,
      couponId:      couponCode.trim()    ? 0 : null,   // couponId resolved from code; pass null if absent
      notes:         notes.trim()         || null,
      items,
    };

    const registerPayload = { email, password, firstName, lastName };

    try {
      // Call both APIs simultaneously
      const [checkoutResult, registerResult] = await Promise.allSettled([
        paymentsApi.checkoutAsGuest(checkoutPayload),
        ...(password.trim() && email.trim() ? [authApi.register(registerPayload)] : []),
      ]);

      // Checkout must succeed
      if (checkoutResult.status === 'rejected') {
        throw new Error(checkoutResult.reason?.message || 'فشل إتمام الطلب');
      }

      // Register failure is non-blocking (user may already exist)
      if (registerResult && registerResult.status === 'rejected') {
        console.warn('Register skipped / failed:', registerResult.reason?.message);
      }

      const orderData = checkoutResult.value;

      // ── Handle Payment Method Redirection / Process ───────────
      if (paymentMethod === 'cod') {
        const orderIdNumber = Number(orderData?.orderId || orderData?.id || 0);
        if (orderIdNumber > 0) {
          try {
            await paymentsApi.processPayment(orderIdNumber, 'COD');
          } catch (e) {
            console.error('Failed to set payment method to COD on backend:', e);
          }
        }
        resetForm();
        const orderNum = orderData?.orderNumber || `COD-${orderIdNumber || Date.now()}`;
        // Redirect to local payment success page mimicking Paymob callback format
        window.location.href = `/payment/success?success=true&merchant_order_id=${orderNum}&amount_cents=${total * 100}&currency=EGP&source_data.type=cod&data.message=Approved`;
        return;
      }

      if (orderData?.checkoutUrl) {
        resetForm();
        window.location.href = orderData.checkoutUrl;
        return;
      }

      // Fallback: no payment URL — treat as completed locally
      const orderId =
        orderData?.orderId?.toString() ||
        orderData?.orderNumber ||
        'BAT-' + Math.floor(Math.random() * 900000 + 100000);

      onCheckoutSuccess(orderId, `${firstName} ${lastName}`);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setPhone('');
    setCountry('مصر'); setState(''); setCity(''); setAddressLine1('');
    setAddressLine2(''); setNotes(''); setCouponCode('');
    setSelectedZone(null);
    setPaymentMethod('online');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '580px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button className="modal-close-btn" onClick={onClose} title="إغلاق">
          <X size={20} />
        </button>

        {/* Step Indicator */}
        <div className="checkout-steps">
          {[
            { label: 'البيانات الشخصية', icon: <User size={14} /> },
            { label: 'الشحن والتوصيل', icon: <MapPin size={14} /> },
            { label: 'تأكيد الطلب', icon: <ShoppingBag size={14} /> },
          ].map((s, i) => (
            <div
              key={i}
              className={`step-node ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}
            >
              <div className="step-circle">
                {step > i + 1 ? <Check size={15} /> : (step === i + 1 ? s.icon : i + 1)}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="checkout-form-body" style={{ overflowY: 'auto', flex: 1 }}>

          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#FFF3F3', border: '1px solid #FFCDD2',
              borderRadius: 'var(--radius-sm)', padding: '0.7rem 1rem',
              marginBottom: '1rem', color: '#C62828', fontSize: '0.88rem',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} /> بيانات العميل والحساب وطريقة الدفع
              </h3>

              {/* Payment Method Selection upfront */}
              <div style={{ marginBottom: '1.2rem', background: '#F8FBFD', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700 }}>💳 اختر طريقة الدفع المفضلة</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      border: `2px solid ${paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border)'}`,
                      background: paymentMethod === 'cod' ? 'var(--primary-light)' : '#fff',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.8rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: paymentMethod === 'cod' ? '0 4px 12px rgba(35,107,147,0.1)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>💵 دفع عند الاستلام</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الدفع نقداً للمندوب</span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('online')}
                    style={{
                      border: `2px solid ${paymentMethod === 'online' ? 'var(--primary)' : 'var(--border)'}`,
                      background: paymentMethod === 'online' ? 'var(--primary-light)' : '#fff',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.8rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: paymentMethod === 'online' ? '0 4px 12px rgba(35,107,147,0.1)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>💳 بطاقة / محفظة</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>دفع إلكتروني آمن</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={GROUP}>
                  <label style={LABEL_STYLE}>الاسم الأول *</label>
                  <input style={FIELD_STYLE} placeholder="أحمد" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div style={GROUP}>
                  <label style={LABEL_STYLE}>الاسم الأخير *</label>
                  <input style={FIELD_STYLE} placeholder="محمد" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>

              <div style={GROUP}>
                <label style={LABEL_STYLE}>
                  البريد الإلكتروني {paymentMethod === 'online' ? '*' : '(اختياري)'}
                </label>
                <input style={FIELD_STYLE} type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
              </div>

              <div style={GROUP}>
                <label style={LABEL_STYLE}>رقم الجوال *</label>
                <input style={FIELD_STYLE} type="tel" placeholder="05xxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" />
              </div>

              <div style={GROUP}>
                <label style={LABEL_STYLE}>
                  كلمة المرور {paymentMethod === 'online' ? '*' : '(اختياري — لإنشاء حساب)'}
                </label>
                <input style={FIELD_STYLE} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} dir="ltr" />
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                💡 {paymentMethod === 'online' ? 'يرجى إدخال كلمة المرور والبريد الإلكتروني لإتمام الدفع الإلكتروني الآمن وإنشاء حسابك.' : 'إذا أضفت كلمة مرور وبريد إلكتروني، سيتم إنشاء حساب لك تلقائياً عند إتمام الطلب.'}
              </p>
            </div>
          )}

          {/* ── Step 2: Shipping ── */}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} /> معلومات الشحن والتوصيل
              </h3>

              {/* Governorate / Zone picker */}
              <div style={GROUP}>
                <label style={LABEL_STYLE}>المحافظة *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    style={{
                      ...FIELD_STYLE,
                      appearance: 'none',
                      paddingLeft: '2.2rem',
                      cursor: 'pointer',
                      color: selectedZone ? 'var(--text-main)' : 'var(--text-muted)',
                    }}
                    value={selectedZone?.id ?? ''}
                    onChange={e => handleZoneChange(e.target.value)}
                    disabled={zonesLoading}
                  >
                    <option value="" disabled>
                      {zonesLoading ? 'جاري تحميل المحافظات...' : 'اختر المحافظة'}
                    </option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)' }}>
                    {zonesLoading
                      ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Zone info card — shown after selection */}
              {selectedZone && (
                <div style={{
                  display: 'flex', gap: '1rem', flexWrap: 'wrap',
                  background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem', marginBottom: '0.9rem',
                  border: '1px solid rgba(35,107,147,0.2)',
                  fontSize: '0.85rem',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>رسوم الشحن: </span>
                    <strong style={{ color: 'var(--primary)' }}>
                      {selectedZone.freeShippingThreshold != null && subtotal >= selectedZone.freeShippingThreshold
                        ? 'مجاني 🎉'
                        : `${selectedZone.cost.toLocaleString()} ج.م`}
                    </strong>
                  </div>
                  {selectedZone.freeShippingThreshold != null && subtotal < selectedZone.freeShippingThreshold && (
                    <div style={{ color: 'var(--text-muted)' }}>
                      شحن مجاني من <strong>{selectedZone.freeShippingThreshold.toLocaleString()} ج.م</strong>
                    </div>
                  )}
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>التوصيل خلال: </span>
                    <strong>{selectedZone.estimatedDaysMin}–{selectedZone.estimatedDaysMax} يوم</strong>
                  </div>
                </div>
              )}

              <div style={GROUP}>
                <label style={LABEL_STYLE}>العنوان التفصيلي *</label>
                <input style={FIELD_STYLE} placeholder="الشارع، رقم المبنى، الحي..." value={addressLine1} onChange={e => setAddressLine1(e.target.value)} />
              </div>

              <div style={GROUP}>
                <label style={LABEL_STYLE}>عنوان إضافي (اختياري)</label>
                <input style={FIELD_STYLE} placeholder="الدور، الشقة، علامة مميزة..." value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={GROUP}>
                  <label style={LABEL_STYLE}>كوبون الخصم (اختياري)</label>
                  <input style={FIELD_STYLE} placeholder="أدخل الكوبون" value={couponCode} onChange={e => setCouponCode(e.target.value)} dir="ltr" />
                </div>
                <div style={GROUP}>
                  <label style={LABEL_STYLE}>ملاحظات للطلب</label>
                  <input style={FIELD_STYLE} placeholder="أي تعليمات خاصة..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Summary ── */}
          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: 'var(--secondary-hover)' }} /> مراجعة وتأكيد طلبك
              </h3>

              {/* Customer Summary */}
              <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>👤 بيانات العميل</h4>
                <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>{firstName} {lastName}</p>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{email} &nbsp;|&nbsp; {phone}</p>
              </div>

              {/* Shipping Summary */}
              <div style={{ background: 'var(--cyan-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📍 عنوان التوصيل</h4>
                <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>{city}{state ? `، ${state}` : ''}، {country}</p>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{addressLine1}{addressLine2 ? ` — ${addressLine2}` : ''}</p>
              </div>

              {/* Payment Method Review */}
              <div style={{ background: '#F8FBFD', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 700 }}>💳 طريقة الدفع المحددة</h4>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {paymentMethod === 'cod' ? '💵 دفع عند الاستلام' : '💳 دفع إلكتروني (بطاقة / محفظة)'}
                </p>
              </div>

              {/* Items */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontSize: '0.9rem' }}>
                  🛒 ملخص المنتجات
                </h4>
                <div style={{ maxHeight: '130px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span>
                        {item.product.name}
                        <span style={{ color: 'var(--text-muted)' }}> x{item.quantity}</span>
                        {item.size && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> ({item.size})</span>}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {((item.product.salePrice ?? item.product.basePrice) * item.quantity).toLocaleString()} ج.م
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                {[
                  { label: 'المجموع الفرعي', val: `${subtotal.toLocaleString()} ج.م` },
                  { label: 'تكلفة الشحن', val: shippingFee === 0 ? 'مجاني 🎉' : `${shippingFee} ج.م` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span>{r.label}:</span><span>{r.val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', borderTop: '1px dashed var(--border)', paddingTop: '0.6rem', marginTop: '0.5rem' }}>
                  <span>الإجمالي:</span>
                  <span>{total.toLocaleString()} ج.م</span>
                </div>
              </div>

              {password.trim() && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  ✅ سيتم إنشاء حسابك تلقائياً وإرسال تأكيد إلى {email}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="checkout-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          {step > 1 ? (
            <button className="btn-secondary" onClick={handlePrevStep} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              السابق <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn-secondary" onClick={onClose} disabled={loading}>إلغاء</button>
          )}

          {step < 3 ? (
            <button className="btn-primary" onClick={handleNextStep}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChevronLeft size={16} /> التالي
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handlePlaceOrder}
              disabled={loading}
              style={{
                backgroundColor: loading ? 'var(--text-muted)' : 'var(--success)',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(76,175,80,0.3)',
                display: 'flex', alignItems: 'center', gap: '8px',
                minWidth: '160px', justifyContent: 'center',
              }}
            >
              {loading ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري المعالجة...</>
              ) : (
                <>✅ تأكيد الدفع والطلب</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
