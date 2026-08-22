import React from 'react';
import { Shield, Eye, Lock } from 'lucide-react';
import { getStoreSettings } from '../../utils/storeSettings';
import { useSEO } from '../../hooks/useSEO';

export const PrivacyPolicy: React.FC = () => {
  const settings = getStoreSettings();

  useSEO({
    title: 'سياسة الخصوصية | متجر البط',
    description: 'تعرف على سياسة الخصوصية لمتجر البط وكيفية جمع واستخدام وحماية بياناتك الشخصية عند التسوق عبر موقعنا.',
    url: '/privacy-policy',
  });

  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem', direction: 'rtl', textAlign: 'right', lineHeight: 1.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <Shield size={32} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>سياسة الخصوصية</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        أهلاً بك في <strong>متجر البط</strong>. نحن نلتزم بحماية خصوصيتك وضمان أمان بياناتك الشخصية بالكامل. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية عند زيارة موقعنا أو الشراء منا.
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={18} /> 1. المعلومات التي نجمعها
        </h2>
        <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>نحن نجمع البيانات الشخصية الضرورية فقط لإتمام طلباتك وتقديم تجربة تسوق ممتازة وتشمل:</p>
        <ul style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <li>الاسم الشخصي ومعلومات الاتصال (البريد الإلكتروني ورقم الهاتف).</li>
          <li>عنوان الشحن والتوصيل بالتفصيل.</li>
          <li>بيانات الدفع (تتم معالجتها بأمان تام عبر بوابات الدفع المعتمدة مثل Paymob ولا نقوم بحفظ تفاصيل بطاقاتك الائتمانية لدينا).</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} /> 2. أمان وحماية البيانات
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          نحن نستخدم تقنيات التشفير المتقدمة (SSL) لحماية نقل البيانات بين متصفحك وموقعنا. بالإضافة إلى ذلك، نقوم بتطبيق بروتوكولات أمان صارمة لمنع الوصول غير المصرح به أو الكشف عن بياناتك لأي طرف ثالث غير معتمد لإتمام عملية الشحن والتسليم.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
          3. ملفات تعريف الارتباط (Cookies)
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة التصفح، وتذكر محتويات سلة التسوق الخاصة بك، وتحليل حركة المرور على الموقع لمساعدتنا في تقديم عروض وخدمات أفضل لك.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
          4. مشاركة المعلومات مع جهات خارجية
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          لا نبيع أو نؤجر معلوماتك الشخصية لأي جهة. يتم مشاركة البيانات فقط مع شركاء العمل الموثوقين لغرض تشغيل الموقع وتوصيل الطلبات (مثل شركات الشحن) أو معالجة المدفوعات (مثل Paymob)، طالما وافقت هذه الأطراف على الحفاظ على سرية هذه المعلومات.
        </p>
      </section>

      <div style={{ marginTop: '3rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', margin: 0 }}>
          إذا كان لديك أي استفسار حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: <strong>{settings.email}</strong>
        </p>
      </div>
    </div>
  );
};
