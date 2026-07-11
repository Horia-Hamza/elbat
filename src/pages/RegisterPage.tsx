import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await authApi.register({
        email,
        password,
        firstName,
        lastName
      });
      
      setSuccessMessage(response?.message || 'تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني.');
      // Clear form
      setFirstName(''); setLastName(''); setEmail(''); setPassword('');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة لاحقاً.');
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
        maxWidth: '460px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <img src="/logo.png" alt="متجر البط" style={{ width: '70px', height: '70px', marginBottom: '1rem', borderRadius: '50%' }} />
        
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>إنشاء حساب جديد</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>انضم لعائلة البطّ وتسوق منتجاتك المفضلة بسهولة </p>

        {successMessage ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
            background: '#E8F5E9', border: '1px solid #A5D6A7',
            borderRadius: 'var(--radius-md)', padding: '1.5rem',
            marginBottom: '1.5rem', color: '#2E7D32', fontSize: '0.92rem',
          }}>
            <CheckCircle size={36} />
            <strong style={{ fontWeight: 700 }}>{successMessage}</strong>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              الذهاب لتسجيل الدخول
            </Link>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>الاسم الأول *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      placeholder="أحمد"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.2rem',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <User size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>الاسم الأخير *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      placeholder="محمد"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.2rem',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <User size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>البريد الإلكتروني *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>كلمة المرور *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                  <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري إنشاء الحساب...</>
                ) : (
                  'إنشاء حساب جديد'
                )}
              </button>
            </form>

            <p style={{ marginTop: '2rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              لديك حساب بالفعل؟ <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>تسجيل الدخول</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
