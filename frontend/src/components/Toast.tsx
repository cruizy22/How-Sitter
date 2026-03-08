import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  title?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    
    setToasts(prev => {
      // Limit to 5 toasts at a time
      const updated = [newToast, ...prev].slice(0, 5);
      return updated;
    });
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const getToastConfig = (type: string) => {
    const configs = {
      success: {
        bg: 'bg-gradient-to-r from-green-500 to-green-600',
        icon: 'fa-check-circle',
        border: 'border-green-200',
        title: 'Success',
      },
      error: {
        bg: 'bg-gradient-to-r from-red-500 to-red-600',
        icon: 'fa-exclamation-circle',
        border: 'border-red-200',
        title: 'Error',
      },
      info: {
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
        icon: 'fa-info-circle',
        border: 'border-blue-200',
        title: 'Info',
      },
      warning: {
        bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        icon: 'fa-exclamation-triangle',
        border: 'border-yellow-200',
        title: 'Warning',
      }
    };
    return configs[type as keyof typeof configs] || configs.info;
  };

  const config = getToastConfig(toast.type);

  return (
    <div className={`${config.bg} text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm transform transition-all duration-300 animate-fadeInUp border ${config.border}`}>
      <div className="flex items-start">
        <i className={`fas ${config.icon} text-xl mr-3 mt-0.5`}></i>
        <div className="flex-1">
          <p className="font-bold text-sm">{toast.title || config.title}</p>
          <p className="text-sm opacity-95 mt-1">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white/80 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      {/* Progress bar */}
      {toast.duration !== 0 && (
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/50 rounded-full animate-toast-progress"></div>
        </div>
      )}
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Helper functions for common toast types
export const toastSuccess = (message: string, title?: string) => {
  const toast = useToast();
  toast.addToast({
    type: 'success',
    message,
    title: title || 'How Sitter Success',
  });
};

export const toastError = (message: string, title?: string) => {
  const toast = useToast();
  toast.addToast({
    type: 'error',
    message,
    title: title || 'How Sitter Error',
  });
};

export const toastInfo = (message: string, title?: string) => {
  const toast = useToast();
  toast.addToast({
    type: 'info',
    message,
    title: title || 'How Sitter Info',
  });
};

export const toastWarning = (message: string, title?: string) => {
  const toast = useToast();
  toast.addToast({
    type: 'warning',
    message,
    title: title || 'How Sitter Warning',
  });
};

// Specific How Sitter toast functions
export const toastDiscoveryComplete = () => {
  toastSuccess('Discovery process completed! You can now accept house sitting arrangements.', 'Discovery Verified');
};

export const toastArrangementCreated = () => {
  toastSuccess('House sitting arrangement created successfully! Check your WhatsApp for next steps.', 'Arrangement Created');
};

export const toastPaymentProcessed = () => {
  toastSuccess('Payment processed via PayPal. Check your email for the receipt.', 'Payment Successful');
};

export const toastAgreementSigned = () => {
  toastSuccess('Electronic agreement signed. The arrangement is now active!', 'Agreement Signed');
};