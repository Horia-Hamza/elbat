import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div className={`toast-item ${toast.type === 'success' ? 'success' : 'error'}`}>
      {toast.type === 'success' ? (
        <CheckCircle2 className="toast-icon" size={20} />
      ) : (
        <AlertCircle className="toast-icon" size={20} />
      )}
      <span>{toast.message}</span>
      <button 
        onClick={() => onClose(toast.id)} 
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <X size={16} style={{ marginRight: '8px' }} />
      </button>
    </div>
  );
};
