import { useState, useCallback, useRef, useEffect, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.showToast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastQueue, setToastQueue] = useState<Toast[]>([]);
  const toastTimersRef = useRef<Map<number, number>>(new Map());
  const toastIdRef = useRef(0);
  const reducedMotion = useReducedMotion();

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++toastIdRef.current;
    setToastQueue((prev) => [...prev, { id, message: msg, type }]);
    const timer = window.setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
      toastTimersRef.current.delete(id);
    }, type === 'error' ? 6000 : 3000);
    toastTimersRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach(clearTimeout);
      toastTimersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toastQueue[0] && (
          <motion.div
            key={toastQueue[0].id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.12 } }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
            role="status"
            aria-live="polite"
            className={`fixed bottom-10 right-10 z-[120] font-mono text-xs uppercase tracking-[0.25em] font-black px-10 py-5 border rounded-xl shadow-xl ${
              toastQueue[0].type === 'error' ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/20' :
              toastQueue[0].type === 'success' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20' :
              'bg-slate-800 dark:bg-slate-900 text-white border-slate-700 shadow-slate-500/20'
            }`}
          >
            {toastQueue[0].message}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
