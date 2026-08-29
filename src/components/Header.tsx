import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, UserCheck, ShieldCheck, LogOut } from 'lucide-react';
import { getCurrentUser, clearAuthSession } from '../api/auth';
import { SearchDropdown } from './SearchDropdown';
import type { SubCategory } from '../types/api';

interface HeaderProps {
  cartCount: number;
  favCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onCartOpen: () => void;
  showOnlyFavs: boolean;
  onToggleFavs: () => void;
  subCategories?: SubCategory[];
  activeSubCategory?: string;
  onSubCategorySelect?: (key: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  favCount,
  searchQuery,
  onSearchChange,
  onCartOpen,
  showOnlyFavs,
  onToggleFavs,
  subCategories = [],
  activeSubCategory = 'all',
  onSubCategorySelect
}) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // ── Auth state read from localStorage ───────────────────────
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  useEffect(() => {
    // Re-read when storage changes (login/logout in other tabs or after navigation)
    const syncUser = () => setCurrentUser(getCurrentUser());
    window.addEventListener('storage', syncUser);
    // Also re-read after a short delay so navigation-triggered login is picked up
    const timer = setTimeout(syncUser, 200);
    return () => {
      window.removeEventListener('storage', syncUser);
      clearTimeout(timer);
    };
  }, []);

  const isLoggedIn = !!currentUser;
  const isAdmin = isLoggedIn && (() => {
    const r = currentUser!.roles;
    const roles = Array.isArray(r) ? r : [r];
    return roles.some((role: any) =>
      typeof role === 'string' && role.toLowerCase() === 'admin'
    );
  })();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserIconClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      setIsUserMenuOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const userIconTitle = isAdmin ? 'لوحة الإدارة' : isLoggedIn ? `مرحباً ${currentUser!.firstName || ''}` : 'تسجيل الدخول / حسابي';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="header-wrapper">
      <div className="discount-announcement-bar">
        <span> <strong>خصم خاص:</strong> احصلي على خصم <span className="highlight-badge">150 ج.م</span> عند شراء <strong>قطعتين أو أكثر</strong>!</span>
      </div>
      <header className={`main-header glass ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-top-container">
        
        {/* Logo and Brand Name */}
        <div className="logo-container" onClick={() => {
          onSearchChange('');
          if (showOnlyFavs) onToggleFavs();
          if (onSubCategorySelect) onSubCategorySelect('all');
          navigate('/');
        }}>
          <img src="/logo.png" alt="شعار متجر البط" className="logo-img" />
        </div>

        {/* Search bar & Subcategories (Desktop: visible next to search input) */}
        <div className="header-center-area">
          {subCategories && subCategories.length > 0 && onSubCategorySelect && (
            <div className="subcategories-desktop-nav">
              {/* Home link */}
              <button
                className={`subcategory-nav-btn ${activeSubCategory === 'all' ? 'active' : ''}`}
                onClick={() => {
                  onSubCategorySelect('all');
                  navigate('/');
                }}
              >
                الرئيسية
              </button>
              {/* All Products link */}
              <button
                className={`subcategory-nav-btn ${activeSubCategory === 'products' ? 'active' : ''}`}
                onClick={() => {
                  onSubCategorySelect('products');
                  navigate('/products');
                }}
              >
                كل المنتجات
              </button>
              {subCategories.filter(sc => sc.isActive).map((sc) => {
                const isSubActive = activeSubCategory === sc.id.toString();
                return (
                  <button
                    key={sc.id}
                    className={`subcategory-nav-btn ${isSubActive ? 'active' : ''}`}
                    onClick={() => onSubCategorySelect(sc.id.toString())}
                  >
                    {sc.name}
                  </button>
                );
              })}
            </div>
          )}

          <SearchDropdown
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>

        {/* Actions */}
        <div className="header-actions">
          <button 
            className={`action-btn ${showOnlyFavs ? 'is-fav' : ''}`}
            onClick={onToggleFavs}
            title={showOnlyFavs ? "عرض كل المنتجات" : "عرض المفضلة"}
            style={{ color: showOnlyFavs ? '#E91E63' : 'inherit' }}
          >
            <Heart size={22} fill={showOnlyFavs ? "#E91E63" : "none"} />
            {favCount > 0 && <span className="badge-count" style={{ backgroundColor: '#E91E63' }}>{favCount}</span>}
          </button>

          <button className="action-btn" onClick={onCartOpen} title="سلة المشتريات">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </button>

          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              className="action-btn"
              onClick={handleUserIconClick}
              title={userIconTitle}
              style={{ position: 'relative' }}
            >
              {isAdmin
                ? <ShieldCheck size={22} color="#236b93" />
                : isLoggedIn
                  ? <UserCheck size={22} color="#2e7d32" />
                  : <User size={22} />
              }
              {/* Green dot when logged in */}
              {isLoggedIn && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isAdmin ? '#236b93' : '#2e7d32',
                  border: '1.5px solid #fff',
                }} />
              )}
            </button>

            {/* Dropdown Menu when logged in */}
            {isLoggedIn && isUserMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: 0,
                  minWidth: '210px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 12px 35px rgba(35,107,147,0.18)',
                  border: '1px solid rgba(35,107,147,0.12)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  direction: 'rtl',
                }}
              >
                {/* User Info Header */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'linear-gradient(135deg, rgba(35,107,147,0.06) 0%, rgba(35,107,147,0.02) 100%)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                    {currentUser?.firstName
                      ? `${currentUser.firstName} ${currentUser.lastName || ''}`
                      : 'حسابي'}
                  </span>
                  {currentUser?.email && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser.email}
                    </span>
                  )}
                </div>

                {/* Menu Options */}
                <div style={{ padding: '0.4rem 0' }}>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/admin');
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#236b93',
                        textAlign: 'right',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(35,107,147,0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <ShieldCheck size={17} />
                      <span>لوحة الإدارة</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                      textAlign: 'right',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <User size={17} style={{ color: 'var(--primary)' }} />
                    <span>الصفحة الشخصية</span>
                  </button>

                  {/* Logout tab */}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '0.3rem', paddingTop: '0.3rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#ef4444',
                        textAlign: 'right',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <LogOut size={17} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories (Mobile: visible below header on small screens) */}
      {subCategories && subCategories.length > 0 && onSubCategorySelect && (
        <div className="subcategories-mobile-nav">
          {/* Home link */}
          <button
            className={`subcategory-nav-btn ${activeSubCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              onSubCategorySelect('all');
              navigate('/');
            }}
          >
            الرئيسية
          </button>
          {/* All Products link */}
          <button
            className={`subcategory-nav-btn ${activeSubCategory === 'products' ? 'active' : ''}`}
            onClick={() => {
              onSubCategorySelect('products');
              navigate('/products');
            }}
          >
            كل المنتجات
          </button>
          {subCategories.filter(sc => sc.isActive).map((sc) => {
            const isSubActive = activeSubCategory === sc.id.toString();
            return (
              <button
                key={sc.id}
                className={`subcategory-nav-btn ${isSubActive ? 'active' : ''}`}
                onClick={() => onSubCategorySelect(sc.id.toString())}
              >
                {sc.name}
              </button>
            );
          })}
        </div>
      )}
    </header>
    </div>
  );
};
export default Header;
