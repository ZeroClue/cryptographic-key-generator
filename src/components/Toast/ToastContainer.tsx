import React from 'react';
import { Toast } from '../../hooks/useToast';

export const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  const typeStyles = {
    success: 'bg-green-600 border-green-500',
    info: 'bg-blue-600 border-blue-500',
    warning: 'bg-yellow-600 border-yellow-500',
    error: 'bg-red-600 border-red-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border text-white transform transition-all duration-300 ${typeStyles[toast.type]}`}
          role="alert"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close toast"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
