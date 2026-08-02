import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Folders, FolderTree, ShoppingCart, Bell, Search, Settings, LogOut, Tag, Palette, Truck, MapPin, CreditCard, Layers } from 'lucide-react';
import '../admin.css';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/admin', icon: LayoutDashboard, label: 'لوحة القيادة', exact: true },
    { path: '/admin/products', icon: Package, label: 'إدارة المنتجات' },
    { path: '/admin/variants', icon: Layers, label: 'متغيرات المنتجات' },
    { path: '/admin/page-designs', icon: Palette, label: 'تصميم الصفحات' },
    { path: '/admin/categories', icon: Folders, label: 'التصنيفات' },
    { path: '/admin/subcategories', icon: FolderTree, label: 'الأقسام الفرعية' },
    { path: '/admin/brands', icon: Tag, label: 'الماركات التجارية' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'الطلبات والمبيعات' },
    { path: '/admin/payments', icon: CreditCard, label: 'العمليات المالية' },
    { path: '/admin/shipping', icon: Truck, label: 'مناطق الشحن' },
    { path: '/admin/addresses', icon: MapPin, label: 'عناوين الشحن' },
  ];

  // Helper to map route to page title
  const getPageTitle = () => {
    const current = navLinks.find(link => 
      link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path)
    );
    return current ? current.label : 'لوحة الإدارة';
  };

  return (
    <div className="admin-layout-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.png" alt="شعار البط" />
          <span>إدارة البطّ</span>
        </div>
        
        <nav className="admin-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.exact}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <NavLink to="/" className="admin-nav-item" style={{ color: 'var(--admin-warning)' }}>
              <LogOut size={20} />
              العودة للمتجر
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">{getPageTitle()}</h1>
          
          <div className="admin-topbar-actions">
            <button className="admin-icon-btn">
              <Search size={20} />
            </button>
            <button className="admin-icon-btn" style={{ position: 'relative' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: 4, right: 6, width: 8, height: 8, backgroundColor: 'var(--admin-danger)', borderRadius: '50%' }} />
            </button>
            <button className="admin-icon-btn">
              <Settings size={20} />
            </button>
            <div className="admin-avatar">
              أ
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
