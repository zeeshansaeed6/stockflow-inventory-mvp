/**
 * Minimal toast system.
 * - useToast() returns show({ type, title, message }).
 * - Toasts auto-dismiss after 4s; can be closed manually.
 */

import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

const STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-100',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-100',
  info: 'bg-brand-50 border-brand-100 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500 dark:text-brand-100',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ type = 'info', title, message }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`border rounded-lg shadow-sm p-3 text-sm ${STYLES[t.type]}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                {t.title && <div className="font-semibold">{t.title}</div>}
                {t.message && <div className="opacity-90">{t.message}</div>}
              </div>
              <button
                className="opacity-60 hover:opacity-100"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
