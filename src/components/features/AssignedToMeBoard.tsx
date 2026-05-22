import { useMemo, useState, useEffect } from "react";
import { 
  Activity, 
  Clock,
  FileText,
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  Zap 
} from "lucide-react";
import { motion } from "motion/react";
import { UserProfile, Task } from "../../lib/types";
import { getPriorityStyle, formatDate } from "../../lib/utils";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  profile: UserProfile | null;
  myTasks: Task[];
  superiors: UserProfile[];
  getDeadlineStyle: (deadline: string | null | undefined, isCompleted: boolean) => string;
  getTimeRemaining: (deadline: string) => string | null;
  handleStatusChange: (taskId: string, newStatus: Task['status'], task?: Task) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  setSelectedTaskDetails: (task: Task | null) => void;
  onSubmitForReview: (task: Task) => void;
}

export default function AssignedToMeBoard({
  profile,
  myTasks,
  superiors,
  getDeadlineStyle,
  getTimeRemaining,
  handleStatusChange,
  setSelectedTask,
  setSelectedTaskDetails,
  onSubmitForReview,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    if (!openDropdownId) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-dropdown]')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdownId]);
  const activeTasks = useMemo(() => myTasks.filter(t => t.status !== "completed"), [myTasks]);
  const completedTasks = useMemo(() => myTasks.filter(t => t.status === "completed"), [myTasks]);

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-700 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rotate-45 shadow-sm"></div>
            <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Tactical Display</h2>
          </div>
          <h2 className="font-serif text-2xl text-slate-900 dark:text-slate-100 tracking-tight -tracking-[0.025em]">
            Assigned Operations
          </h2>
        </div>
      </div>

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-6">
            <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Active Duty ({activeTasks.length})
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeTasks.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-16 text-center rounded-2xl bg-white dark:bg-slate-800 shadow-inner">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center"><Activity className="w-8 h-8 text-emerald-400" /></div>
                <p className="font-mono text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">No active assignments detected.</p>
                <p className="font-serif text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-sm mx-auto">Tasks assigned to you will appear here. Contact your manager to receive assignments.</p>
              </div>
            )}
            {activeTasks.map((task) => {
              const manager = superiors.find(s => s.uid === task.managerId);
              return (
                <motion.div
                  key={task.id}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  className={`group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-slate-900/40 transition-all border-l-4 border-l-emerald-500 shadow-sm dark:shadow-slate-900/20 cursor-pointer active:scale-[0.98] ${openDropdownId === task.id ? 'z-30' : ''}`}
                  onClick={() => setSelectedTaskDetails(task)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTaskDetails(task); } }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex flex-col xl:flex-row justify-between gap-6 xl:items-center">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${task.status === 'in-review' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{task.status === 'in-review' ? 'Review' : task.status === 'in-progress' ? 'Active' : 'Pending'}</span>
                        <h4 className="font-serif text-xl text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors duration-150 -tracking-[0.025em]" title={task.title}>
                          {task.title}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className={`px-4 py-1 rounded-lg border font-mono text-xs font-black uppercase tracking-widest shadow-md ${getPriorityStyle(task.priority)}`}>
                          <Zap className="w-3.5 h-3.5 inline mr-1" />
                          {task.priority || 'medium'}
                        </div>
                        <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg flex items-center gap-2">
                          <Activity className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            From: {manager?.name || "System Master"}
                          </span>
                        </div>
                        <div className={`px-4 py-1 rounded-lg border font-mono text-xs font-black uppercase tracking-widest ${getDeadlineStyle(task.timelineEnd, false)}`}>
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          {task.timelineEnd ? `Target: ${formatDate(task.timelineEnd)}` : "Open Order"}
                          {task.timelineEnd && <span className="ml-3 opacity-80">{getTimeRemaining(task.timelineEnd)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 relative" data-dropdown>
                      {task.status === 'in-review' ? (
                        <div className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-8 py-3.5 rounded-xl font-mono text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Pending Review
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === task.id ? null : task.id);
                            }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-mono text-xs font-black uppercase tracking-[0.2em] px-6 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95 flex items-center gap-2"
                          >
                            {task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          {openDropdownId === task.id && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                              {task.status === 'todo' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(task.id, 'in-progress', task);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-5 py-3 font-mono text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                  In Progress
                                </button>
                              )}
                              {task.status === 'in-progress' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(task.id, 'todo', task);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-5 py-3 font-mono text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                  Revert to Pending
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  onSubmitForReview(task);
                                }}
                                className="w-full text-left px-5 py-3 font-mono text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                Submit for Review
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-6">
            <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Operation Archive ({completedTasks.length})
            </h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 dark:from-slate-700 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all"
                onClick={() => setSelectedTaskDetails(task)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTaskDetails(task); } }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <h5 className="font-serif text-base text-slate-700 dark:text-slate-300">{task.title}</h5>
                    <p className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mt-1">Archived {formatDate(task.updatedAt)}</p>
                  </div>
                </div>
                <FileText className="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
