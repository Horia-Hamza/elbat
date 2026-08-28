import React, { useState, useEffect } from 'react';
import { ordersApi } from '../../api/orders';
import { IMAGES_BASE_URL } from '../../api/client';
import { Eye, Clock, ShieldCheck, Truck, XCircle, Search, RefreshCw, AlertCircle } from 'lucide-react';

interface OrderDetail {
  id: number;
  orderNumber: string;
  userId: string;
  customerName: string | null;
  status: number;
  paymentStatus: number;
  subTotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  trackingNumber: string | null;
  createdAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  items: any[];
}

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = async (order: OrderDetail) => {
    setSelectedOrder(order);
    setOrderDetails(null);
    setDetailsLoading(true);
    try {
      const details = await ordersApi.getOrderDetails(order.id);
      setOrderDetails(details);
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Status mapping functions
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="admin-badge neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> قيد الانتظار</span>;
      case 2:
        return <span className="admin-badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e3f2fd', color: '#1e88e5' }}><Truck size={12} /> تم الشحن</span>;
      case 3:
        return <span className="admin-badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12} /> تم التوصيل</span>;
      case 4:
        return <span className="admin-badge danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> ملغي</span>;
      default:
        return <span className="admin-badge neutral">غير معروف</span>;
    }
  };

  const getPaymentStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span style={{ color: '#f57c00', background: '#fff3e0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>قيد الانتظار</span>;
      case 2:
        return <span style={{ color: '#388e3c', background: '#e8f5e9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>ناجح</span>;
      case 3:
        return <span style={{ color: '#d32f2f', background: '#ffebee', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>فاشل</span>;
      case 4:
        return <span style={{ color: '#757575', background: '#eeeeee', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>ملغي</span>;
      case 5:
        return <span style={{ color: '#0288d1', background: '#e1f5fe', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>مسترجع</span>;
      default:
        return <span style={{ color: '#757575', background: '#eeeeee', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>غير معروف</span>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      order.status.toString() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ color: 'var(--admin-text-main)', margin: 0 }}>إدارة الطلبات والمبيعات</h3>
        <button className="admin-btn outline" onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={16} /> تحديث القائمة
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="ابحث برقم الطلب أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 2.5rem 0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--admin-border)',
              backgroundColor: 'var(--admin-bg-dark)',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--admin-border)',
            backgroundColor: 'var(--admin-bg-dark)',
            color: 'white',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">كل الحالات</option>
          <option value="1">قيد الانتظار</option>
          <option value="2">تم الشحن</option>
          <option value="3">تم التوصيل</option>
          <option value="4">ملغي</option>
        </select>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244,67,54,0.1)', border: '1px solid var(--admin-danger)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', color: 'var(--admin-danger)', fontSize: '0.88rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#ID</th>
              <th>رقم الطلب</th>
              <th>التاريخ</th>
              <th>العميل</th>
              <th>المجموع الفرعي</th>
              <th>رسوم الشحن</th>
              <th>الإجمالي</th>
              <th>حالة الدفع</th>
              <th>حالة الطلب</th>
              <th>تفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '3rem' }}>جاري التحميل...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                  لم يتم العثور على أي طلبات.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700, color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>#{order.id}</td>
                  <td style={{ fontWeight: 700, color: 'var(--admin-primary)', direction: 'ltr' }}>{order.orderNumber}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td>{order.customerName || <span style={{ color: 'var(--admin-text-muted)' }}>—</span>}</td>
                  <td>{order.subTotal.toLocaleString()} ج.م</td>
                  <td>{order.shippingCost > 0 ? `${order.shippingCost} ج.م` : 'مجاني'}</td>
                  <td style={{ fontWeight: 'bold' }}>{order.totalAmount.toLocaleString()} ج.م</td>
                  <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <button 
                      className="admin-icon-btn" 
                      title="عرض التفاصيل" 
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: 'var(--admin-bg-panel)', borderRadius: '14px',
            width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>تفاصيل الطلب #{selectedOrder.id}</h3>
              <button className="admin-icon-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white' }}>
              <div style={{ background: 'var(--admin-bg-dark)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 0.5rem' }}><strong>رقم الطلب:</strong> {selectedOrder.orderNumber}</p>
                <p style={{ margin: '0 0 0.5rem' }}><strong>العميل:</strong> {selectedOrder.customerName || 'غير معروف'}</p>
                <p style={{ margin: '0 0 0.5rem' }}><strong>تاريخ الإنشاء:</strong> {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}</p>
                <p style={{ margin: 0 }}><strong>رقم التتبع:</strong> {selectedOrder.trackingNumber || 'غير متوفر'}</p>
              </div>

              <div style={{ background: 'var(--admin-bg-dark)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.8rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.4rem' }}>المنتجات المطلوبة</h4>
                {detailsLoading ? (
                  <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--admin-text-muted)' }}>
                    جاري تحميل تفاصيل المنتجات...
                  </div>
                ) : orderDetails && orderDetails.items && orderDetails.items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orderDetails.items.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '75%' }}>
                          {item.productImageUrl ? (
                            <img 
                              src={item.productImageUrl.startsWith('http') ? item.productImageUrl : `${IMAGES_BASE_URL}${item.productImageUrl}`} 
                              alt={item.productName} 
                              style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', backgroundColor: 'var(--admin-bg-light)' }} 
                            />
                          ) : (
                            <div style={{ width: '42px', height: '42px', borderRadius: '6px', backgroundColor: 'var(--admin-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                              📦
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 600 }}>
                              {item.productName}
                            </span>
                            {item.variantName && (
                              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                                ({item.variantName})
                              </span>
                            )}
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                              سعر الوحدة: {item.unitPrice} ج.م | الكمية: <span style={{ color: 'var(--admin-primary)', fontWeight: 700 }}>x{item.quantity}</span>
                            </span>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: 'white' }}>{item.totalPrice.toLocaleString()} ج.م</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.88rem' }}>
                    لا توجد منتجات مسجلة في هذا الطلب.
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--admin-bg-dark)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.8rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.4rem' }}>الملخص المالي</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>المجموع الفرعي:</span>
                  <span>{selectedOrder.subTotal.toLocaleString()} ج.م</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>تكلفة الشحن:</span>
                  <span>{selectedOrder.shippingCost > 0 ? `${selectedOrder.shippingCost.toLocaleString()} ج.م` : 'مجاني'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>الخصم الكوبون:</span>
                  <span style={{ color: 'var(--admin-danger)' }}>-{selectedOrder.discountAmount.toLocaleString()} ج.م</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px dashed var(--admin-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span>المبلغ الإجمالي:</span>
                  <span style={{ color: 'var(--admin-primary)' }}>{selectedOrder.totalAmount.toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="admin-btn" onClick={() => setSelectedOrder(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
