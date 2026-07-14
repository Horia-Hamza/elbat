import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../../api/payments';
import { RefreshCw, CreditCard, AlertCircle, ChevronRight, ChevronLeft, Eye } from 'lucide-react';

interface PaymentItem {
  id: number;
  orderId: number;
  paymobOrderId: string | null;
  paymobTransactionId: string | null;
  amount: number;
  currency: string;
  method: string;
  status: string;
  isRefunded: boolean;
  refundedAmount: number | null;
  refundedAt: string | null;
  createdAt: string;
}

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Method Filter
  const [methodFilter, setMethodFilter] = useState<'all' | 'CashOnDelivery' | 'online'>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Selected Order / Payment details modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentItem | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentsApi.getPaymentsByStatus(page, pageSize);
      if (response) {
        setPayments(response.items || []);
        setTotalCount(response.totalCount || 0);
        setTotalPages(response.totalPages || 1);
        setHasNext(response.hasNextPage || false);
        setHasPrev(response.hasPreviousPage || false);
      }
    } catch (err: any) {
      console.error('Failed to fetch payments:', err);
      setError(err.message || 'فشل تحميل العمليات المالية.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, pageSize]);

  // Fetch latest payment details for an order
  const handleViewOrderDetails = async (orderId: number) => {
    setSelectedOrderId(orderId);
    setPaymentDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);
    try {
      const response = await paymentsApi.getLatestPaymentByOrderId(orderId);
      if (response) {
        setPaymentDetails(response);
      } else {
        setDetailsError('لم يتم العثور على بيانات الدفع لهذا الطلب.');
      }
    } catch (err: any) {
      console.error('Failed to fetch latest payment details:', err);
      setDetailsError(err.message || 'فشل جلب تفاصيل عملية الدفع.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Approve manual payment
  const handleApprovePayment = async (orderId: number) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في الموافقة على الدفع وتأكيد الطلب؟')) return;
    setApproveLoading(true);
    setDetailsError(null);
    try {
      const response = await paymentsApi.approveManualPayment(orderId);
      if (response) {
        // Reload details & refresh parent table list
        await handleViewOrderDetails(orderId);
        fetchPayments();
      }
    } catch (err: any) {
      console.error('Failed to approve manual payment:', err);
      setDetailsError(err.message || 'فشل الموافقة على الدفع اليدوي.');
    } finally {
      setApproveLoading(false);
    }
  };

  // Method displays & badges
  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'CreditCard':
        return '💳 بطاقة ائتمان';
      case 'DebitCard':
        return '💳 بطاقة خصم مباشر';
      case 'MobileWallet':
        return '📱 محفظة جوال';
      case 'CashOnDelivery':
        return '💵 دفع عند الاستلام';
      case 'BankTransfer':
        return '🏦 تحويل بنكي';
      default:
        return method;
    }
  };

  // Status badges matching payment statuses
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <span style={{ color: '#388e3c', background: '#e8f5e9', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>ناجح</span>;
      case 'Pending':
        return <span style={{ color: '#f57c00', background: '#fff3e0', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>قيد الانتظار</span>;
      case 'AwaitingManualReview':
        return <span style={{ color: '#0288d1', background: '#e1f5fe', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>مراجعة يدوية</span>;
      case 'Failed':
        return <span style={{ color: '#d32f2f', background: '#ffebee', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>فاشل</span>;
      case 'Cancelled':
        return <span style={{ color: '#757575', background: '#eeeeee', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>ملغي</span>;
      default:
        return <span style={{ color: '#757575', background: '#eeeeee', padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>{status}</span>;
    }
  };

  // Filter payments by selected method client-side
  const filteredPayments = payments.filter((p) => {
    if (methodFilter === 'all') return true;
    if (methodFilter === 'CashOnDelivery') return p.method === 'CashOnDelivery';
    return p.method !== 'CashOnDelivery'; // online
  });

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ color: 'var(--admin-text-main)', margin: 0 }}>إدارة العمليات المالية والمدفوعات</h3>
        <button className="admin-btn outline" onClick={fetchPayments} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={16} /> تحديث القائمة
        </button>
      </div>

      {/* Filter and settings bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>طريقة الدفع:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--admin-border)',
              backgroundColor: 'var(--admin-bg-dark)',
              color: 'white',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">كل طرق الدفع</option>
            <option value="CashOnDelivery">💵 دفع عند الاستلام (CashOnDelivery)</option>
            <option value="online">💳 الدفع الإلكتروني (Online Payments)</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244,67,54,0.1)', border: '1px solid var(--admin-danger)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', color: 'var(--admin-danger)', fontSize: '0.88rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table listing */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>رقم المعاملة</th>
              <th>رقم الطلب (سيرفر)</th>
              <th>رقم طلب Paymob</th>
              <th>رقم العملية Paymob</th>
              <th>طريقة الدفع</th>
              <th>القيمة المالية</th>
              <th>حالة العملية</th>
              <th>تاريخ الإنشاء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>جاري تحميل المعاملات...</td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                  لا توجد عمليات مالية مطابقة للفلتر المحدد.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => handleViewOrderDetails(p.orderId)} 
                  style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                  className="admin-table-row-hoverable"
                >
                  <td style={{ fontWeight: 700, color: 'var(--admin-primary)' }}>#{p.id}</td>
                  <td style={{ fontWeight: 700 }}>
                    <button 
                      style={{ 
                        background: 'none', border: 'none', color: 'var(--admin-primary)', 
                        fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: 0 
                      }}
                    >
                      #{p.orderId}
                    </button>
                  </td>
                  <td style={{ direction: 'ltr', color: 'var(--admin-text-muted)' }}>{p.paymobOrderId || '—'}</td>
                  <td style={{ direction: 'ltr', color: 'var(--admin-text-muted)' }}>{p.paymobTransactionId || '—'}</td>
                  <td>{getMethodLabel(p.method)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--admin-primary)' }}>{p.amount.toLocaleString()} {p.currency}</td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td>{new Date(p.createdAt).toLocaleString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <button 
                      className="admin-icon-btn" 
                      title="تفاصيل الدفع"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrderDetails(p.orderId);
                      }}
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

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
        <div style={{ fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
          إجمالي العمليات: <strong>{totalCount}</strong> | الصفحة <strong>{page}</strong> من <strong>{totalPages}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="admin-btn outline"
            disabled={!hasPrev || loading}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronRight size={16} /> السابق
          </button>
          
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--admin-border)',
              backgroundColor: 'var(--admin-bg-dark)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <option value={10}>10 صفوف</option>
            <option value={20}>20 صفوف</option>
            <option value={50}>50 صفوف</option>
          </select>

          <button
            className="admin-btn outline"
            disabled={!hasNext || loading}
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            التالي <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrderId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: 'var(--admin-bg-panel)', borderRadius: '14px',
            width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '2rem',
            border: '1px solid var(--admin-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'white' }}>تفاصيل حركة الدفع للطلب #{selectedOrderId}</h3>
              <button 
                style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '1.5rem', cursor: 'pointer' }}
                onClick={() => setSelectedOrderId(null)}
              >
                &times;
              </button>
            </div>

            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                جاري تحميل تفاصيل المعاملة من السيرفر...
              </div>
            ) : detailsError ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244,67,54,0.1)', border: '1px solid var(--admin-danger)', borderRadius: '8px', padding: '1rem', color: 'var(--admin-danger)' }}>
                <AlertCircle size={16} /> {detailsError}
              </div>
            ) : paymentDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white' }}>
                <div style={{ background: 'var(--admin-bg-dark)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: 'var(--admin-text-muted)', display: 'block', marginBottom: '4px' }}>رقم المعاملة (السيرفر):</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--admin-primary)' }}>#{paymentDetails.id}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--admin-text-muted)', display: 'block', marginBottom: '4px' }}>رقم الطلب (سيرفر):</span>
                      <strong style={{ fontSize: '1.05rem' }}>#{paymentDetails.orderId}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--admin-bg-dark)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>رقم طلب Paymob:</span>
                    <span style={{ direction: 'ltr', fontWeight: 600 }}>{paymentDetails.paymobOrderId || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>رقم عملية Paymob:</span>
                    <span style={{ direction: 'ltr', fontWeight: 600 }}>{paymentDetails.paymobTransactionId || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>طريقة الدفع:</span>
                    <span style={{ fontWeight: 600 }}>{getMethodLabel(paymentDetails.method)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>القيمة الإجمالية:</span>
                    <strong style={{ color: 'var(--admin-primary)', fontSize: '1rem' }}>{paymentDetails.amount.toLocaleString()} {paymentDetails.currency}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>حالة المعاملة:</span>
                    <span>{getStatusBadge(paymentDetails.status)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>تاريخ المعاملة:</span>
                    <span>{new Date(paymentDetails.createdAt).toLocaleString('ar-EG')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>حالة الاسترجاع:</span>
                    <span>
                      {paymentDetails.isRefunded ? (
                        <span style={{ color: 'var(--admin-danger)', fontWeight: 600 }}>
                          🔄 تم الاسترجاع ({paymentDetails.refundedAmount} {paymentDetails.currency})
                        </span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                لا توجد تفاصيل لعرضها.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              {paymentDetails && paymentDetails.status === 'AwaitingManualReview' && (
                <button
                  className="admin-btn"
                  disabled={approveLoading}
                  onClick={() => handleApprovePayment(paymentDetails.orderId)}
                  style={{
                    backgroundColor: '#2e7d32',
                    borderColor: '#2e7d32',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {approveLoading ? 'جاري الموافقة...' : '✅ موافقة وتأكيد الدفع'}
                </button>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginRight: 'auto' }}>
                <button 
                  className="admin-btn outline" 
                  onClick={() => handleViewOrderDetails(selectedOrderId!)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={14} /> تحديث
                </button>
                <button className="admin-btn" onClick={() => setSelectedOrderId(null)}>إغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPayments;
