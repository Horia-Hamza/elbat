import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract email and token/code from URL query params
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || searchParams.get('code') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !token) {
      setError('بيانات إعادة التعيين (البريد أو رمز الأمان) مفقودة من الرابط.');
      return;
    }

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        token,
        newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'فشل إعادة تعيين كلمة المرور. قد يكون الرمز منتهي الصلاحية.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
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
        padding: '3rem 2rem',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <img src="/logo.png" alt="متجر البط" style={{ width: '70px', height: '70px', marginBottom: '1rem', borderRadius: '50%' }} />
        
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>إعادة تعيين كلمة المرور</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>أدخل كلمة المرور الجديدة الخاصة بك لحسابك.</p>

        {success ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
            background: '#E8F5E9', border: '1px solid #A5D6A7',
            borderRadius: 'var(--radius-md)', padding: '1.5rem',
            color: '#2E7D32', fontSize: '0.92rem',
          }}>
            <CheckCircle size={36} />
            <strong style={{ fontWeight: 700 }}>تمت إعادة تعيين كلمة المرور بنجاح!</strong>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#555' }}>سيتم توجيهك إلى صفحة تسجيل الدخول تلقائياً...</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: '#FFF3F3', border: '1px solid #FFCDD2',
                borderRadius: 'var(--radius-sm)', padding: '0.7rem 1rem',
                marginBottom: '1.5rem', color: '#C62828', fontSize: '0.85rem',
                textAlign: 'right'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'right' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>
                  كلمة المرور الجديدة *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    dir="ltr"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                    title={showNewPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>
                  تأكيد كلمة المرور الجديدة *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    dir="ltr"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                    title={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  padding: '0.85rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {loading ? (
                  <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري تعيين كلمة المرور...</>
                ) : (
                  'تغيير كلمة المرور'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
