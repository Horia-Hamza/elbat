import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  favCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onCartOpen: () => void;
  showOnlyFavs: boolean;
  onToggleFavs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  favCount,
  searchQuery,
  onSearchChange,
  onCartOpen,
  showOnlyFavs,
  onToggleFavs
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

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
    <header className={`main-header glass ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo-container" onClick={() => {
        onSearchChange('');
        if (showOnlyFavs) onToggleFavs();
      }}>
        <img src="/logo.png" alt="شعار متجر البط" className="logo-img"  style={{ width: '80px', height: '80px' }} />
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="ابحث عن إلكترونيات، أزياء، غادجيتس..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Search className="search-icon" size={18} />
      </div>

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

        <button className="action-btn" title="حسابي">
          <User size={22} />
        </button>
      </div>
    </header>
  );
};
