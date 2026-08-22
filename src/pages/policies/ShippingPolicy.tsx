import React from 'react';
import { Truck, MapPin, Calendar, Check } from 'lucide-react';
import { getStoreSettings } from '../../utils/storeSettings';
import { useSEO } from '../../hooks/useSEO';

export const ShippingPolicy: React.FC = () => {
  const settings = getStoreSettings();

  useSEO({
    title: 'سياسة الشحن والتوصيل | متجر البط',
    description: 'شحن سريع لجميع محافظات مصر خلال 2-5 أيام عمل. تعرف على سياسة الشحن والتوصيل الخاصة بمتجر البط.',
    url: '/shipping-policy',
  });

  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', direction: 'rtl', textAlign: 'right', lineHeight: 1.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <Truck size={32} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>سياسة الشحن والتوصيل</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
        في <strong>عائلة البط (Elbat)</strong>، راحتك هي أولويتنا الأولى. نحن نعلم مدى حماسك لوصول طلبيتك، ولذلك نوفر لك أسرع خدمة شحن احترافية وآمنة تغطي جميع محافظات جمهورية مصر العربية.
      </p>

      {/* 1. Timelines */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} style={{ color: 'var(--primary)' }} /> 1. التوصيل السريع لجميع المحافظات
        </h2>
        <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          نحن نقوم بالتوصيل لكل مكان في مصر، من الإسكندرية إلى أسوان. هدفنا الأساسي أن تصلك طلبيتك في أسرع وقت وبأفضل حالة ممكنة:
        </p>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>مدة التوصيل:</strong> تصلك الطلبية في خلال <strong>2 إلى 5 أيام عمل</strong> كحد أقصى.</li>
          <li><strong>أيام العمل:</strong> يتم احتساب أيام العمل الرسمية فقط، ولا تشمل أيام الجمعة والعطلات الرسمية والأعياد.</li>
        </ul>
      </section>

      {/* 2. Shipping Costs */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={20} style={{ color: 'var(--primary)' }} /> 2. تكلفة الشحن والتوصيل
        </h2>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>تكلفة شحن متغيرة:</strong> يتم احتساب تكلفة الشحن ديناميكياً وتختلف حسب المحافظة وعنوان التوصيل المحدد في الفاتورة.</li>
          <li>تظهر تكلفة الشحن النهائية بالتفصيل في صفحة إتمام الطلب (Checkout) قبل الدفع أو تأكيد الشراء.</li>
        </ul>
      </section>

      {/* 3. Safety and Quality checks */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={20} style={{ color: 'var(--primary)' }} /> 3. استلام الطرود
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          لحمايتك، يُرجى معاينة وفحص الطلب أمام مندوب الشحن مباشرة والتأكد من مطابقة المقاس والألوان ونظافة المنتج، حيث تضمن لك سياسة المعاينة المجانية عدم دفع أي قيمة للمنتج في حالة وجود أي عيب أو اختلاف، ويُمكنك رفض الشحنة بالكامل في الحال.
        </p>
      </section>

      {/* Contact Info Footer */}
      <div style={{ marginTop: '3rem', padding: '1.25rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.92rem', color: 'var(--primary-dark)', margin: 0 }}>
          إذا كان لديك أي استفسار أو ترغب في تتبع شحنتك، يرجى التواصل معنا مباشرة عبر البريد الإلكتروني الموحد: <strong>{settings.email}</strong> أو عبر حساب الواتساب الرسمي للمتجر.
        </p>
      </div>
    </div>
  );
};
export default ShippingPolicy;
