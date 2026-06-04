import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import type { Product } from '../data/products';

export interface CartItem {
  id: string; // المعرف الفريد متضمناً اللون والمقاس
  product: Product;
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
  // حساب المجموع الفرعي
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 5000 || subtotal === 0 ? 0 : 250; // شحن دولي مجاني لأكثر من 5000 جنيه
  const total = subtotal + shippingFee;

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
                    src={item.product.image}
                    alt={item.product.title}
                    className="cart-item-img"
                  />
                </div>

                {/* تفاصيل العنصر */}
                <div className="cart-item-details">
                  <div>
                    <h4 className="cart-item-title">{item.product.title}</h4>
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
                      {item.product.price * item.quantity} ج.م
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
              <span>{subtotal} ج.م</span>
            </div>
            <div className="summary-row">
              <span>تكلفة الشحن الدولي:</span>
              <span>{shippingFee === 0 ? 'مجاني' : `${shippingFee} ج.م`}</span>
            </div>
            {shippingFee > 0 && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textAlign: 'center' }}>
                أضف بقيمة {5000 - subtotal} ج.م إضافية للحصول على شحن دولي مجاني وتخليص جمركي مجاني! ✈️
              </p>
            )}
            <div className="summary-row total">
              <span>المجموع الإجمالي:</span>
              <span>{total} ج.م</span>
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
