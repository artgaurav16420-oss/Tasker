import { useState } from "react";
import { X, Target, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NewPersonalTaskForm } from "../../lib/types";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  newPersonalTask: NewPersonalTaskForm;
  setNewPersonalTask: (task: NewPersonalTaskForm) => void;
  handleCreatePersonalTask: (e: React.FormEvent) => Promise<void>;
}

export default function NewPersonalTaskModal({
  isOpen,
  onClose,
  newPersonalTask,
  setNewPersonalTask,
  handleCreatePersonalTask,
}: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const reducedMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />
            <motion.div
            initial={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.95 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="personal-task-title-heading"
            className="relative w-full max-w-2xl bg-white border border-slate-100 shadow-2xl p-6 sm:p-10 flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Self-Assigned</h3>
                <h2 id="personal-task-title-heading" className="font-serif text-xl text-slate-900 tracking-tight pr-8">New Personal Objective</h2>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-3 rounded-full transition-all"
                aria-label="Close new personal objective modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              if (isCreating) return;
              setIsCreating(true);
              try {
                await handleCreatePersonalTask(e);
              } finally {
                setIsCreating(false);
              }
            }} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="personal-task-title" className="text-xs font-mono font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Objective Title</label>
                <div className="relative group">
                  <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="personal-task-title"
                    type="text"
                    required
                    value={newPersonalTask.title}
                    onChange={(e) => setNewPersonalTask({ ...newPersonalTask, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 pl-16 pr-6 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-serif text-base"
                    placeholder="E.g., Complete security review"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="personal-task-deadline" className="text-xs font-mono font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Deadline (Optional)</label>
                <div className="relative group">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="personal-task-deadline"
                    type="datetime-local"
                    value={newPersonalTask.timelineEnd}
                    onChange={(e) => setNewPersonalTask({ ...newPersonalTask, timelineEnd: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 pl-16 pr-6 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-[0.2em] py-5 px-8 hover:bg-emerald-400 transition-all rounded-2xl shadow-xl shadow-emerald-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center gap-3"
                >
                  {isCreating ? (
                    <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
                  ) : (
                    'Initiate Objective'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
