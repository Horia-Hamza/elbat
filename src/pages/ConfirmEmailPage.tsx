import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const ConfirmEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleConfirm = async () => {
      if (!code) {
        setLoading(false);
        setSuccess(false);
        setMessage('رمز التأكيد غير صالح أو مفقود في الرابط.');
        return;
      }
      try {
        await authApi.confirmEmail(code);
        setSuccess(true);
        setMessage('تم تأكيد البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.');
      } catch (err: any) {
        setSuccess(false);
        setMessage(err.message || 'فشل تأكيد البريد الإلكتروني. الرمز ربما انتهت صلاحيته.');
      } finally {
        setLoading(false);
      }
    };

    handleConfirm();
  }, [code]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #F5FBFC 0%, #E6F4FA 100%)',
      fontFamily: 'var(--font-family)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-lg)',
        padding: '3.5rem 2.5rem',
        width: '100%',
        maxWidth: '460px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <img src="/logo.png" alt="متجر البط" style={{ width: '70px', height: '70px', marginBottom: '1.5rem', borderRadius: '50%' }} />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <h3 style={{ color: 'var(--primary-dark)', margin: 0 }}>جاري تأكيد البريد الإلكتروني...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>يرجى الانتظار للحظات بينما نقوم بالتحقق من الرمز.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
            {success ? (
              <>
                <CheckCircle size={56} style={{ color: '#2E7D32' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2E7D32', margin: 0 }}>تم التأكيد بنجاح</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {message}
                </p>
                <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.8rem' }}>
                  تسجيل الدخول الآن
                </Link>
              </>
            ) : (
              <>
                <XCircle size={56} style={{ color: '#C62828' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C62828', margin: 0 }}>فشل التأكيد</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {message}
                </p>
                <Link to="/register" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.8rem', border: '2px solid var(--border)' }}>
                  إعادة المحاولة / التسجيل
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
