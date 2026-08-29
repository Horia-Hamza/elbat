import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import OfferHeader from './OfferHeader';
import PajamaSelector from './PajamaSelector';
import SelectedItems from './SelectedItems';
import OrderSummary from './OrderSummary';
import CustomerForm from './CustomerForm';
import PaymentSelector from './PaymentSelector';
import OptionalAccountSection from './OptionalAccountSection';
import CheckoutFooter from './CheckoutFooter';
import type {
  SelectedPajama,
  CustomerDetails,
  PaymentMethod,
  AccountDetails,
} from './types';
import { paymentsApi } from '../../api/payments';
import { shippingZonesApi } from '../../api/shippingZones';
import type { ShippingZone } from '../../api/shippingZones';
import { BUNDLE_PRICE } from '../../data/pajamas';
import { trackPurchase } from '../../utils/tracking';
import { getStoreSettings } from '../../utils/storeSettings';
import '../../checkout.css';

// Bundle products map: pajamaId → backend productId
// We use a fixed product ID since this is a bundle offer.
// The variant structure: productId = the pajama's index+1 placeholder,
// variantId = null (sizes/colors are display-only for this bundle page).
// Adjust these IDs to match your actual backend product IDs if needed.
const BUNDLE_PRODUCT_ID = 1; // placeholder — update to your real bundle product ID

