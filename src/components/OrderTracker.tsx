import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, MapPin, X, PartyPopper } from 'lucide-react';

interface OrderTrackerProps {
  isOpen: boolean;
  orderId: string;
  customerName: string;
  onClose: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  isOpen,
  orderId,
  customerName,
  onClose
}) => {
  const [currentStatus, setCurrentStatus] = useState(0); // 0: استلام, 1: تجهيز, 2: شحن, 3: توصيل
  const [confetti, setConfetti] = useState<{ id: number; left: string; color: string; delay: string }[]>([]);

  // محاكاة تحرك حالة الشحن تلقائياً كل 6 ثوانٍ لإعطاء طابع حركي تفاعلي
  useEffect(() => {
    if (isOpen) {
      setCurrentStatus(0);
      const interval = setInterval(() => {
        setCurrentStatus((prev) => {
          if (prev < 3) return prev + 1;
          clearInterval(interval);
          return 3;
        });
      }, 6000);

      // توليد قصاصات ملونة للاحتفال
      const colors = ['#FFD54F', '#FF9800', '#74D2E7', '#4CAF50', '#E91E63'];
      const newConfetti = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + '%',
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 3 + 's'
      }));
      setConfetti(newConfetti);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'تم استلام طلبك وتأكيده',
      desc: 'تم استلام بيانات الدفع والتحقق من مطابقة السلعة لمعايير الاستيراد الجمركي.',
      icon: CheckCircle
    },
    {
      title: 'قيد التجهيز في مستودعنا العالمي',
      desc: 'تم شراء المنتج وتجهيزه في مركزنا اللوجستي بالخارج (أمريكا/أوروبا) وفحصه للتأكد من جودته.',
      icon: Package
    },
    {
      title: 'الشحن الدولي والتخليص الجمركي',
      desc: 'الشحنة على متن الطيران متجهة إلى مطار القاهرة وجاري إنهاء التخليص الجمركي بالكامل.',
      icon: Truck
    },
    {
      title: 'تم التوصيل لباب بيتك بمصر',
      desc: 'تم تسليم المنتج بنجاح. تتمنى لك عائلة البط الاستمتاع بتسوقك العالمي السهل!',
      icon: MapPin
    }
  ];

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        {/* زر الإغلاق */}
        <button className="modal-close-btn" onClick={onClose} title="إغلاق">
          <X size={20} />
        </button>

        {/* قصاصات الورق الملونة الاحتفالية */}
        {currentStatus === 0 && (
          <div className="confetti-overlay">
            {confetti.map((c) => (
              <div
                key={c.id}
                className="confetti-piece"
                style={{
                  '--left': c.left,
                  backgroundColor: c.color,
                  animationDelay: c.delay
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        <div className="success-card">
          <div className="success-duck-graphic">
            <img src="/logo.png" alt="بطة التهنئة" className="success-duck-img" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
            <PartyPopper size={24} />
            <h2 className="success-title">طلبك قيد التحضير!</h2>
          </div>

          <p className="success-desc">
            شكراً لتسوقك من متجر البط يا <strong>{customerName}</strong>. رقم طلبك الفريد هو:
            <span style={{ display: 'block', margin: '0.5rem 0', padding: '0.4rem 1.2rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: 'var(--radius-sm)', fontWeight: '800', fontFamily: 'monospace', fontSize: '1.2rem' }}>
              {orderId}
            </span>
            لقد أرسلنا تفاصيل الفاتورة الدولية وتتبع الجمارك على هاتفك المحمول. تتبع شحنتك بالأسفل:
          </p>

          {/* خط التتبع الزمني */}
          <div className="timeline-container">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              const isCompleted = idx < currentStatus;
              const isActive = idx === currentStatus;
              const nodeClass = isCompleted ? 'completed' : isActive ? 'active' : '';

              return (
                <div key={idx} className={`tracker-node ${nodeClass}`}>
                  <div className="tracker-icon-box">
                    <IconComp size={18} />
                  </div>
                  <div className="tracker-content">
                    <span className="tracker-title">{step.title}</span>
                    <span className="tracker-desc">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '1rem' }}>
            متابعة التسوق في المتجر
          </button>
        </div>
      </div>
    </div>
  );
};
