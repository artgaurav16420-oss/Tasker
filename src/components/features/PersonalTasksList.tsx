import { useMemo } from "react";
import { Plus, CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PersonalTask } from "../../lib/types";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  personalTasks: PersonalTask[];
  setIsPersonalTaskModalOpen: (isOpen: boolean) => void;
  handleTogglePersonalTask: (taskId: string, currentStatus: PersonalTask['status']) => Promise<void>;
  handleDeletePersonalTask: (id: string) => void;
  getTimeRemaining: (deadline: string) => string | null;
}

export default function PersonalTasksList({
  personalTasks,
  setIsPersonalTaskModalOpen,
  handleTogglePersonalTask,
  handleDeletePersonalTask,
  getTimeRemaining,
}: Props) {
  const reducedMotion = useReducedMotion();
  const activeTasks = useMemo(() => personalTasks.filter(t => t.status !== 'completed'), [personalTasks]);
  const completedTasks = useMemo(() => personalTasks.filter(t => t.status === 'completed'), [personalTasks]);

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"></div>
            <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-400">Self-Assigned</h2>
          </div>
          <h2 className="font-serif text-2xl text-slate-900 tracking-tight">
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
        <h3 className="font-serif text-xl text-slate-900 tracking-tight">
          Active Objectives
        </h3>

        {activeTasks.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 p-16 text-center text-xs font-mono tracking-[0.25em] uppercase text-slate-600 bg-white shadow-inner rounded-3xl">
            No personal tasks currently active.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {activeTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => handleTogglePersonalTask(task.id, task.status)}
                      className="text-slate-300 hover:text-emerald-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      aria-label={`Mark "${task.title}" as completed`}
                    >
                      <Circle className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col">
                      <span className="font-serif text-base text-slate-800">{task.title}</span>
                      {task.timelineEnd && (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          <span className="font-mono text-xs uppercase font-bold text-slate-500">
                            Due: {new Date(task.timelineEnd).toLocaleString()}
                            <span className="ml-2 text-orange-600">({getTimeRemaining(task.timelineEnd)})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePersonalTask(task.id)}
                    className="text-slate-300 hover:text-orange-500 p-2 transition-all md:opacity-0 md:group-hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
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
        <div className="space-y-8 pt-8 border-t border-slate-100">
          <h3 className="font-serif text-xl text-slate-900 tracking-tight opacity-60">
            Completed Objectives
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-1 opacity-60">
                    <button
                      onClick={() => handleTogglePersonalTask(task.id, task.status)}
                      className="text-emerald-500 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      aria-label={`Mark "${task.title}" as active`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                    <span className="font-serif text-base text-slate-500 line-through">{task.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeletePersonalTask(task.id)}
                    className="text-slate-300 hover:text-orange-500 p-2 transition-all md:opacity-0 md:group-hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
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
