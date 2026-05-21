import {
  X,
  Target,
  Users,
  Calendar,
  AlertCircle,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, UserProfile } from "../../lib/types";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";
import { useFocusTrap } from '../../lib/hooks/useFocusTrap';

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const VALID_STATUSES = ['todo', 'in-progress', 'in-review', 'completed'] as const;

function isValidPriority(value: string): value is Task['priority'] {
  return (VALID_PRIORITIES as readonly string[]).includes(value);
}

function isValidStatus(value: string): value is Task['status'] {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

interface Props {
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  employees: UserProfile[];
  handleUpdateTask: (e: React.FormEvent) => void;
  isUpdating?: boolean;
}

export default function EditTaskModal({
  editingTask,
  setEditingTask,
  employees,
  handleUpdateTask,
  isUpdating,
}: Props) {
  const reducedMotion = useReducedMotion();
  const focusTrapRef = useFocusTrap(editingTask != null);
  return (
    <AnimatePresence>
      {editingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            onClick={() => setEditingTask(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />

          <motion.div
            ref={focusTrapRef}
            initial={reducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.95 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.95 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-task-title"
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xl dark:shadow-slate-900/50 rounded-3xl overflow-hidden"
          >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-slate-50 dark:border-slate-700 flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-emerald-500" />
                <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Tactical Revision</h2>
              </div>
              <h2 id="edit-task-title" className="font-serif text-xl text-slate-900 dark:text-slate-100 -tracking-[0.025em] tracking-tight">
                Edit Mission Metadata
              </h2>
            </div>
            <button
              onClick={() => setEditingTask(null)}
              aria-label="Close dialog"
              className="p-3 text-slate-300 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-150 rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleUpdateTask} className="p-8 md:p-10 space-y-8">
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Operation Title</label>
                <input
                  required
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all duration-150 font-serif text-base"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Mission Specs</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all duration-150 text-slate-600 dark:text-slate-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignee */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Primary Operative</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
                    <select
                      required
                      value={editingTask.employeeId || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, employeeId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 pl-11 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <option value="">Select Personnel</option>
                      {employees.map((emp) => (
                        <option key={emp.uid} value={emp.uid}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Threat Priority</label>
                  <div className="relative">
                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
                    <select
                      required
                      value={editingTask.priority || 'medium'}
                      onChange={(e) => { if (isValidPriority(e.target.value)) setEditingTask({ ...editingTask, priority: e.target.value }); }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 pl-11 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <option value="low">LOW - ROUTINE</option>
                      <option value="medium">MEDIUM - STANDARD</option>
                      <option value="high">HIGH - URGENT</option>
                      <option value="critical">CRITICAL - IMMEDIATE</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Live Status</label>
                  <select
                    required
                    value={editingTask.status}
                    onChange={(e) => { if (isValidStatus(e.target.value)) setEditingTask({ ...editingTask, status: e.target.value }); }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    <option value="todo">Pending Deployment</option>
                    <option value="in-progress">In Progress</option>
                    <option value="in-review">Under Review</option>
                  </select>
                  <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-1">To complete a task, use the status action buttons.</p>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Target Deadline</label>
                  <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={editingTask.timelineEnd ? editingTask.timelineEnd.split('T')[0] : ''}
                        onChange={(e) => setEditingTask({ ...editingTask, timelineEnd: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 pl-11 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-bold uppercase tracking-wider"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-[0.3em] py-6 rounded-xl hover:bg-emerald-400 transition-all duration-150 shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
              >
                {isUpdating ? (
                  <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <><Save className="w-5 h-5" /> Commit Changes</>
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
