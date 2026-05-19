import {
  X,
  Target,
  Users,
  Calendar,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, NewTaskForm } from "../../lib/types";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  newTask: NewTaskForm;
  setNewTask: (task: NewTaskForm) => void;
  employees: UserProfile[];
  handleCreateTask: (e: React.FormEvent) => void;
  isCreating?: boolean;
}

export default function TaskAssignmentModal({
  isOpen,
  onClose,
  newTask,
  setNewTask,
  employees,
  handleCreateTask,
  isCreating,
}: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        />
        
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.95 }}
          animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.95 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-assignment-title"
          className="relative w-full max-w-2xl bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-slate-50 flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-emerald-500" />
                <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-400">Tactical Assignment</h2>
              </div>
              <h2 id="task-assignment-title" className="font-serif text-xl text-slate-900 tracking-tight">
                Initialize New Operation
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="p-8 md:p-10 space-y-8">
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Operation Title</label>
                <input
                  required
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Laser Alignment Phase II"
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-serif text-base"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mission Specs</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detailed technical instructions..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-slate-600 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignee */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Primary Operative</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      required
                      value={newTask.employeeId}
                      onChange={(e) => setNewTask({ ...newTask, employeeId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 pl-11 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
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
                  <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Threat Priority</label>
                  <div className="relative">
                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      required
                      value={newTask.priority || 'medium'}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 pl-11 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <option value="low">LOW - ROUTINE</option>
                      <option value="medium">MEDIUM - STANDARD</option>
                      <option value="high">HIGH - URGENT</option>
                      <option value="critical">CRITICAL - IMMEDIATE</option>
                    </select>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2 md:col-span-2">
                  <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Target Deadline (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={newTask.timelineEnd}
                      onChange={(e) => setNewTask({ ...newTask, timelineEnd: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 pl-11 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-bold uppercase tracking-wider"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-[0.3em] py-6 rounded-3xl hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
              >
                {isCreating ? (
                  <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <><ShieldCheck className="w-5 h-5" /> Deploy Assignment</>
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
