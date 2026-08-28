'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastContextType {
  showToast: (title: string, options?: { message?: string; type?: 'success' | 'info' | 'error' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (title: string, options?: { message?: string; type?: 'success' | 'info' | 'error' }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        title,
        message: options?.message,
        type: options?.type || 'info',
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast floating container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white border border-border-strong rounded-lg shadow-lg text-text-primary transition-all duration-200"
            role="status"
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-error" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-accent" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary leading-5">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-text-secondary mt-0.5 leading-normal">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 text-text-muted hover:text-text-primary rounded focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
