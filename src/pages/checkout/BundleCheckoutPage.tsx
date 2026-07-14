import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { BUNDLE_PRICE, PAJAMAS } from '../../data/pajamas';
import { trackPurchase } from '../../utils/tracking';
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
      const items = (selectedPajamas.filter(Boolean) as SelectedPajama[]).map((pj) => {
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
          const itemsToTrack = (selectedPajamas.filter(Boolean) as SelectedPajama[]).map((pj) => ({
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
    return (
      <div className="checkout-success-page" dir="rtl">
        <div className="checkout-success-card">
          <div className="success-icon-wrap">
            <span className="success-icon-emoji">🎉</span>
          </div>
          <h1 className="success-title">تم استلام طلبك بنجاح!</h1>
          <p className="success-subtitle">
            شكراً{' '}
            {customerDetails.firstName
              ? `${customerDetails.firstName} ${customerDetails.lastName}`
              : 'عزيزي العميل'}
            ! هنتواصل معاك في أقرب وقت لتأكيد الطلب وترتيب الشحن. 📦
          </p>
          {orderReference && (
            <p className="success-order-ref">رقم الطلب: <strong>{orderReference}</strong></p>
          )}
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
          <a href="/" className="success-home-btn">
            العودة للصفحة الرئيسية
          </a>
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
