import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Home, ShoppingBag, CreditCard, Package } from 'lucide-react';

type Bubble = {
  id: number;
  left: string;
  size: string;
  delay: string;
  duration: string;
  releasedPos?: { x: number; y: number };
};

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── Parse ALL Paymob query params ─────────────────────────────
  const isSuccess = searchParams.get('success') !== 'false';
  const isPending = searchParams.get('pending') === 'true';
  const orderNumber = searchParams.get('merchant_order_id') || searchParams.get('order') || null;
  const amountCents = parseInt(searchParams.get('amount_cents') || '0', 10);
  const currency = searchParams.get('currency') || 'EGP';
  const cardType = searchParams.get('source_data.sub_type') || null;   // e.g. MasterCard
  const cardPan = searchParams.get('source_data.pan') || null;         // last 4 digits
  const sourceType = searchParams.get('source_data.type') || null;        // card / wallet
  const txnMessage = searchParams.get('data.message') || null;            // Approved / Declined
  const errorOccurred = searchParams.get('error_occured') === 'true';

  const amountDisplay = amountCents > 0
    ? (amountCents / 100).toLocaleString('ar-EG', { minimumFractionDigits: 0 })
    : null;

  // ── Floating ducks ────────────────────────────────────────────
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [dragState, setDragState] = useState<{ id: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [hoveredDuck, setHoveredDuck] = useState<number | null>(null);
  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  useEffect(() => {
    setBubbles(
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + '%',
        size: Math.random() * 80 + 55 + 'px',
        delay: Math.random() * 8 + 's',
        duration: Math.random() * 6 + 8 + 's',
      }))
    );
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      setDragState(prev => prev ? { ...prev, x: e.clientX - prev.offsetX, y: e.clientY - prev.offsetY } : null);
    };
    const onMouseUp = () => {
      const ds = dragStateRef.current;
      if (!ds) return;
      setBubbles(prev => prev.map(b => b.id === ds.id ? { ...b, releasedPos: { x: ds.x, y: ds.y } } : b));
      setDragState(null);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // ── Clear cart on successful order landing ─────────────────────
  useEffect(() => {
    if (isSuccess && !isPending) {
      localStorage.setItem('cart', JSON.stringify([]));
      localStorage.setItem('elbat_cart', JSON.stringify([]));
      window.dispatchEvent(new Event('storage'));
    }
  }, [isSuccess, isPending]);



  // ── Derived display state ─────────────────────────────────────
  const statusColor = isSuccess ? '#2E7D32' : '#C62828';
  const statusBg = isSuccess
    ? 'linear-gradient(135deg,#e8f5e9 0%,#e3f2fd 50%,#fff8e1 100%)'
    : 'linear-gradient(135deg,#fce4ec 0%,#fbe9e7 100%)';

  return (
    <div style={{
      minHeight: '100vh',
      background: statusBg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-family, system-ui)',
      padding: '2rem',
      textAlign: 'center',
    }}>

      {/* ── Floating Ducks ──────────────────────────────────────── */}
      <div
        className="floating-ducks-container"
        style={{ position: 'fixed', opacity: isSuccess ? 0.65 : 0.2, zIndex: 0 }}
      >
        {bubbles.map(b => {
          const isDragging = dragState?.id === b.id;
          const isReleased = !!b.releasedPos && !isDragging;
          const isHovered = hoveredDuck === b.id && !isDragging && !isReleased;
          return (
            <img
              key={b.id}
              src="/new-duck.png"
              alt=""
              className={`floating-duck-bg${isReleased ? ' duck-float-away' : ''}`}
              style={{
                position: isDragging || isReleased ? 'fixed' : 'absolute',
                left: isDragging ? dragState!.x : isReleased ? b.releasedPos!.x : b.left,
                top: isDragging || isReleased ? (isDragging ? dragState!.y : b.releasedPos!.y) : undefined,
                bottom: isDragging || isReleased ? undefined : '-60px',
                width: b.size,
                height: b.size,
                animation: isDragging ? 'none' : undefined,
                animationDelay: isDragging || isReleased ? undefined : b.delay,
                animationDuration: isDragging || isReleased ? undefined : b.duration,
                animationPlayState: isHovered ? 'paused' : 'running',
                opacity: isDragging ? 0.85 : undefined,
                cursor: isDragging ? 'grabbing' : 'grab',
                filter: isDragging
                  ? 'drop-shadow(0 0 20px rgba(255,220,50,1)) brightness(1.3)'
                  : isHovered
                    ? 'drop-shadow(0 0 12px rgba(255,220,50,0.9)) brightness(1.2)'
                    : undefined,
                transition: isDragging ? 'none' : 'filter 0.2s ease',
                zIndex: isDragging ? 9999 : isReleased ? 9998 : undefined,
                userSelect: 'none',
                transform: isDragging ? 'scale(1.1)' : undefined,
                pointerEvents: 'all',
              }}
              onMouseEnter={() => { if (!isDragging) setHoveredDuck(b.id); }}
              onMouseLeave={() => { if (!isDragging) setHoveredDuck(null); }}
              onMouseDown={e => {
                e.preventDefault();
                const rect = (e.currentTarget as HTMLImageElement).getBoundingClientRect();
                setBubbles(prev => prev.map(bub => bub.id === b.id ? { ...bub, releasedPos: undefined } : bub));
                setDragState({ id: b.id, x: rect.left, y: rect.top, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
              }}
              onAnimationEnd={e => {
                if (e.animationName === 'floatDuckFromPos') {
                  setBubbles(prev => prev.map(bub => bub.id === b.id ? { ...bub, releasedPos: undefined } : bub));
                }
              }}
            />
          );
        })}
      </div>

      {/* ── Main Card ───────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'rgba(255,255,255,0.93)',
        backdropFilter: 'blur(24px)',
        borderRadius: '28px',
        padding: '2.5rem 2.5rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: isSuccess
          ? '0 30px 80px rgba(76,175,80,0.15), 0 0 0 1px rgba(76,175,80,0.1)'
          : '0 30px 80px rgba(244,67,54,0.12), 0 0 0 1px rgba(244,67,54,0.1)',
        animation: 'successCardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
          <img
            src="/logo.png"
            alt="متجر البطّ"
            style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              boxShadow: '0 8px 24px rgba(35,107,147,0.25)',
              animation: 'duckBounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
            }}
          />
        </div>

        {/* Status icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', animation: 'iconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.35s both' }}>
          {isSuccess
            ? <CheckCircle size={68} style={{ color: '#43A047', filter: 'drop-shadow(0 4px 18px rgba(76,175,80,0.45))' }} />
            : <XCircle size={68} style={{ color: '#E53935', filter: 'drop-shadow(0 4px 18px rgba(244,67,54,0.4))' }} />
          }
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: statusColor, margin: '0 0 0.4rem', lineHeight: 1.3 }}>
          {isPending
            ? '⏳ الدفع قيد المعالجة'
            : isSuccess
              ? 'تم الدفع بنجاح!'
              : '❌ فشلت عملية الدفع'}
        </h1>

        <p style={{ color: '#666', fontSize: '0.93rem', margin: '0 0 1.5rem', lineHeight: 1.75 }}>
          {isPending
            ? 'جاري معالجة عملية الدفع، سيتم التحديث تلقائياً.'
            : isSuccess
              ? 'شكراً لتسوقك! طلبك قيد التجهيز وسيصلك قريباً.'
              : errorOccurred
                ? 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مجدداً.'
                : 'لم تكتمل عملية الدفع. يمكنك المحاولة مجدداً.'}
        </p>

        {/* ── Transaction detail cards ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>

          {/* Order number */}
          {orderNumber && (
            <div style={detailRow}>
              <Package size={16} style={{ color: '#1565C0', flexShrink: 0 }} />
              <span style={{ color: '#555', fontSize: '0.85rem' }}>رقم الطلب</span>
              <span style={{ marginRight: 'auto', fontWeight: 700, color: '#1565C0', fontSize: '0.85rem', direction: 'ltr' }}>
                {orderNumber}
              </span>
            </div>
          )}

          {/* Amount */}
          {amountDisplay && (
            <div style={detailRow}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>💰</span>
              <span style={{ color: '#555', fontSize: '0.85rem' }}>المبلغ المدفوع</span>
              <span style={{ marginRight: 'auto', fontWeight: 800, color: '#2E7D32', fontSize: '0.95rem' }}>
                {amountDisplay} {currency}
              </span>
            </div>
          )}

          {/* Card info */}
          {cardType && cardPan && (
            <div style={detailRow}>
              <CreditCard size={16} style={{ color: '#555', flexShrink: 0 }} />
              <span style={{ color: '#555', fontSize: '0.85rem' }}>وسيلة الدفع</span>
              <span style={{ marginRight: 'auto', fontWeight: 600, color: '#333', fontSize: '0.85rem', direction: 'ltr' }}>
                {cardType} •••• {cardPan}
              </span>
            </div>
          )}

          {/* Status message */}
          {txnMessage && (
            <div style={detailRow}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔐</span>
              <span style={{ color: '#555', fontSize: '0.85rem' }}>حالة المعاملة</span>
              <span style={{ marginRight: 'auto', fontWeight: 700, color: isSuccess ? '#2E7D32' : '#C62828', fontSize: '0.85rem' }}>
                {txnMessage}
              </span>
            </div>
          )}

          {/* Source type */}
          {sourceType && sourceType !== 'card' && (
            <div style={detailRow}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>📱</span>
              <span style={{ color: '#555', fontSize: '0.85rem' }}>نوع الدفع</span>
              <span style={{ marginRight: 'auto', fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>
                {sourceType}
              </span>
            </div>
          )}
        </div>



        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={btnPrimary}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
            <Home size={17} /> الصفحة الرئيسية
          </button>

          {!isSuccess && (
            <button onClick={() => navigate(-1)} style={btnSecondary}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}>
              <ShoppingBag size={17} /> حاول مجدداً
            </button>
          )}
        </div>

        {/* Footer */}
        <p style={{ marginTop: '1.8rem', fontSize: '0.75rem', color: '#ccc' }}>
          متجر البطّ — شكراً لثقتك بنا
        </p>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes successCardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes duckBounce {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg);  opacity: 1; }
        }
        @keyframes iconPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ── Shared styles ──────────────────────────────────────────────────
const detailRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  background: '#F8F9FA',
  border: '1px solid #EEEEEE',
  borderRadius: '10px',
  padding: '0.6rem 0.9rem',
};

const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px',
  padding: '0.75rem 1.5rem',
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
  color: 'white', border: 'none', borderRadius: '12px',
  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(35, 107, 147, 0.3)',
  transition: 'transform 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
};

const btnSecondary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px',
  padding: '0.75rem 1.5rem',
  background: 'white', color: '#E53935',
  border: '2px solid #EF9A9A', borderRadius: '12px',
  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
  transition: 'transform 0.15s',
  fontFamily: 'inherit',
};
