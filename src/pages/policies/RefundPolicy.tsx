import React from 'react';
import { RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { getStoreSettings } from '../../utils/storeSettings';

export const RefundPolicy: React.FC = () => {
  const settings = getStoreSettings();
  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', direction: 'rtl', textAlign: 'right', lineHeight: 1.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <RefreshCw size={32} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>سياسة الاستبدال والاسترجاع</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        في <strong>متجر البطّ</strong>، رضاكم هو أولويتنا الأولى. نلتزم بتقديم سياسة إرجاع واستبدال مرنة وعادلة بما يتوافق مع قوانين حماية المستهلك في مصر وشروط بوابات الدفع الإلكترونية.
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> 1. شروط الاستبدال والاسترجاع
        </h2>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <li>يجب تقديم طلب الاسترجاع أو الاستبدال خلال <strong>14 يوماً</strong> من تاريخ استلام المنتج.</li>
          <li>يجب أن يكون المنتج في حالته الأصلية، غير مستخدم، وبداخل التغليف الأصلي والعلبة الخاصة به مع وجود كافة الملصقات.</li>
          <li>يجب توفير فاتورة الشراء الأصلية أو رقم الطلب الإلكتروني للتأكيد.</li>
          <li>لا يمكن استرجاع أو استبدال بعض المنتجات الخاصة لأسباب صحية (مثل الملابس الداخلية، الجوارب، ومستحضرات التجميل) إلا في حال وجود عيب صناعة واضح.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> 2. آلية وطرق استرداد الأموال
        </h2>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <li><strong>الدفع الإلكتروني (Paymob / بطاقات ائتمان):</strong> عند إلغاء الطلب أو استرجاعه، سيتم رد المبلغ المدفوع تلقائياً إلى نفس البطاقة الائتمانية المستخدمة في الدفع. يرجى العلم أن معالجة عملية الإرجاع قد تستغرق من <strong>5 إلى 14 يوم عمل</strong> وفقاً للسياسة البنكية المعمول بها.</li>
          <li><strong>الدفع عند الاستلام (COD):</strong> سيتم إرجاع المبالغ النقدية عبر التحويل البنكي أو عبر إحدى المحافظ الإلكترونية للهاتف المحمول (مثل فودافون كاش أو اتصالات كاش وغيرها) بالاتفاق مع العميل.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
          3. رسوم الشحن عند الإرجاع
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          إذا كان سبب الإرجاع يعود إلى وجود عيب مصنعي أو خطأ في إرسال المنتج الصحيح، فيتحمل <strong>متجر البطّ</strong> كافة تكاليف شحن الإرجاع والتوصيل الجديد. أما إذا كان الإرجاع بناءً على رغبة العميل الشخصية (مثل اختيار مقاس خاطئ أو تغيير الرأي)، فيتحمل العميل رسوم الشحن بالكامل.
        </p>
      </section>

      <div style={{ marginTop: '3rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', margin: 0 }}>
          لتقديم طلب استرجاع أو استبدال، يرجى التواصل مع فريق الدعم لدينا عبر البريد الإلكتروني: <strong>{settings.email}</strong> أو الاتصال بخدمة العملاء.
        </p>
      </div>
    </div>
  );
};
