'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export interface Toast {
  id: number;
  message: string;
  tone: 'default' | 'danger';
}

// Module-level pub/sub so non-React code (React Query's MutationCache) can emit toasts.
type Listener = (message: string, tone?: Toast['tone']) => void;
let listener: Listener | null = null;
export function pushToast(message: string, tone: Toast['tone'] = 'default') {
  listener?.(message, tone);
}

const ToastContext = createContext<(m: string, tone?: Toast['tone']) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, tone: Toast['tone'] = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);

  // Bridge the module emitter to this provider while mounted.
  useEffect(() => {
    listener = (m, tone) => add(m, tone);
    return () => {
      listener = null;
    };
  }, [add]);

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-fade-up rounded-md border bg-ink-850 px-4 py-2 text-sm shadow-e2"
            style={{
              borderColor: t.tone === 'danger' ? 'rgba(242,106,79,0.5)' : 'var(--border)',
              color: t.tone === 'danger' ? '#F26A4F' : 'var(--text)',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
