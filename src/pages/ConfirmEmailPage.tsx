import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { authApi, saveAuthSession } from '../api/auth';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const ConfirmEmailPage: React.FC = () => {
  const { '*': wildcardCode, code: paramCode } = useParams<{ '*': string; code?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract code from query params (?code=... or ?token=...) or path params (/confirm-email/...)
  const queryCode = searchParams.get('code') || searchParams.get('token') || '';
  const pathCode = paramCode || wildcardCode || '';
  const rawCode = queryCode || pathCode || window.location.pathname.replace(/^\/confirm-email\/?/, '').replace(/^\//, '');
  const code = rawCode.trim();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleConfirm = async () => {
      if (!code) {
        if (isMounted) {
          setLoading(false);
          setSuccess(false);
          setMessage('رمز التأكيد غير صالح أو مفقود في الرابط.');
        }
        return;
      }

      try {
        const response = await authApi.confirmEmail(code);
        
        // Save session tokens & user info if returned in response
        if (response) {
          saveAuthSession(response);
        }

        if (isMounted) {
          setSuccess(true);
          setMessage('تم تأكيد البريد الإلكتروني بنجاح!');
          // Redirect to login page
          setTimeout(() => {
            navigate('/login', { state: { message: 'تم تأكيد البريد الإلكتروني بنجاح! يرجى تسجيل الدخول.' } });
          }, 1500);
        }
      } catch (err: any) {
        if (isMounted) {
          setSuccess(false);
          setMessage(err.message || 'فشل تأكيد البريد الإلكتروني. الرمز ربما انتهت صلاحيته أو غير صحيح.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    handleConfirm();

    return () => {
      isMounted = false;
    };
  }, [code, navigate]);

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
                  {message} جاري توجيهك لصفحة تسجيل الدخول...
                </p>
                <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.8rem' }}>
                  الذهاب لتسجيل الدخول
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
