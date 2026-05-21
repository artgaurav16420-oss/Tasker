import { Dispatch, SetStateAction, useMemo } from "react";
import { Avatar } from "../Avatar";
import { 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Plus,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Task, NewTaskForm } from "../../lib/types";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";
import { useFocusTrap } from '../../lib/hooks/useFocusTrap';

interface Props {
  selectedEmployee: UserProfile | null;
  setSelectedEmployee: (emp: UserProfile | null) => void;
  teamTasks: Task[];
  setNewTask: Dispatch<SetStateAction<NewTaskForm>>;
  setIsTaskModalOpen: (open: boolean) => void;
  handleDeleteTask: (task: Task) => void;
  handleStatusChange: (taskId: string, newStatus: Task['status'], task?: Task) => Promise<void>;
  setSelectedTaskDetails: (task: Task | null) => void;
  getDeadlineStyle: (deadline: string | null | undefined, isCompleted: boolean) => string;
  getTimeRemaining: (deadline: string) => string | null;
}

export default function EmployeeTasksModal({
  selectedEmployee,
  setSelectedEmployee,
  teamTasks,
  setNewTask,
  setIsTaskModalOpen,
  handleDeleteTask,
  handleStatusChange,
  setSelectedTaskDetails,
  getDeadlineStyle,
  getTimeRemaining,
}: Props) {
  const reducedMotion = useReducedMotion();
  const focusTrapRef = useFocusTrap(selectedEmployee != null);

  const employeeTasks = useMemo(() => teamTasks.filter(t => t.employeeId === selectedEmployee?.uid), [teamTasks, selectedEmployee?.uid]);
  const activeTasks = useMemo(() => employeeTasks.filter(t => t.status !== 'completed'), [employeeTasks]);
  const completedTasks = useMemo(() => employeeTasks.filter(t => t.status === 'completed'), [employeeTasks]);

  if (!selectedEmployee) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          onClick={() => setSelectedEmployee(null)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        />
        
        <motion.div
          ref={focusTrapRef}
          initial={reducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.95 }}
          animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="employee-tasks-title"
          className="relative w-full max-w-4xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xl dark:shadow-slate-900/50 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-slate-50 flex justify-between items-start sticky top-0 bg-white dark:bg-slate-800 z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                <Avatar name={selectedEmployee.name} size={64} className="rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rotate-45"></div>
                  <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Personnel Dossier</h2>
                </div>
                <h2 id="employee-tasks-title" className="font-serif text-2xl text-slate-900 dark:text-slate-100 -tracking-[0.025em] tracking-tight">
                  {selectedEmployee.name}
                </h2>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedEmployee(null)}
              aria-label="Close dialog"
              className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-150 rounded-xl border border-slate-100 dark:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                <div className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 font-bold">Total Ops</div>
                <div className="font-serif text-xl text-slate-900 dark:text-slate-100">{employeeTasks.length}</div>
              </div>
              <div className="p-6 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl border border-emerald-100 dark:border-emerald-500/30 text-center">
                <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 font-bold">In Progress</div>
                <div className="font-serif text-xl text-emerald-700 dark:text-emerald-300">{activeTasks.length}</div>
              </div>
              <button 
                onClick={() => {
                  setNewTask({ title: '', description: '', employeeId: selectedEmployee.uid, timelineEnd: '', priority: 'medium' });
                  setIsTaskModalOpen(true);
                }}
                className="p-6 bg-white dark:bg-slate-800 border border-dashed border-emerald-300 dark:border-emerald-500/30 rounded-2xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all duration-150 flex flex-col items-center justify-center group"
              >
                <Plus className="w-5 h-5 mb-1 group-hover:scale-125 transition-transform" />
                <div className="font-mono text-xs uppercase tracking-widest font-bold">New Assignment</div>
              </button>
            </div>

            {/* Active Assignments */}
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  Active Deployments ({activeTasks.length})
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent"></div>
              </div>

              {activeTasks.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-800/30">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Inventory clear. No active deployments.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                      className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl hover:shadow-2xl dark:hover:shadow-slate-900/50 hover:shadow-slate-200/50 transition-all duration-150 border-l-4 border-l-emerald-500 cursor-pointer"
                      onClick={() => {
                        setSelectedTaskDetails(task);
                      }}
                      role="button"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                        className="absolute top-4 right-4 p-2 text-slate-200 dark:text-slate-600 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/20 rounded-xl transition-all duration-150"
                        aria-label={`Delete task: ${task.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${task.status === 'in-review' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                          <h4 className="font-serif text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {task.title}
                          </h4>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <div className={`px-4 py-1 rounded-lg border font-mono text-xs font-black uppercase tracking-widest ${getDeadlineStyle(task.timelineEnd, false)}`}>
                            <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                            {task.timelineEnd ? `Target: ${task.timelineEnd}` : "Open Timeline"}
                            {task.timelineEnd && <span className="ml-3 opacity-80">{getTimeRemaining(task.timelineEnd)}</span>}
                          </div>
                          {task.status === 'in-review' && (
                            <div className="px-4 py-1 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 rounded-lg font-mono text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" /> Pending Review
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Archive */}
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Operation Archive ({completedTasks.length})
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 dark:from-slate-700 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedTasks.slice(0, 6).map((task) => (
                  <div 
                    key={task.id} 
                    className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all duration-150 group"
                    onClick={() => setSelectedTaskDetails(task)}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="font-serif text-slate-900 dark:text-slate-100 truncate">
                        {task.title}
                      </div>
                      <div className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mt-1">
                        Completed {new Date(task.updatedAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 flex justify-center sticky bottom-0 border-t border-slate-100 dark:border-slate-700">
             <div className="flex items-center gap-3">
                <Briefcase className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] font-black text-slate-500 dark:text-slate-400">Identity: {selectedEmployee.uid}</span>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
