import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      
      // Save token to localStorage (can be inside response.token or response direct)
      const token = response?.token || response || '';
      if (token) {
        localStorage.setItem('elbat_token', token);
      }
      
      navigate('/');
      window.location.reload(); // Reload to sync cart/wishlist
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
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
        
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>تسجيل الدخول</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>مرحباً بك مجدداً في متجر البطّ </p>

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
              البريد الإلكتروني *
            </label>
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
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>
              كلمة المرور *
            </label>
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
            <div style={{ textAlign: 'left', marginTop: '0.4rem' }}>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>
                نسيت كلمة المرور؟
              </Link>
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
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري تسجيل الدخول...</>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          ليس لديك حساب؟ <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>إنشاء حساب جديد</Link>
        </p>
      </div>
    </div>
  );
};
