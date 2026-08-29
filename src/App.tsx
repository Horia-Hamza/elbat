import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import type { CartItem } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { ApiProduct } from './types/api';
import { HomePage } from './pages/HomePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { SubCategoryPage } from './pages/SubCategoryPage';
import { ProductsPage } from './pages/ProductsPage';

// Lazy loaded Auth pages
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ConfirmEmailPage = lazy(() => import('./pages/ConfirmEmailPage').then(m => ({ default: m.ConfirmEmailPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage').then(m => ({ default: m.ChangePasswordPage })));

// Lazy loaded Bundle Checkout page
const BundleCheckoutPage = lazy(() => import('./pages/checkout/BundleCheckoutPage'));

// Lazy loaded Policy pages
const PrivacyPolicy = lazy(() => import('./pages/policies/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const RefundPolicy = lazy(() => import('./pages/policies/RefundPolicy').then(m => ({ default: m.RefundPolicy })));
const TermsConditions = lazy(() => import('./pages/policies/TermsConditions').then(m => ({ default: m.TermsConditions })));
const ShippingPolicy = lazy(() => import('./pages/policies/ShippingPolicy').then(m => ({ default: m.ShippingPolicy })));

// Components
import { WhatsAppButton } from './components/WhatsAppButton';

// Tracking utilities
import { initTracking, trackPageView, trackAddToCart, trackInitiateCheckout } from './utils/tracking';

// Store settings
import { getStoreSettings } from './utils/storeSettings';

// Admin layout & Lazy loaded Admin pages
import { AdminLayout } from './layouts/AdminLayout';
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminVariants = lazy(() => import('./pages/admin/AdminVariants').then(m => ({ default: m.AdminVariants })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands').then(m => ({ default: m.AdminBrands })));
const AdminSubCategories = lazy(() => import('./pages/admin/AdminSubCategories').then(m => ({ default: m.AdminSubCategories })));
const AdminPageDesigns = lazy(() => import('./pages/admin/AdminPageDesigns').then(m => ({ default: m.AdminPageDesigns })));
const AdminShippingZones = lazy(() => import('./pages/admin/AdminShippingZones').then(m => ({ default: m.AdminShippingZones })));
const AdminShippingAddresses = lazy(() => import('./pages/admin/AdminShippingAddresses').then(m => ({ default: m.AdminShippingAddresses })));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments').then(m => ({ default: m.AdminPayments })));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

import { cartApi } from './api/cart';
import { wishlistApi } from './api/wishlist';
import { useSubCategories } from './hooks/useSubCategories';

const getUserIdFromToken = (): string => {
  const token = localStorage.getItem('elbat_token');
  if (!token) return 'string';
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return (
        payload.nameid ||
        payload.sub ||
        payload.id ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        'string'
      );
    }
  } catch (e) {
    console.error('Failed to parse token payload:', e);
  }
  return 'string';
};

function App() {
  const storeSettings = getStoreSettings();

  // الحالات العامة للتطبيق (State)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('elbat_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('elbat_favs');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);
  const { subCategories } = useSubCategories();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const location = useLocation();

  // Initialize Meta and TikTok Pixels (deferred for maximum page speed)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => initTracking());
    } else {
      setTimeout(() => initTracking(), 1000);
    }
  }, []);

  // Track page views and sync active subcategory highlight on route changes
  useEffect(() => {
    trackPageView();
    if (location.pathname === '/') {
      setActiveSubCategory('all');
    } else if (location.pathname.startsWith('/subcategory/')) {
      const parts = location.pathname.split('/');
      const id = parts[parts.length - 1];
      setActiveSubCategory(id);
    } else {
      setActiveSubCategory('none');
    }
  }, [location]);

  // Track checkout initiation
  useEffect(() => {
    if (isCheckoutOpen && cartItems.length > 0) {
      trackInitiateCheckout(
        cartItems.map(item => ({
          product: { id: item.product.id, price: item.product.salePrice !== null && item.product.salePrice !== undefined ? item.product.salePrice : item.product.basePrice },
          quantity: item.quantity
        }))
      );
    }
  }, [isCheckoutOpen]);

  // حفظ التغييرات في LocalStorage تلقائياً
  useEffect(() => {
    localStorage.setItem('elbat_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('elbat_favs', JSON.stringify(favorites));
  }, [favorites]);

  const syncCartToBackend = async () => {
    const token = localStorage.getItem('elbat_token');
    if (!token) return;
    const localCartStr = localStorage.getItem('cart');
    if (!localCartStr) return;
    try {
      const localCart = JSON.parse(localCartStr);
      if (Array.isArray(localCart) && localCart.length > 0) {
        const decodedUserId = getUserIdFromToken();
        // Sync each item to backend API
        for (const item of localCart) {
          try {
            await cartApi.addToCart({
              userId: decodedUserId,
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
            });
          } catch (e) {
            console.error('Error syncing item to cart API:', e);
          }
        }
        // Clear local cart
        localStorage.setItem('cart', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
    }
  };

  const syncWishlistToBackend = async () => {
    const token = localStorage.getItem('elbat_token');
    if (!token) return;
    const localWishlistStr = localStorage.getItem('wishlist');
    if (!localWishlistStr) return;
    try {
      const localWishlist = JSON.parse(localWishlistStr);
      if (Array.isArray(localWishlist) && localWishlist.length > 0) {
        const decodedUserId = getUserIdFromToken();
        // Sync each item to backend API
        for (const item of localWishlist) {
          try {
            await wishlistApi.addToWishlist({
              userId: decodedUserId,
              productId: Number(item.productId),
            });
          } catch (e) {
            console.error('Error syncing item to wishlist API:', e);
          }
        }
        // Clear local wishlist
        localStorage.setItem('wishlist', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Error parsing wishlist from localStorage:', e);
    }
  };

  const fetchWishlistFromServer = async () => {
    const token = localStorage.getItem('elbat_token');
    if (!token) return;
    try {
      const decodedUserId = getUserIdFromToken();
      if (!decodedUserId || decodedUserId === 'string') return;
      const items = await wishlistApi.getWishlistByUser(decodedUserId);
      if (Array.isArray(items)) {
        const serverProductIds = items.map(item => String(item.productId));
        setFavorites((prev) => Array.from(new Set([...prev, ...serverProductIds])));
      }
    } catch (e) {
      console.error('Error fetching wishlist from server:', e);
    }
  };

  // Sync and fetch ONCE when user is logged in or on auth storage change (no 5s polling loop)
  useEffect(() => {
    const token = localStorage.getItem('elbat_token');
    if (token) {
      syncCartToBackend();
      syncWishlistToBackend();
      fetchWishlistFromServer();
    }

    const handleStorage = () => {
      const currentToken = localStorage.getItem('elbat_token');
      if (currentToken) {
        syncCartToBackend();
        syncWishlistToBackend();
        fetchWishlistFromServer();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // إرسال تنبيه منبثق جديد
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // التحكم في السلة
  const handleAddToCart = (product: ApiProduct, quantity: number = 1, color?: string, size?: string) => {
    const priceVal = product.salePrice !== null && product.salePrice !== undefined ? product.salePrice : product.basePrice;
    trackAddToCart({ id: product.id, name: product.name, price: priceVal }, quantity);

    const itemId = `${product.id}_${color || 'none'}_${size || 'none'}`;

    // Resolve variantId
    let variantId = 0;
    if (product.variants && product.variants.length > 0) {
      const matched = product.variants.find(v =>
        (!color || v.color === color) &&
        (!size || v.size === size)
      );
      if (matched) {
        variantId = matched.id;
      } else {
        variantId = product.variants[0].id;
      }
    }

    // Store in localStorage under the key 'cart'
    const currentUserId = localStorage.getItem('elbat_token') ? getUserIdFromToken() : 'string';
    const localCartStr = localStorage.getItem('cart');
    let localCartArray: any[] = [];
    try {
      localCartArray = localCartStr ? JSON.parse(localCartStr) : [];
      if (!Array.isArray(localCartArray)) {
        localCartArray = [];
      }
    } catch {
      localCartArray = [];
    }

    const existingIndex = localCartArray.findIndex(item =>
      item.productId === product.id &&
      item.variantId === variantId
    );

    if (existingIndex > -1) {
      localCartArray[existingIndex].quantity += quantity;
      localCartArray[existingIndex].userId = currentUserId;
    } else {
      localCartArray.push({
        userId: currentUserId,
        productId: product.id,
        variantId: variantId,
        quantity: quantity
      });
    }
    localStorage.setItem('cart', JSON.stringify(localCartArray));

    // Immediately trigger backend sync if token is present
    syncCartToBackend();

    // Show toast outside of state updater to prevent double execution in StrictMode
    const existing = cartItems.find((item) => item.id === itemId);
    if (existing) {
      showToast(`تم تحديث كمية "${product.name}" في السلة!`);
    } else {
      showToast(`تمت إضافة "${product.name}" إلى السلة بنجاح!`);
    }

    // Normal state update
    setCartItems((prevItems) => {
      const isExisting = prevItems.some((item) => item.id === itemId);
      if (isExisting) {
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { id: itemId, product, quantity, color, size }];
    });
  };

  // إضافة سريعة من البطاقة
  const handleQuickAddToCart = (product: ApiProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.variants && product.variants.length > 0 ? product.variants[0].color || undefined : undefined;
    const defaultSize = product.variants && product.variants.length > 0 ? product.variants[0].size || undefined : undefined;
    handleAddToCart(product, 1, defaultColor, defaultSize);
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );

    // Update 'cart' in localStorage
    try {
      const item = cartItems.find((i) => i.id === id);
      if (item) {
        let variantId = 0;
        if (item.product.variants && item.product.variants.length > 0) {
          const matched = item.product.variants.find(v =>
            (!item.color || v.color === item.color) &&
            (!item.size || v.size === item.size)
          );
          if (matched) variantId = matched.id;
        }

        const localCartStr = localStorage.getItem('cart');
        if (localCartStr) {
          let localCart = JSON.parse(localCartStr);
          if (Array.isArray(localCart)) {
            const idx = localCart.findIndex(li => li.productId === item.product.id && li.variantId === variantId);
            if (idx > -1) {
              localCart[idx].quantity = qty;
              localStorage.setItem('cart', JSON.stringify(localCart));
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveCartItem = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      showToast(`تمت إزالة "${item.product.name}" من السلة.`, 'error');

      // Update 'cart' in localStorage
      try {
        let variantId = 0;
        if (item.product.variants && item.product.variants.length > 0) {
          const matched = item.product.variants.find(v =>
            (!item.color || v.color === item.color) &&
            (!item.size || v.size === item.size)
          );
          if (matched) variantId = matched.id;
        }

        const localCartStr = localStorage.getItem('cart');
        if (localCartStr) {
          let localCart = JSON.parse(localCartStr);
          if (Array.isArray(localCart)) {
            localCart = localCart.filter(li => !(li.productId === item.product.id && li.variantId === variantId));
            localStorage.setItem('cart', JSON.stringify(localCart));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // التحكم في المفضلة
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = favorites.includes(id);
    const numId = Number(id);

    if (isFav) {
      showToast(`تمت الإزالة من المفضلة.`, 'error');
      setFavorites((prev) => prev.filter((favId) => favId !== id));

      const token = localStorage.getItem('elbat_token');
      if (token) {
        try {
          const decodedUserId = getUserIdFromToken();
          const items = await wishlistApi.getWishlistByUser(decodedUserId);
          if (Array.isArray(items)) {
            const match = items.find((i) => i.productId === numId);
            if (match && match.id) {
              await wishlistApi.removeFromWishlist(match.id);
            }
          }
        } catch (err) {
          console.error('Error removing item from wishlist API:', err);
        }
      }
    } else {
      showToast(`تمت الإضافة إلى المفضلة!`);
      setFavorites((prev) => [...prev, id]);

      const token = localStorage.getItem('elbat_token');
      if (token) {
        try {
          const decodedUserId = getUserIdFromToken();
          await wishlistApi.addToWishlist({
            userId: decodedUserId,
            productId: numId,
          });
        } catch (err) {
          console.error('Error adding item to wishlist API:', err);
        }
      }
    }
  };


  // شراء الآن — يفتح الدفع مباشرة دون إضافة المنتج إلى السلة
  const handleBuyNow = (product: import('./types/api').ApiProduct, quantity: number, color?: string, size?: string) => {
    const itemId = `${product.id}_${color || 'none'}_${size || 'none'}`;
    setBuyNowItem({ id: itemId, product, quantity, color, size });

    // Track initiate checkout for pixel tracking
    const priceVal = product.salePrice !== null && product.salePrice !== undefined ? product.salePrice : product.basePrice;
    trackInitiateCheckout([{ product: { id: product.id, price: priceVal }, quantity }]);

    setIsCheckoutOpen(true);
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
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* ====================================================
          ADMIN DASHBOARD ROUTES 
          ==================================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="variants" element={<AdminVariants />} />
          <Route path="page-designs" element={<AdminPageDesigns />} />
          <Route path="page-designs/:productId" element={<AdminPageDesigns />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="subcategories" element={<AdminSubCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="shipping" element={<AdminShippingZones />} />
          <Route path="addresses" element={<AdminShippingAddresses />} />
        </Route>

        {/* ====================================================
          PAYMENT CALLBACK — standalone, no header/footer
          ==================================================== */}
        <Route path="/payment/result" element={<PaymentSuccessPage />} />
        <Route path="/payment/callback" element={<PaymentSuccessPage />} />

        {/* ====================================================
          CONSUMER STOREFRONT ROUTES 
          ==================================================== */}
        <Route path="/*" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header
              cartCount={cartTotalCount}
              favCount={favorites.length}
              searchQuery={searchQuery}
              onSearchChange={(val) => {
                setSearchQuery(val);
              }}
              onCartOpen={() => setIsCartOpen(true)}
              showOnlyFavs={showOnlyFavs}
              onToggleFavs={() => {
                setIsWishlistOpen(true);
              }}
              subCategories={subCategories}
              activeSubCategory={activeSubCategory}
              onSubCategorySelect={(key) => {
                setActiveSubCategory(key);
                setActiveCategory('all');
                setShowOnlyFavs(false);
                if (key === 'all') {
                  navigate('/');
                } else {
                  navigate(`/subcategory/${key}`);
                }
              }}
            />

            <div style={{ flexGrow: 1 }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                      activeSubCategory={activeSubCategory}
                      setActiveSubCategory={setActiveSubCategory}
                      subCategories={subCategories}
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
                  element={
                    <ProductDetailsPage
                      onAddToCart={handleAddToCart}
                      onQuickAddToCart={handleQuickAddToCart}
                      onBuyNow={handleBuyNow}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/confirm-email" element={<ConfirmEmailPage />} />
                <Route path="/confirm-email/*" element={<ConfirmEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/bundle-checkout" element={<BundleCheckoutPage />} />
                <Route
                  path="/subcategory/:id"
                  element={
                    <SubCategoryPage
                      favorites={favorites}
                      handleToggleFavorite={handleToggleFavorite}
                      handleQuickAddToCart={handleQuickAddToCart}
                    />
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProductsPage
                      favorites={favorites}
                      handleToggleFavorite={handleToggleFavorite}
                      handleQuickAddToCart={handleQuickAddToCart}
                    />
                  }
                />

                {/* Policies */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
              </Routes>
            </div>

            <footer style={{ backgroundColor: 'var(--primary-dark)', color: 'white', marginTop: 'auto', borderTopRightRadius: 'var(--radius-lg)', borderTopLeftRadius: 'var(--radius-lg)' }}>
              <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', padding: '4rem 2rem 2rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/logo.png" alt="شعار المتجر في الأسفل" style={{ width: '40px', height: '40px' }} />
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)' }}>متجر البط</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.8' }}>
                    منصتك الإلكترونية الأولى لشراء المنتجات الأصلية من أشهر الماركات العالمية والمصريه وشحنها مباشرة إلى باب منزلك ودعم الدفع المحلي بالكامل.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--secondary)', marginBottom: '1.2rem', fontWeight: '700' }}>روابط مهمة</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <li><a href="#explore-products" onClick={(e) => { e.preventDefault(); scrollToCatalog(); }} style={{ transition: 'var(--transition)' }}>تصفح كافة المنتجات</a></li>
                    <li><Link to="/refund-policy" style={{ transition: 'var(--transition)' }}>سياسة الاستبدال والاسترجاع</Link></li>
                    <li><Link to="/privacy-policy" style={{ transition: 'var(--transition)' }}>سياسة الخصوصية</Link></li>
                    <li><Link to="/terms-conditions" style={{ transition: 'var(--transition)' }}>الشروط والأحكام</Link></li>
                    <li><Link to="/shipping-policy" style={{ transition: 'var(--transition)' }}>سياسة الشحن والتوصيل</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: 'var(--secondary)', marginBottom: '1.2rem', fontWeight: '700' }}>تواصل معنا</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <li>📍 القاهرة، جمهورية مصر العربية</li>
                    <li>📧 {storeSettings.email}</li>
                    <li>📞 {storeSettings.phone}</li>
                    <li style={{ marginTop: '0.8rem', display: 'flex', gap: '0.75rem' }}>
                      <a
                        href={storeSettings.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="فيسبوك"
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1877F2';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                      <a
                        href={storeSettings.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="انستغرام"
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E1306C';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                      <a
                        href={storeSettings.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="تيك توك"
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.05 1.72 4.13 1.12 1.09 2.66 1.62 4.2 1.65v3.91c-1.28-.02-2.54-.37-3.64-1.04-.63-.38-1.18-.89-1.61-1.5-.04 2.82.04 5.64-.02 8.46-.07 1.83-.75 3.65-2.03 4.96-1.57 1.58-3.9 2.45-6.14 2.19-2.6-.29-4.88-2.22-5.46-4.78-.71-2.94.75-6.22 3.48-7.39.81-.35 1.7-.51 2.58-.48v3.95c-.75-.12-1.55.12-2.08.68-.69.69-.76 1.87-.14 2.64.53.68 1.48.97 2.29.62.63-.26 1.05-.88 1.09-1.56.09-3.72.03-7.44.06-11.16-.01-.39.02-.79.03-1.18z" />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: 'var(--secondary)', marginBottom: '1.2rem', fontWeight: '700' }}>انضم لعائلة البط</h4>
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
                جميع الحقوق محفوظة © {new Date().getFullYear()} لمتجر البط. صنع بكل 💛 لتسهيل تسوقك.
              </div>
            </footer>

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

            <WishlistDrawer
              isOpen={isWishlistOpen}
              onClose={() => setIsWishlistOpen(false)}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onQuickAddToCart={handleQuickAddToCart}
            />

            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => {
                setIsCheckoutOpen(false);
                setBuyNowItem(null);
              }}
              cartItems={buyNowItem ? [buyNowItem] : cartItems}
            />

            <Toast toasts={toasts} onClose={removeToast} />
            <WhatsAppButton />
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
