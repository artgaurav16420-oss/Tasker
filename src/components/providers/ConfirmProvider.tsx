import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmContextValue {
  showConfirm: (opts: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.showConfirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmOptions & { isOpen: boolean }>({
    isOpen: false, title: '', message: '', confirmText: 'Confirm', danger: false, onConfirm: () => {},
  });
  const [isConfirming, setIsConfirming] = useState(false);
  const reducedMotion = useReducedMotion();

  const showConfirm = useCallback((opts: ConfirmOptions) => {
    setDialog({ isOpen: true, confirmText: 'Confirm', danger: false, ...opts });
  }, []);

  const close = useCallback(() => {
    setDialog((p) => ({ ...p, isOpen: false }));
  }, []);

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <AnimatePresence>
        {dialog.isOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-8"
            onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              onClick={close}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.95 }}
              animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-message"
              className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl p-10 flex flex-col rounded-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
              <h3 id="confirm-dialog-title" className="font-mono font-black uppercase tracking-[0.3em] text-slate-900 dark:text-slate-100 mb-8 text-base border-b border-slate-50 dark:border-slate-700 pb-6 text-center">{dialog.title}</h3>
              <p id="confirm-dialog-message" className="font-mono text-base text-slate-500 dark:text-slate-400 mb-12 leading-relaxed text-center">"{dialog.message}"</p>
              <div className="flex gap-6">
                <button
                  autoFocus
                  onClick={close}
                  className="flex-1 py-4 font-mono text-xs uppercase tracking-[0.2em] text-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all duration-150 rounded-xl font-black shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  Abort
                </button>
                <button
                  onClick={async () => {
                    if (isConfirming) return;
                    setIsConfirming(true);
                    try {
                      await Promise.resolve(dialog.onConfirm());
                    } catch (err) {
                      console.error('Confirm dialog error:', err);
                    } finally {
                      setIsConfirming(false);
                    }
                  }}
                  disabled={isConfirming}
                  className={`flex-1 py-4 font-mono text-xs uppercase tracking-[0.2em] text-center font-black transition-all duration-150 rounded-xl shadow-xl flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''} ${dialog.danger ? "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100 shadow-orange-500/5" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20"}`}
                >
                  {isConfirming ? (
                    <motion.div
                      animate={reducedMotion ? undefined : { rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full"
                    />
                  ) : dialog.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
