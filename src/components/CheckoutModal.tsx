import React, { useState, useEffect, useRef } from 'react';
import {
  X, ChevronLeft, ChevronRight, Truck, Check, Sparkles,
  User, MapPin, ShoppingBag, Loader2, AlertCircle, ChevronDown,
  Home, FileText, Edit2, Phone, Mail
} from 'lucide-react';
import type { CartItem } from './CartDrawer';
import { paymentsApi } from '../api/payments';
import { authApi } from '../api/auth';
import { shippingZonesApi } from '../api/shippingZones';
import type { ShippingZone } from '../api/shippingZones';
import { trackPurchase } from '../utils/tracking';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
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
}) => {
  const formBodyRef = useRef<HTMLDivElement>(null);
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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  // ── Totals ─────────────────────────────────────────────────
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const multiItemDiscount = totalItemCount >= 2 ? 150 : 0;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.basePrice) * item.quantity,
    0
  );
  // Always use the zone's actual cost (never override with free-shipping threshold)
  const shippingFee = selectedZone ? selectedZone.cost : 250;
  const total = Math.max(0, subtotal - multiItemDiscount) + shippingFee;

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

  const showErrorMessage = (msg: string) => {
    setError(msg);
    if (formBodyRef.current) {
      formBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Navigation ──────────────────────────────────
  const handleNextStep = () => {
    setError(null);
    if (hasOutOfStockItems) {
      showErrorMessage('لا يمكن إتمام الطلب لأن السلة تحتوي على منتجات غير متوفرة (نفذت الكمية).');
      return;
    }
    if (step === 1) {
      // First Name, Last Name, and Phone are always required.
      if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
        showErrorMessage('الرجاء تعبئة الاسم الأول، الاسم الأخير، ورقم الجوال.');
        return;
      }
      // If they want to create an account, email and password are required
      if (isCreateAccountOpen) {
        if (!email.trim() || !password.trim()) {
          showErrorMessage('الرجاء إدخال البريد الإلكتروني وكلمة المرور لإنشاء حسابك.');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showErrorMessage('الرجاء إدخال بريد إلكتروني صحيح.');
          return;
        }
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedZone) {
        showErrorMessage('الرجاء اختيار المحافظة أولاً.');
        return;
      }
      if (!addressLine1.trim()) {
        showErrorMessage('الرجاء إدخال عنوان التوصيل.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    console.log('🚀 [CheckoutModal] handlePlaceOrder triggered!');
    setError(null);
    if (hasOutOfStockItems) {
      showErrorMessage('لا يمكن إتمام الطلب لأن السلة تحتوي على منتجات غير متوفرة (نفذت الكمية).');
      return;
    }
    setLoading(true);

    const items = cartItems.map((item) => ({
      productId: item.product.id,
      variantId: resolveVariantId(item),
      quantity: item.quantity,
    }));

    const checkoutPayload: any = {
      firstName,
      lastName,
      phoneNumber: phone,
      paymentMethod: paymentMethod === 'cod' ? 4 : 1, // COD = 4, CreditCard = 1
      country:       country.trim()       || null,
      state:         state.trim()         || null,
      city:          city.trim()          || null,
      addressLine1:  addressLine1.trim()  || null,
      addressLine2:  addressLine2.trim()  || null,
      couponId:      couponCode.trim()    ? 0 : null,
      notes:         notes.trim()         || null,
      discountAmount: multiItemDiscount > 0 ? multiItemDiscount : null,
      items,
    };
    console.log('🚀 [CheckoutModal] checkoutPayload:', checkoutPayload);

    // Only send email/password if filled and relevant
    if (email.trim()) {
      checkoutPayload.email = email.trim();
    }
    if (isCreateAccountOpen && password.trim()) {
      checkoutPayload.password = password.trim();
    }

    const registerPayload = { email, password, firstName, lastName };

    try {
      // Call both APIs simultaneously
      const [checkoutResult, registerResult] = await Promise.allSettled([
        paymentsApi.checkoutAsGuest(checkoutPayload),
        ...(isCreateAccountOpen && password.trim() && email.trim() ? [authApi.register(registerPayload)] : []),
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
      if (!orderData?.requiresPayment) {
        const orderNum = orderData?.orderNumber || orderData?.orderId?.toString() || `COD-${Date.now()}`;
        
        // Track purchase via pixels
        try {
          trackPurchase(
            orderNum,
            cartItems.map(item => ({
              product: { id: item.product.id, price: item.product.salePrice !== null && item.product.salePrice !== undefined ? item.product.salePrice : item.product.basePrice },
              quantity: item.quantity
            }))
          );
        } catch (e) {
          console.error('Failed to track COD purchase:', e);
        }

        // Empty cart in localStorage before redirecting
        localStorage.setItem('cart', JSON.stringify([]));
        localStorage.setItem('elbat_cart', JSON.stringify([]));

        resetForm();
        window.location.href = `/payment/result?success=true&merchant_order_id=${orderNum}&amount_cents=${total * 100}&currency=EGP&source_data.type=cod&data.message=Approved`;
        return;
      }

      if (orderData?.checkoutUrl) {
        // Empty cart in localStorage before redirecting to Paymob checkout URL
        localStorage.setItem('cart', JSON.stringify([]));
        localStorage.setItem('elbat_cart', JSON.stringify([]));
        
        resetForm();
        window.location.href = orderData.checkoutUrl;
        return;
      }

      // Fallback: no payment URL — treat as completed locally
      const orderId =
        orderData?.orderId?.toString() ||
        orderData?.orderNumber ||
        'BAT-' + Math.floor(Math.random() * 900000 + 100000);

      try {
        trackPurchase(
          orderId,
          cartItems.map(item => ({
            product: { id: item.product.id, price: item.product.salePrice !== null && item.product.salePrice !== undefined ? item.product.salePrice : item.product.basePrice },
            quantity: item.quantity
          }))
        );
      } catch (e) {
        console.error('Failed to track fallback purchase:', e);
      }

      localStorage.setItem('cart', JSON.stringify([]));
      localStorage.setItem('elbat_cart', JSON.stringify([]));

      resetForm();
      window.location.href = `/payment/result?success=true&merchant_order_id=${orderId}&amount_cents=${total * 100}&currency=EGP&source_data.type=fallback&data.message=Approved`;
    } catch (err: any) {
      console.error('❌ [CheckoutModal] handlePlaceOrder failed:', err);
      showErrorMessage(err.message || 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مجدداً.');
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
    setPaymentMethod('cod');
    setIsCreateAccountOpen(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const hasOutOfStockItems = cartItems.some(item => item.product.inStock === false);

  useEffect(() => {
    if (isOpen) {
      if (hasOutOfStockItems) {
        setError('بعض المنتجات في السلة غير متوفرة حالياً (نفذت الكمية). يرجى العودة وإزالتها للمتابعة.');
      } else {
        setError(null);
      }
    }
  }, [isOpen, hasOutOfStockItems]);

  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={handleClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '580px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button className="modal-close-btn" onClick={handleClose} title="إغلاق">
          <X size={20} />
        </button>        {/* Step Indicator */}
        <div className="checkout-steps">
          {[
            { label: 'البيانات الشخصية', icon: <User size={14} /> },
            { label: 'الشحن والتوصيل', icon: <MapPin size={14} /> },
            { label: 'تأكيد الطلب', icon: <ShoppingBag size={14} /> },
          ].map((s, i) => (
            <div
              key={i}
              className={`step-node ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}
              onClick={() => step > i + 1 && setStep(i + 1)}
              style={{ cursor: step > i + 1 ? 'pointer' : 'default' }}
              title={step > i + 1 ? `الرجوع إلى ${s.label}` : undefined}
            >
              <div className="step-circle">
                {step > i + 1 ? <Check size={15} /> : (step === i + 1 ? s.icon : i + 1)}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div ref={formBodyRef} className="checkout-form-body" style={{ overflowY: 'auto', flex: 1 }}>

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

          {/* Multi-item Discount Alert Banner */}
          {multiItemDiscount > 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#E8F5E9', border: '1px solid #A5D6A7',
              borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem',
              marginBottom: '1rem', color: '#2E7D32', fontSize: '0.85rem', fontWeight: 700,
            }}>
              🎉 تهانينا! حصلت على خصم 150 ج.م فوري لشراء قطعتين أو أكثر!
            </div>
          ) : totalItemCount === 1 ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#FFF8E1', border: '1px solid #FFE082',
              borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem',
              marginBottom: '1rem', color: '#F57F17', fontSize: '0.85rem', fontWeight: 600,
            }}>
              💡 أضف قطعة أخرى لسلتك للحصول على خصم 150 ج.م فوري!
            </div>
          ) : null}

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
                    style={{
                      border: '1px dashed var(--border)',
                      background: '#F1F5F9',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.8rem 1rem',
                      cursor: 'not-allowed',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      opacity: 0.65,
                      position: 'relative'
                    }}
                    title="الدفع الإلكتروني غير مفعل حالياً"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-muted)' }}>💳 بطاقة / محفظة</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#E2E8F0', color: '#64748B', padding: '2px 6px', borderRadius: '4px' }}>غير مفعل</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>قريباً - الدفع المتاح حالياً عند الاستلام</span>
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
                <label style={LABEL_STYLE}>رقم الجوال *</label>
                <input style={FIELD_STYLE} type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" />
              </div>

              {/* Collapsible optional account creation */}
              <div style={{
                marginTop: '1.25rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => setIsCreateAccountOpen(!isCreateAccountOpen)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#F8FBFD',
                    border: 'none',
                    textAlign: 'right',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    color: 'var(--primary-dark)',
                    outline: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={isCreateAccountOpen}
                      onChange={(e) => {
                        e.stopPropagation();
                        setIsCreateAccountOpen(e.target.checked);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>إنشاء حساب لتتبع حالة الطلب (اختياري)</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isCreateAccountOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  />
                </button>

                {isCreateAccountOpen && (
                  <div style={{ padding: '1rem', background: '#fff', borderTop: '1px solid var(--border)' }}>
                    <div style={GROUP}>
                      <label style={LABEL_STYLE}>البريد الإلكتروني *</label>
                      <input style={FIELD_STYLE} type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
                    </div>
                    <div style={GROUP}>
                      <label style={LABEL_STYLE}>كلمة المرور *</label>
                      <input style={FIELD_STYLE} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} dir="ltr" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                      💡 سيتم إنشاء حسابك بالبريد الإلكتروني المدخل لمتابعة الطلبات وتفاصيل الشحن لاحقاً.
                    </p>
                  </div>
                )}
              </div>
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
                      {selectedZone.cost === 0
                        ? 'مجاني 🎉'
                        : `${selectedZone.cost.toLocaleString()} ج.م`}
                    </strong>
                  </div>

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

              {/* Personal data summary */}
              <div style={{
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem', marginBottom: '0.75rem',
                background: '#F8FBFD',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} /> بيانات شخصية
                  </span>
                  <button
                    type="button"
                    onClick={() => { setError(null); setStep(1); }}
                    style={{
                      fontSize: '0.75rem', color: 'var(--primary)', background: 'none',
                      border: '1px solid var(--primary)', borderRadius: '4px',
                      padding: '2px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px',
                    }}
                  >
                    <Edit2 size={13} />
                    <span>تعديل</span>
                  </button>
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(firstName || lastName) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{firstName} {lastName}</span>
                    </div>
                  )}
                  {phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{phone}</span>
                    </div>
                  )}
                  {email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping address summary */}
              <div style={{
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem', marginBottom: '0.75rem',
                background: '#F8FBFD',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} /> عنوان التوصيل
                  </span>
                  <button
                    type="button"
                    onClick={() => { setError(null); setStep(2); }}
                    style={{
                      fontSize: '0.75rem', color: 'var(--primary)', background: 'none',
                      border: '1px solid var(--primary)', borderRadius: '4px',
                      padding: '2px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px',
                    }}
                  >
                    <Edit2 size={13} />
                    <span>تعديل</span>
                  </button>
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedZone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{selectedZone.name} — شحن: {shippingFee === 0 ? 'مجاني' : `${shippingFee.toLocaleString()} ج.م`}</span>
                    </div>
                  )}
                  {addressLine1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Home size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{addressLine1}</span>
                    </div>
                  )}
                  {addressLine2 && <div style={{ paddingRight: '21px' }}>{addressLine2}</div>}
                  {city && <div style={{ paddingRight: '21px' }}>{city}{state ? ` ، ${state}` : ''}</div>}
                  {notes && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <FileText size={15} style={{ flexShrink: 0 }} />
                      <span>{notes}</span>
                    </div>
                  )}
                </div>
              </div>


              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={18} style={{ color: 'var(--primary)' }} />
                  <span>ملخص المنتجات</span>
                </h4>
                <div style={{ maxHeight: '130px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span>
                        {item.product.name}
                        <span style={{ color: 'var(--text-muted)' }}> x{item.quantity}</span>
                        {item.size && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> ({item.size})</span>}
                        {item.product.inStock === false && (
                          <span style={{ fontSize: '0.75rem', color: '#fff', backgroundColor: '#EF5350', padding: '0.1rem 0.4rem', borderRadius: '3px', marginRight: '6px', fontWeight: 'bold' }}>
                            نفذت الكمية
                          </span>
                        )}
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
                  ...(multiItemDiscount > 0
                    ? [{ label: 'خصم شراء قطعتين أو أكثر 🎉', val: `-150 ج.م`, isDiscount: true }]
                    : []),
                  { label: 'تكلفة الشحن', val: shippingFee === 0 ? 'مجاني 🎉' : `${shippingFee.toLocaleString()} ج.م` },
                ].map(r => (
                  <div key={r.label} style={{
                    display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem',
                    color: (r as any).isDiscount ? '#2E7D32' : 'var(--text-muted)',
                    fontWeight: (r as any).isDiscount ? 700 : 400,
                    marginBottom: '0.3rem'
                  }}>
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
            <button className="btn-secondary" onClick={handleClose} disabled={loading}>إلغاء</button>
          )}

          {step < 3 ? (
            <button className="btn-primary" onClick={handleNextStep}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ChevronLeft size={16} /> التالي
            </button>
          ) : hasOutOfStockItems ? (
            <button
              className="btn-primary disabled"
              disabled
              style={{
                backgroundColor: '#bdbdbd',
                color: '#fff',
                cursor: 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '8px',
                minWidth: '160px', justifyContent: 'center',
              }}
            >
              🚫 منتجات غير متوفرة
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
                'تأكيد الطلب والدفع عند الاستلام'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
