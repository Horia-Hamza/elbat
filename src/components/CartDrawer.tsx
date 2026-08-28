import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import type { ApiProduct } from '../types/api';
import { IMAGES_BASE_URL } from '../api/client';

export interface CartItem {
  id: string; // المعرف الفريد متضمناً اللون والمقاس
  product: ApiProduct;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckoutOpen: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutOpen
}) => {
  const getProductImage = (p: ApiProduct) => {
    if (p.mainImageUrl) {
      return p.mainImageUrl.startsWith('http') ? p.mainImageUrl : `${IMAGES_BASE_URL}${p.mainImageUrl}`;
    }
    if (p.images && p.images.length > 0) {
      const u = p.images[0].imageUrl || p.images[0].url || '';
      return u ? (u.startsWith('http') ? u : `${IMAGES_BASE_URL}${u}`) : '/logo.png';
    }
    return '/logo.png';
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const multiItemDiscount = totalQuantity >= 2 ? 150 : 0;
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.salePrice || item.product.basePrice) * item.quantity, 0);
  const total = Math.max(0, subtotal - multiItemDiscount);

  return (
    <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* ترويسة السلة */}
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={22} style={{ marginLeft: '8px' }} />
            سلة المشتريات
          </div>
          <button className="close-btn" onClick={onClose} title="إغلاق">
            <X size={20} />
          </button>
        </div>

        {/* جسم السلة */}
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <img
                src="/logo.png"
                alt="بطة السلة فارغة"
                className="empty-duck-img"
              />
              <h3>سلتك فارغة حالياً!</h3>
              <p style={{ fontSize: '0.85rem' }}>
                البطة الصفراء بانتظار أن تملأ سلتك بأفضل ألعاب الاستحمام والمستلزمات الرائعة.
              </p>
              <button 
                className="btn-secondary" 
                onClick={onClose} 
                style={{ marginTop: '0.5rem', padding: '0.6rem 1.8rem' }}
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                {/* صورة المنتج */}
                <div className="cart-item-img-wrapper">
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    className="cart-item-img"
                  />
                </div>

                {/* تفاصيل العنصر */}
                <div className="cart-item-details">
                  <div>
                    <h4 className="cart-item-title">{item.product.name}</h4>
                    <span className="cart-item-meta">
                      {item.color && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '10px' }}>
                          اللون: 
                          <span 
                            style={{ 
                              display: 'inline-block', 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              backgroundColor: item.color,
                              border: '1px solid #ccc'
                            }} 
                          />
                        </span>
                      )}
                      {item.size && <span>المقاس: {item.size}</span>}
                    </span>
                  </div>

                  <div className="cart-item-actions">
                    {/* تعديل الكمية */}
                    <div className="qty-selector">
                      <button 
                        className="qty-btn" 
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="cart-item-price">
                      {(item.product.salePrice || item.product.basePrice) * item.quantity} ج.م
                    </span>

                    {/* زر الحذف */}
                    <button 
                      className="item-delete-btn" 
                      onClick={() => onRemoveItem(item.id)}
                      title="حذف العنصر"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ذيل السلة */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="summary-row">
              <span>المجموع الفرعي:</span>
              <span>{subtotal.toLocaleString()} ج.م</span>
            </div>
            {multiItemDiscount > 0 ? (
              <div className="summary-row" style={{ color: '#2E7D32', fontWeight: 700 }}>
                <span>خصم قطعتين أو أكثر:</span>
                <span>-150 ج.م</span>
              </div>
            ) : totalQuantity === 1 ? (
              <p style={{ fontSize: '0.75rem', color: '#F57F17', margin: '0.4rem 0', textAlign: 'center', background: '#FFF8E1', padding: '5px 8px', borderRadius: '6px', fontWeight: 600 }}>
                💡 أضف قطعة أخرى لسلتك للحصول على خصم 150 ج.م فوري!
              </p>
            ) : null}
            <div className="summary-row total">
              <span>المجموع الإجمالي:</span>
              <span>{total.toLocaleString()} ج.م</span>
            </div>

            <button className="checkout-btn" onClick={onCheckoutOpen}>
              <CreditCard size={20} />
              الذهاب إلى الدفع والتأكيد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
