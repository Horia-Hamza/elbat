import React from 'react';
import { Landmark, Scale, FileText } from 'lucide-react';

export const TermsConditions: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', direction: 'rtl', textAlign: 'right', lineHeight: 1.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <Scale size={32} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>الشروط والأحكام</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        يسرنا الترحيب بك في موقع <strong>متجر البطّ</strong>. باستخدامك لهذا الموقع أو الشراء منه، فإنك توافق على الالتزام الكامل بالشروط والأحكام التالية التي تحكم العلاقة بينك وبين متجرنا.
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> 1. شروط الاستخدام العامة
        </h2>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <li>يجب أن لا يقل عمر المستخدم للموقع عن 18 عاماً أو استخدام الموقع تحت إشراف أحد الأبوين أو الوصي القانوني.</li>
          <li>يُحظر تماماً استخدام الموقع لأي أغراض غير قانونية أو انتهاك حقوق الملكية الفكرية الخاصة بنا أو بمحتويات الموقع.</li>
          <li>نحتفظ بالحق في تعديل الأسعار، المنتجات المتاحة، أو شروط الخدمة في أي وقت ودون إشعار مسبق.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Landmark size={18} /> 2. شروط الدفع والتعاقد الإلكتروني
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          جميع عمليات الدفع الإلكتروني على الموقع تتم معالجتها بشكل آمن ومحمي بالكامل عبر بوابات الدفع الإلكتروني الشريكة لنا (مثل Paymob).
        </p>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <li>عند قيامك بالطلب والدفع عبر البطاقة الائتمانية، فإنك تفوضنا وشريك المدفوعات بخصم قيمة الفاتورة المذكورة بالكامل.</li>
          <li>نحن لا نحتفظ بأرقام بطاقاتك الائتمانية أو بيانات التحقق السرية الخاصة بها لدينا لضمان الأمان التام.</li>
          <li>في حال رفض المعاملة المالية من البنك المصدر للبطاقة، سيتم إلغاء الطلب تلقائياً وسيتعين عليك استخدام وسيلة دفع بديلة.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
          3. دقة الأسعار والمنتجات
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          نحن نسعى جاهدين لعرض تفاصيل وصور دقيقة لجميع الملابس والمنتجات على الموقع. في حال حدوث خطأ مطبعي في تسعير منتج ما أو في توفر المخزون، نحتفظ بالحق في إلغاء أو رفض أي طلبات مسجلة بهذا الخطأ، مع التزامنا التام برد أي مبالغ تم تحصيلها للعميل فوراً.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
          4. القانون الحاكم
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين السارية والمعمول بها في جمهورية مصر العربية، وتخضع أي نزاعات قد تنشأ عنها للاختصاص الحصري للمحاكم المصرية المختصة.
        </p>
      </section>

      <div style={{ marginTop: '3rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', margin: 0 }}>
          استخدامك للموقع بعد إجراء أي تغييرات في هذه الاتفاقية يعتبر قبولاً ضمنياً منك بتلك التغييرات. آخر تحديث: يوليو 2026.
        </p>
      </div>
    </div>
  );
};
