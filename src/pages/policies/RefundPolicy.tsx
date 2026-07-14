import React from 'react';
import { RefreshCw, FileText, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { getStoreSettings } from '../../utils/storeSettings';

export const RefundPolicy: React.FC = () => {
  const settings = getStoreSettings();
  return (
    <div style={{ maxWidth: '850px', margin: '3rem auto', padding: '0 1.5rem', direction: 'rtl', textAlign: 'right', lineHeight: 1.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <RefreshCw size={32} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>سياسة الاستبدال والاسترجاع والمعاينة</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>
        في <strong>عائلة البطّ (Elbat)</strong>، نثق 100% في جودة خاماتنا ومنتجاتنا، ولأننا نؤمن بأن الثقة والشفافية هي أساس أي معاملة ناجحة، فإننا نمنح عملائنا الحق الكامل في المعاينة والفحص قبل دفع أي مبالغ.
      </p>

      {/* 1. Pre-delivery Inspection */}
      <section style={{ marginBottom: '2.5rem', background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={22} style={{ color: 'var(--primary)' }} /> سياسة المعاينة قبل الاستلام
        </h2>
        <p style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
          حقك الكامل في معاينة وفحص طلبك فور وصوله إليك مع مندوب الشحن:
        </p>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>عند وصول مندوب الشحن بالطلب، من حقك الكامل طلب فتح الشحنة ومعاينتها أمامه.</li>
          <li>نرجو منك تخصيص دقيقتين لمعاينة المنتج والتأكد من مطابقته الكاملة لطلبك قبل دفع أي مبالغ للمندوب.</li>
          <li>
            <strong>ماذا يجب أن تتأكد منه أثناء المعاينة؟</strong>
            <ul style={{ paddingRight: '1.25rem', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>المقاس:</strong> التأكد من مطابقته تماماً للمقاس الذي قمت بطلبه.</li>
              <li><strong>اللون والخامة:</strong> التأكد من أن اللون والخامة مطابقين تماماً للصور المعروضة على موقعنا.</li>
              <li><strong>الحالة العامة:</strong> خلو المنتج من أي عيوب صناعة أو تلفيات واضحة (مثل قطع، بقع، إلخ).</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* 2. Delivery Scenarios */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={22} style={{ color: 'var(--primary)' }} /> سيناريوهات الاستلام والمعاينة
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          نوضح لجميع عملائنا الكرام سيناريوهات المعاينة والاستلام بمنتهى الشفافية:
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ borderLeft: '4px solid #2e7d32', padding: '1rem', background: 'rgba(46,125,50,0.03)', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: '#2e7d32', fontWeight: 700 }}>أ) في حالة كان المنتج سليماً ومطابقاً لطلبك:</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              إذا وجدت أن المنتج مطابق لطلبك وبحالته المثالية، يقوم العميل بدفع المبلغ المستحق بالكامل للمندوب (ثمن المنتج + مصاريف الشحن) واستلام الطلب بنجاح.
            </p>
          </div>

          <div style={{ borderLeft: '4px solid #f57c00', padding: '1rem', background: 'rgba(245,124,0,0.03)', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: '#f57c00', fontWeight: 700 }}>ب) في حالة رفض الاستلام (لمطابقة المنتج ولكن لتغيير الرأي):</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              إذا كان المنتج سليماً 100% ومطابقاً للمواصفات، ولكنك قررت التراجع عن الشراء لأي سبب شخصي، يتم إرجاع الطلب فوراً مع المندوب، ويقوم العميل بدفع **مصاريف الشحن فقط**.
            </p>
          </div>

          <div style={{ borderLeft: '4px solid #d32f2f', padding: '1rem', background: 'rgba(211,47,47,0.03)', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: '#d32f2f', fontWeight: 700 }}>ج) في حالة وجود عيب صناعة أو خطأ في الطلب:</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              إذا اكتشفت وجود عيب صناعة واضح، أو أن المنتج الذي وصلك مختلف تماماً عن طلبك (مقاس مختلف، لون مختلف، منتج آخر)، يحق لك رفض استلام الطلب بالكامل. **ولن يتم مطالبتك بدفع أي مبالغ نهائياً** (لا ثمن المنتج ولا مصاريف الشحن).
            </p>
          </div>
        </div>
      </section>

      {/* Important Alert */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(245,124,0,0.05)', border: '1px solid rgba(245,124,0,0.2)', borderRadius: '10px', padding: '1.25rem', marginBottom: '2.5rem' }}>
        <AlertTriangle size={24} style={{ color: '#f57c00', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.4rem', color: '#e65100', fontWeight: 700 }}>ملاحظة هامة جداً:</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            بمجرد قيام العميل بمعاينة المنتج، ودفع المبلغ واستلام الشحنة، ومغادرة مندوب الشحن، فإن هذا يعتبر إقراراً وموافقة نهائية منك بأن المنتج وصلك بحالة سليمة ومطابقة لطلبك تماماً.
          </p>
        </div>
      </div>

      {/* 3. Exchange and Return after Delivery */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={22} style={{ color: 'var(--primary)' }} /> سياسة الاستبدال والاسترجاع بعد مغادرة المندوب
        </h2>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>متاح طلب الاستبدال والاسترجاع خلال <strong>5 أيام فقط</strong> من تاريخ استلام الطلب.</li>
          <li>يشترط بشكل أساسي للحفاظ على طلب الاستبدال/الاسترجاع أن يظل المنتج في حالته الأصلية تماماً (غير مستخدم، بجميع الملصقات، وتغليفه الأصلي).</li>
          <li>في حالة الاستبدال أو الاسترجاع بعد مغادرة المندوب، يتم سداد مصاريف شحن إضافية لتغطية تكاليف توصيل واسترجاع الشحنة.</li>
        </ul>
      </section>

      {/* Contact Info Footer */}
      <div style={{ marginTop: '3rem', padding: '1.25rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.92rem', color: 'var(--primary-dark)', margin: 0 }}>
          لتقديم طلب استرجاع أو استبدال أو استفسار، يرجى التواصل معنا عبر البريد الإلكتروني الموحد: <strong>{settings.email}</strong> أو عبر حساب الواتساب الرسمي للمتجر.
        </p>
      </div>
    </div>
  );
};
export default RefundPolicy;
