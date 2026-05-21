import { useMemo } from "react";
import { Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PersonalTask } from "../../lib/types";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  personalTasks: PersonalTask[];
  setIsPersonalTaskModalOpen: (isOpen: boolean) => void;
  handleTogglePersonalTask: (taskId: string, currentStatus: PersonalTask['status']) => Promise<void>;
  handleDeletePersonalTask: (id: string) => void;
}

export default function PersonalTasksList({
  personalTasks,
  setIsPersonalTaskModalOpen,
  handleTogglePersonalTask,
  handleDeletePersonalTask,
}: Props) {
  const reducedMotion = useReducedMotion();
  const activeTasks = useMemo(() => personalTasks.filter(t => t.status !== 'completed'), [personalTasks]);
  const completedTasks = useMemo(() => personalTasks.filter(t => t.status === 'completed'), [personalTasks]);

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-700 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
            <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Self-Assigned</h2>
          </div>
          <h2 className="font-serif text-2xl text-slate-900 dark:text-slate-100 tracking-tight -tracking-[0.025em]">
            My Tasks
          </h2>
        </div>
        <button
          onClick={() => setIsPersonalTaskModalOpen(true)}
          className="bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-[0.2em] px-8 py-4 flex items-center gap-3 hover:bg-emerald-400 transition-all rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Task
        </button>
      </div>

      <div className="space-y-8">
        <h3 className="font-serif text-xl text-slate-900 dark:text-slate-100 tracking-tight -tracking-[0.025em]">
          Active Objectives
        </h3>

        {activeTasks.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-16 text-center text-xs font-mono tracking-[0.25em] uppercase text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 shadow-inner rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
            No personal tasks currently active.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {activeTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={reducedMotion ? undefined : { delay: idx * 0.03 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm dark:shadow-slate-900/20 flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-150 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => handleTogglePersonalTask(task.id, task.status)}
                      className="text-slate-300 dark:text-slate-500 hover:text-emerald-500 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      aria-label={`Mark "${task.title}" as completed`}
                    >
                      <Circle className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col">
                      <span className="font-serif text-base text-slate-800 dark:text-slate-100">{task.title}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePersonalTask(task.id)}
                    className="text-slate-300 dark:text-slate-500 hover:text-orange-500 p-2 transition-all duration-150 opacity-60 hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    aria-label={`Delete "${task.title}"`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-700">
          <h3 className="font-serif text-xl text-slate-900 dark:text-slate-100 tracking-tight opacity-60 -tracking-[0.025em]">
            Completed Objectives
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {completedTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={reducedMotion ? undefined : { delay: idx * 0.03 }}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-1 opacity-60">
                    <button
                      onClick={() => handleTogglePersonalTask(task.id, task.status)}
                      className="text-emerald-500 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      aria-label={`Mark "${task.title}" as active`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                    <span className="font-serif text-base text-slate-500 dark:text-slate-400 line-through">{task.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeletePersonalTask(task.id)}
                    className="text-slate-300 dark:text-slate-500 hover:text-orange-500 p-2 transition-all opacity-60 hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    aria-label={`Delete "${task.title}"`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
