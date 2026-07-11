import React from 'react';
import { Truck, MapPin, Calendar } from 'lucide-react';
import { getStoreSettings } from '../../utils/storeSettings';

export const ShippingPolicy: React.FC = () => {
  const settings = getStoreSettings();
  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', direction: 'rtl', textAlign: 'right', lineHeight: 1.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <Truck size={32} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>سياسة الشحن والتوصيل</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        نحن في <strong>متجر البطّ</strong> نتعاون مع أفضل شركات الشحن المحلية والدولية لضمان وصول طلباتك من الملابس والمنتجات المختلفة بأمان وسرعة مباشرة إلى باب منزلك في مصر.
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} /> 1. مدة التجهيز والشحن
        </h2>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <li><strong>القاهرة والجيزة والإسكندرية:</strong> يتم التوصيل خلال <strong>2 إلى 3 أيام عمل</strong> من تاريخ تأكيد الطلب.</li>
          <li><strong>باقي محافظات مصر والوجه القبلي والبحري:</strong> يتم التوصيل خلال <strong>3 إلى 5 أيام عمل</strong>.</li>
          <li>قد يتم تمديد فترات التوصيل خلال مواسم التخفيضات الكبرى أو الأعياد الرسمية، وسيتم إخطارك بذلك عند إتمام الطلب.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} /> 2. تكلفة الشحن
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          يتم حساب تكاليف الشحن بدقة بناءً على عنوان التوصيل المحدد في الفاتورة والوزن الكلي للمشتريات:
        </p>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <li>شحن مجاني بالكامل لجميع الطلبات التي تتجاوز قيمتها حداً معيناً يتم الإعلان عنه بشكل دوري في الموقع.</li>
          <li>للطلبات الأقل من الحد المسموح، تُضاف رسوم شحن ثابتة تظهر بوضوح في صفحة الدفع قبل تأكيد المعاملة المالية.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
          3. استلام الطلبات وفحصها
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          يتعين على العميل فحص الشحنة ظاهرياً فور استلامها من مندوب شركة الشحن. في حال وجود أي تلف خارجي واضح في التغليف أو الصندوق، يرجى رفض استلام الشحنة والتواصل معنا فوراً لاتخاذ الإجراءات اللازمة وإعادة شحن طلب بديل لك دون تكاليف إضافية.
        </p>
      </section>

      <div style={{ marginTop: '3rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', margin: 0 }}>
          إذا كان لديك أي سؤال حول مكان تواجد شحنتك، يرجى تتبع الطلب من لوحة حسابك أو التواصل معنا عبر: <strong>{settings.email}</strong>
        </p>
      </div>
    </div>
  );
};
