import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { PRODUCTS } from './data/products';
import type { Product } from './data/products';
import { HomePage } from './pages/HomePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';


function App() {
  // الحالات العامة للتطبيق (State)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('elbat_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('elbat_favs');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);

  // حالات فتح النوافذ المنبثقة
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // حالة تتبع الطلب النشط
  const [activeOrder, setActiveOrder] = useState<{ id: string; customerName: string } | null>(null);

  // الإشعارات المنبثقة (Toasts)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // حفظ التغييرات في LocalStorage تلقائياً
  useEffect(() => {
    localStorage.setItem('elbat_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('elbat_favs', JSON.stringify(favorites));
  }, [favorites]);

  // إرسال تنبيه منبثق جديد
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // التحكم في السلة
  const handleAddToCart = (product: Product, quantity: number = 1, color?: string, size?: string) => {
    const itemId = `${product.id}_${color || 'none'}_${size || 'none'}`;
    
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === itemId);
      if (existing) {
        showToast(`تم تحديث كمية "${product.title}" في السلة!`);
        return prevItems.map((item) => 
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      showToast(`تمت إضافة "${product.title}" إلى السلة بنجاح!`);
      return [...prevItems, { id: itemId, product, quantity, color, size }];
    });
  };

  // إضافة سريعة من البطاقة
  const handleQuickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    handleAddToCart(product, 1, defaultColor, defaultSize);
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      showToast(`تمت إزالة "${item.product.title}" من السلة.`, 'error');
    }
  };

  // التحكم في المفضلة
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      const prod = PRODUCTS.find((p) => p.id === id);
      if (isFav) {
        showToast(`تمت إزالة "${prod?.title}" من المفضلة.`, 'error');
        return prev.filter((favId) => favId !== id);
      } else {
        showToast(`تمت إضافة "${prod?.title}" إلى المفضلة!`);
        return [...prev, id];
      }
    });
  };

  // إتمام الدفع بنجاح
  const handleCheckoutSuccess = (orderId: string, customerName: string) => {
    setActiveOrder({ id: orderId, customerName });
    setCartItems([]); // تفريغ السلة
    setIsCheckoutOpen(false);
  };



  // التمرير السلس إلى كتالوج المنتجات
  const navigate = useNavigate();
  const scrollToCatalog = () => {
    // Navigate home if not there, then scroll
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('explore-products');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById('explore-products');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // إجمالي عدد العناصر في السلة
  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* الترويسة وشريط التنقل */}
      <Header
        cartCount={cartTotalCount}
        favCount={favorites.length}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          scrollToCatalog();
        }}
        onCartOpen={() => setIsCartOpen(true)}
        showOnlyFavs={showOnlyFavs}
        onToggleFavs={() => {
          setShowOnlyFavs(!showOnlyFavs);
          scrollToCatalog();
        }}
      />

      {/* محتوى الصفحات الديناميكي (التنقل) */}
      <div style={{ flexGrow: 1 }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                showOnlyFavs={showOnlyFavs}
                setShowOnlyFavs={setShowOnlyFavs}
                searchQuery={searchQuery}
                favorites={favorites}
                handleToggleFavorite={handleToggleFavorite}
                handleQuickAddToCart={handleQuickAddToCart}
              />
            } 
          />
          <Route 
            path="/product/:id" 
            element={<ProductDetailsPage onAddToCart={handleAddToCart} />} 
          />
        </Routes>
      </div>

      {/* ذيل الصفحة الراقي (Footer) */}
      <footer style={{ backgroundColor: 'var(--primary-dark)', color: 'white', marginTop: 'auto', borderTopRightRadius: 'var(--radius-lg)', borderTopLeftRadius: 'var(--radius-lg)' }}>
        <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', padding: '4rem 2rem 2rem' }}>
          
          {/* العمود 1: حول المتجر */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="شعار المتجر في الأسفل" style={{ width: '40px', height: '40px' }} />
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)' }}>متجر البطّ</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.8' }}>
              منصتك الإلكترونية الأولى لشراء المنتجات الأصلية من أشهر الماركات العالمية وشحنها مباشرة إلى مصر مع تخليص جمركي متكامل ودعم الدفع المحلي بالكامل.
            </p>
          </div>

          {/* العمود 2: روابط سريعة */}
          <div>
            <h4 style={{ color: 'var(--secondary)', marginBottom: '1.2rem', fontWeight: '700' }}>روابط مهمة</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <li><a href="#explore-products" onClick={(e) => { e.preventDefault(); scrollToCatalog(); }} style={{ transition: 'var(--transition)' }}>تصفح كافة المنتجات</a></li>
              <li><a href="#" style={{ transition: 'var(--transition)' }}>سياسة الاستبدال والاسترجاع</a></li>
              <li><a href="#" style={{ transition: 'var(--transition)' }}>شروط الاستخدام والخصوصية</a></li>
              <li><a href="#" style={{ transition: 'var(--transition)' }}>الأسئلة الشائعة والمساعدة</a></li>
            </ul>
          </div>

          {/* العمود 3: تواصل معنا */}
          <div>
            <h4 style={{ color: 'var(--secondary)', marginBottom: '1.2rem', fontWeight: '700' }}>تواصل معنا</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <li>📍 القاهرة، جمهورية مصر العربية</li>
              <li>📧 support@elbat.com</li>
              <li>📞 02-3456789</li>
              <li style={{ marginTop: '0.5rem', display: 'flex', gap: '0.8rem' }}>
                <span title="تويتر" style={{ cursor: 'pointer' }}>🐦</span>
                <span title="انستغرام" style={{ cursor: 'pointer' }}>📸</span>
                <span title="سناب شات" style={{ cursor: 'pointer' }}>👻</span>
              </li>
            </ul>
          </div>

          {/* العمود 4: النشرة الإخبارية */}
          <div>
            <h4 style={{ color: 'var(--secondary)', marginBottom: '1.2rem', fontWeight: '700' }}>انضم لعائلة البطّ</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.8rem' }}>
              اشترك في قائمتنا البريدية للحصول على خصومات وعروض حصرية لمنتجات البط!
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input 
                type="email" 
                placeholder="بريدك الإلكتروني" 
                style={{ flexGrow: 1, padding: '0.5rem 0.8rem', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', outline: 'none' }}
              />
              <button 
                className="btn-primary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', boxShadow: 'none' }}
                onClick={() => showToast("شكراً للاشتراك بنجاح! 🎉")}
              >
                اشتراك
              </button>
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          جميع الحقوق محفوظة © {new Date().getFullYear()} لمتجر البطّ. صنع بكل 💛 لتسهيل تسوقك.
        </div>
      </footer>

      {/* المكونات المنبثقة والسحب (Modals & Drawers) */}

      {/* سلة المشتريات الجانبية */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutOpen={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* شاشة الدفع والتأكيد */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* شاشة تتبع حالة الطلب الحية الاحتفالية */}
      <OrderTracker
        isOpen={activeOrder !== null}
        orderId={activeOrder?.id || ''}
        customerName={activeOrder?.customerName || ''}
        onClose={() => setActiveOrder(null)}
      />

      {/* نظام التنبيهات العام */}
      <Toast toasts={toasts} onClose={removeToast} />
    </>
  );
}

export default App;
