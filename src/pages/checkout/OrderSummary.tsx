import React from 'react';
import { Tag } from 'lucide-react';
import type { SelectedPajama } from './types';
import type { ShippingZone } from '../../api/shippingZones';
import { BUNDLE_PRICE, BUNDLE_ORIGINAL_PRICE } from '../../data/pajamas';

interface OrderSummaryProps {
  selectedPajamas: (SelectedPajama | null)[];
  selectedZone: ShippingZone | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ selectedPajamas, selectedZone }) => {
  const filledSlots = selectedPajamas.filter(Boolean) as SelectedPajama[];
  const savings = BUNDLE_ORIGINAL_PRICE - BUNDLE_PRICE;

  // Compute shipping cost from selected zone
  const shippingCost = selectedZone
    ? selectedZone.freeShippingThreshold != null &&
      BUNDLE_PRICE >= selectedZone.freeShippingThreshold
      ? 0
      : selectedZone.cost
    : null; // null = not yet chosen

  const total = BUNDLE_PRICE + (shippingCost ?? 0);

  return (
    <section className="order-summary-section" id="order-summary">
      <h2 className="section-heading">ملخص الطلب</h2>

      {/* Selected items list */}
      <div className="order-items-list">
        {filledSlots.length === 0 ? (
          <div className="order-empty-state">
            <span>لسه ماختارتيش بجامات</span>
          </div>
        ) : (
          filledSlots.map((item, i) => (
            <div key={i} className="order-item">
              <div className="order-item-img-wrap">
                <img src={item.image} alt={item.name} className="order-item-img" />
                <div
                  className="order-item-color-dot"
                  style={{ backgroundColor: item.colorHex }}
                  title={item.color}
                />
              </div>
              <div className="order-item-details">
                <span className="order-item-name">{item.name}</span>
                <div className="order-item-meta">
                  <span className="order-item-tag">
                    <Tag size={11} />
                    {item.color}
                  </span>
                  <span className="order-item-tag">مقاس {item.size}</span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Empty slots placeholder */}
        {Array.from({ length: 3 - filledSlots.length }).map((_, i) => (
          <div key={`empty-${i}`} className="order-item order-item-placeholder">
            <div className="order-item-img-wrap placeholder-img" />
            <div className="order-item-details">
              <span className="order-item-name placeholder-text">
                بجامة {filledSlots.length + i + 1}
              </span>
              <span className="order-item-tag">لم يتم الاختيار بعد</span>
            </div>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="order-price-breakdown">
        <div className="price-row">
          <span>السعر الأصلي</span>
          <span className="original-price-strikethrough">
            {BUNDLE_ORIGINAL_PRICE.toLocaleString()} EGP
          </span>
        </div>
        <div className="price-row saving-row">
          <span>💰 توفير</span>
          <span className="saving-amount">− {savings.toLocaleString()} EGP</span>
        </div>
        <div className="price-row">
          <span>الشحن</span>
          {shippingCost === null ? (
            <span className="shipping-pending">اختار المحافظة</span>
          ) : shippingCost === 0 ? (
            <span className="free-shipping">مجاني 🎉</span>
          ) : (
            <span>{shippingCost.toLocaleString()} EGP</span>
          )}
        </div>

        <div className="price-divider" />

        <div className="price-row total-row">
          <span>الإجمالي</span>
          <div className="total-price-block">
            <span className="total-price">{total.toLocaleString()}</span>
            <span className="total-currency">EGP</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSummary;
