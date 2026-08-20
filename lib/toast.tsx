'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { X } from 'lucide-react';

type Toast = { id: number; message: string; type?: 'success' | 'error' };

type ToastContext = { toast: (message: string, type?: 'success' | 'error') => void };

const ToastContext = createContext<ToastContext | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-stack">
        {toasts.map((item) => (
          <div key={item.id} className={`toast ${item.type ?? 'success'}`}>
            <span>{item.message}</span>
            <button onClick={() => setToasts((current) => current.filter((t) => t.id !== item.id))} aria-label="Dismiss"><X size={15} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