const BundleCheckoutPage: React.FC = () => {
  // ── State ────────────────────────────────────────────────────────
  const [selectedPajamas, setSelectedPajamas] = useState<(SelectedPajama | null)[]>([
    null,
    null,
    null,
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    notes: '',
  });

  // ── Shipping Zones (from API) ────────────────────────────────────
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [accountDetails, setAccountDetails] = useState<AccountDetails>({
    email: '',
    password: '',
  });
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderReference, setOrderReference] = useState('');

  // Refs for scrolling
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // ── Fetch Shipping Zones on Mount ────────────────────────────────
  useEffect(() => {
    setZonesLoading(true);
    shippingZonesApi
      .getActive()
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => setZones([]))
      .finally(() => setZonesLoading(false));
  }, []);

  // ── Computed shipping / total ────────────────────────────────────
  const shippingCost = selectedZone
    ? selectedZone.freeShippingThreshold != null &&
      BUNDLE_PRICE >= selectedZone.freeShippingThreshold
      ? 0
      : selectedZone.cost
    : 0; // default 0 when no zone chosen yet (for display)

  const orderTotal = BUNDLE_PRICE + shippingCost;

  // ── Handlers ─────────────────────────────────────────────────────
  const handlePajamaSelect = useCallback(
    (selected: SelectedPajama, slotIndex: number) => {
      setSelectedPajamas((prev) => {
        const updated = [...prev];
        updated[slotIndex] = selected;
        return updated;
      });

      const nextStep = slotIndex + 1;
      if (nextStep < 3) {
        setCurrentStep(nextStep);
        setTimeout(() => {
          document.getElementById('pajama-selector')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 150);
      } else {
        setTimeout(() => {
          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    },
    []
  );

  const handleRemovePajama = useCallback((index: number) => {
    setSelectedPajamas((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setCurrentStep(index);
  }, []);

  const handleCustomerChange = useCallback(
    (field: keyof CustomerDetails, value: string) => {
      setCustomerDetails((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleZoneChange = useCallback((zone: ShippingZone | null) => {
    setSelectedZone(zone);
  }, []);

  const handleAccountChange = useCallback(
    (field: keyof AccountDetails, value: string) => {
      setAccountDetails((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // ── Validation ───────────────────────────────────────────────────
  const allPajamasSelected = selectedPajamas.every(Boolean);

  const isFormValid =
    allPajamasSelected &&
    customerDetails.firstName.trim().length >= 2 &&
    customerDetails.lastName.trim().length >= 2 &&
    customerDetails.phone.trim().length >= 10 &&
    selectedZone !== null &&
    customerDetails.address.trim().length >= 5;

  // ── Submit — real API call ───────────────────────────────────────
  const handleSubmit = async () => {
    if (!isFormValid) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (isAccountOpen) {
      if (!accountDetails.email.trim() || !accountDetails.password.trim()) {
        setSubmitError('الرجاء إدخال البريد الإلكتروني وكلمة المرور لإنشاء حسابك.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountDetails.email)) {
        setSubmitError('الرجاء إدخال بريد إلكتروني صحيح.');
        return;
      }
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Build items array — one line item per selected pajama
      // Each selected pajama maps to the same bundle product but treated as 1 qty.
      // variantId is null since the bundle offer doesn't use backend variants.
      const items = (selectedPajamas.filter(Boolean) as SelectedPajama[]).map(() => {
        // Try to find a matching productId from PAJAMAS data if they ever have real IDs;
        // for now fall back to BUNDLE_PRODUCT_ID.
        return {
          productId: BUNDLE_PRODUCT_ID,
          variantId: null as number | null,
          quantity: 1,
        };
      });

      const checkoutPayload: any = {
        firstName:    customerDetails.firstName.trim(),
        lastName:     customerDetails.lastName.trim(),
        phoneNumber:  customerDetails.phone.trim(),
        paymentMethod: paymentMethod === 'cod' ? 4 : 1, // COD = 4, CreditCard = 1
        country:      'مصر',
        state:        selectedZone?.state             || null,
        city:         selectedZone?.name              || null,
        addressLine1: customerDetails.address.trim() || null,
        addressLine2: null,
        couponId:     null,
        notes:        customerDetails.notes.trim()   || null,
        items,
      };

      // Only send email/password if provided by user
      if (accountDetails.email.trim()) {
        checkoutPayload.email = accountDetails.email.trim();
      }
      if (isAccountOpen && accountDetails.password.trim()) {
        checkoutPayload.password = accountDetails.password.trim();
      }

      const orderData = await paymentsApi.checkoutAsGuest(checkoutPayload);

      // ── Handle payment method routing (mirrors CheckoutModal) ────
      if (!orderData?.requiresPayment) {
        const orderIdNumber = Number(orderData?.orderId || orderData?.id || 0);
        const orderNum = orderData?.orderNumber || `COD-${orderIdNumber || Date.now()}`;
        
        // Track purchase via pixels
        try {
          const itemsToTrack = (selectedPajamas.filter(Boolean) as SelectedPajama[]).map((_pj) => ({
            product: { id: BUNDLE_PRODUCT_ID, price: BUNDLE_PRICE / 3 },
            quantity: 1
          }));
          trackPurchase(orderNum, itemsToTrack);
        } catch (e) {
          console.error('Failed to track bundle purchase:', e);
        }

        // Empty the cart
        localStorage.setItem('cart', JSON.stringify([]));
        localStorage.setItem('elbat_cart', JSON.stringify([]));

        setOrderReference(orderNum);
        setOrderSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Online payment — redirect to Paymob / payment gateway
      if (orderData?.checkoutUrl) {
        window.location.href = orderData.checkoutUrl;
        return;
      }

      // Fallback — treat as success locally
      const orderId =
        orderData?.orderId?.toString() ||
        orderData?.orderNumber ||
        'BND-' + Math.floor(Math.random() * 900000 + 100000);

      setOrderReference(orderId);
      setOrderSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(
        err.message || 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مجدداً.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ───────────────────────────────────────────────
  if (orderSuccess) {
    const settings = getStoreSettings();
    const whatsappNumber = settings.whatsapp;
    const whatsappMsg = `مرحباً، أود المتابعة بخصوص طلبي ${orderReference ? `رقم: ${orderReference}` : ''}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

    return (
      <div className="checkout-success-page" dir="rtl">
        <div className="checkout-success-card">
          <h1 className="success-title" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CheckCircle size={30} style={{ color: '#2e7d32', flexShrink: 0 }} />
            <span>تم استلام طلبك بنجاح!</span>
          </h1>
          <p className="success-subtitle">
            شكراً{' '}
            {customerDetails.firstName
              ? `${customerDetails.firstName} ${customerDetails.lastName}`
              : 'عزيزي العميل'}
            ! سيتم التواصل معك قريباً لتأكيد الطلب وترتيب الشحن. 📞📦
          </p>
          <div className="success-order-items">
            {(selectedPajamas.filter(Boolean) as SelectedPajama[]).map((item, i) => (
              <div key={i} className="success-order-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <span>{item.name}</span>
                  <span className="success-item-meta">
                    {item.color} · مقاس {item.size}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.2rem' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#25D366',
                color: 'white', border: 'none', borderRadius: '12px',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)',
                textDecoration: 'none',
                fontFamily: 'inherit'
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              تواصل معنا عبر واتساب
            </a>
            <a href="/" className="success-home-btn" style={{ marginTop: 0 }}>
              العودة للصفحة الرئيسية
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Checkout Layout ─────────────────────────────────────────
  return (
    <div className="checkout-page" dir="rtl">
      {/* Sticky selected items bar */}
      {selectedPajamas.some(Boolean) && (
        <div className="selected-items-sticky">
          <SelectedItems selectedPajamas={selectedPajamas} onRemove={handleRemovePajama} />
        </div>
      )}

      <OfferHeader />

      {/* Global submit error banner */}
      {submitError && (
        <div className="checkout-error-banner">
          <span>⚠️ {submitError}</span>
          <button onClick={() => setSubmitError(null)}>×</button>
        </div>
      )}

      <div className="checkout-layout">
        {/* ── Main column ── */}
        <div className="checkout-main">
          <PajamaSelector
            currentStep={currentStep}
            selectedPajamas={selectedPajamas}
            onSelect={handlePajamaSelect}
          />

          <div ref={formRef}>
            <CustomerForm
              details={customerDetails}
              onChange={handleCustomerChange}
              zones={zones}
              zonesLoading={zonesLoading}
              selectedZone={selectedZone}
              onZoneChange={handleZoneChange}
            />
          </div>

          <PaymentSelector selected={paymentMethod} onChange={setPaymentMethod} />

          {/* Optional account creation — truly optional, never blocks checkout */}
          <OptionalAccountSection
            isOpen={isAccountOpen}
            onToggle={() => setIsAccountOpen((o) => !o)}
            accountDetails={accountDetails}
            onChange={handleAccountChange}
          />
        </div>

        {/* ── Desktop sidebar ── */}
        <aside className="checkout-sidebar">
          <div className="checkout-sidebar-sticky" ref={summaryRef}>
            <OrderSummary
              selectedPajamas={selectedPajamas}
              selectedZone={selectedZone}
            />

            <div className="sidebar-cta">
              <button
                id="sidebar-complete-btn"
                className={`complete-order-btn ${!isFormValid ? 'disabled' : ''} ${isSubmitting ? 'loading' : ''}`}
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                type="button"
              >
                {isSubmitting ? (
                  <span className="btn-spinner" />
                ) : (
                  <>🔒 إتمام الطلب — {orderTotal.toLocaleString()} EGP</>
                )}
              </button>
              {!allPajamasSelected && (
                <p className="sidebar-hint">
                  👆 اختار {3 - selectedPajamas.filter(Boolean).length} بجامات كمان لتكتمل الصفقة
                </p>
              )}
              {allPajamasSelected && !selectedZone && (
                <p className="sidebar-hint">👆 اختار المحافظة عشان نحسب الشحن</p>
              )}
              {allPajamasSelected && selectedZone && !isFormValid && (
                <p className="sidebar-hint">👆 أكمل بيانات التوصيل</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <CheckoutFooter
        isLoading={isSubmitting}
        isDisabled={!isFormValid}
        total={orderTotal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default BundleCheckoutPage;
