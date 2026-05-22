import { useState, useMemo } from "react";
import { Plus, ChevronDown, ChevronUp, Trash2, Calendar, Clock, FileText, CheckCircle2, Zap, Activity, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, UserProfile } from "../../lib/types";
import { getPriorityStyle, getStatusStyle, formatDate } from "../../lib/utils";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  teamTasks: Task[];
  setIsTaskModalOpen: (isOpen: boolean) => void;
  employees: UserProfile[];
  getDeadlineStyle: (deadline: string | null | undefined, isCompleted: boolean) => string;
  getTimeRemaining: (deadline: string) => string | null;
  handleStatusChange: (taskId: string, newStatus: Task['status'], task?: Task) => Promise<void>;
  handleDeleteTask: (task: Task) => void;
  setSelectedTaskDetails: (task: Task | null) => void;
}

export default function TeamOperationsBoard({
  teamTasks,
  employees,
  setIsTaskModalOpen,
  setSelectedTaskDetails,
  handleDeleteTask,
  handleStatusChange,
  getDeadlineStyle,
  getTimeRemaining,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const teamGroupedActiveTasks = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    teamTasks.filter((t) => t.status !== "completed").forEach((task) => {
      const empId = task.employeeId || "unknown";
      if (!grouped[empId]) grouped[empId] = [];
      grouped[empId].push(task);
    });
    return grouped;
  }, [teamTasks]);

  const teamGroupedCompletedTasks = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    teamTasks.filter((t) => t.status === "completed").forEach((task) => {
      const empId = task.employeeId || "unknown";
      if (!grouped[empId]) grouped[empId] = [];
      grouped[empId].push(task);
    });
    return grouped;
  }, [teamTasks]);

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-700 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rotate-45 shadow-sm"></div>
            <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Tactical Control</h2>
          </div>
          <h2 className="font-mono text-2xl text-slate-900 dark:text-slate-100 tracking-tight -tracking-[0.025em]">
            Team Operations
          </h2>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-[0.2em] px-8 py-4 flex items-center gap-3 hover:bg-emerald-400 transition-all rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <Plus className="w-5 h-5" /> New Task
        </button>
      </div>

      <div className="space-y-12">
        <div className="space-y-8">
          <h3 className="font-mono text-xl text-slate-900 dark:text-slate-100 tracking-tight -tracking-[0.025em]">
            Active Operations
          </h3>
          <div className="flex flex-col gap-10">
            {teamTasks.filter((t) => t.status !== "completed").length === 0 && (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-16 text-center text-xs font-mono tracking-[0.25em] uppercase text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 shadow-inner rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center"><Activity className="w-8 h-8 text-emerald-400" /></div>
                No active team operations detected.
              </div>
            )}
            {Object.entries(teamGroupedActiveTasks).map(([employeeId, tasks]) => {
              const employee = employees.find((e) => e.uid === employeeId);
              const employeeName = employee?.name || (employeeId === "unknown" ? "Unassigned" : `Former Member [${employeeId.slice(0, 8)}]`);
              const isCollapsed = collapsedGroups[`team_active_${employeeId}`];
              const toggleGroup = () => setCollapsedGroups((prev) => ({ ...prev, [`team_active_${employeeId}`]: !prev[`team_active_${employeeId}`] }));

              const activeEmployeeTasks = tasks.filter((t) => t.status !== "completed");
              if (activeEmployeeTasks.length === 0) return null;

              return (
                <div key={`team_active_${employeeId}`} className="space-y-6">
                  <div
                    className={`flex items-center gap-6 px-1 cursor-pointer group/header ${!employee && employeeId !== "unknown" ? "opacity-60" : ""}`}
                    onClick={toggleGroup}
                  >
                    <div className={`w-2 h-2 rotate-45 shrink-0 shadow-sm ${!employee && employeeId !== "unknown" ? "bg-slate-400 shadow-slate-500/20" : "bg-emerald-500 shadow-emerald-500/20"}`}></div>
                     <h3 className={`font-mono text-xs font-black uppercase tracking-[0.3em] whitespace-nowrap transition-colors border-none p-0 bg-transparent flex items-center ${!employee && employeeId !== "unknown" ? "text-slate-400 dark:text-slate-500 group-hover/header:text-slate-600 dark:group-hover/header:text-slate-400 line-through" : "text-slate-600 dark:text-slate-400 group-hover/header:text-emerald-600"}`}>
                       Assigned To: {employeeName} <span className="ml-2 opacity-60 no-underline">({activeEmployeeTasks.length})</span>
                     </h3>
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent"></div>
                     <div className="text-slate-400 dark:text-slate-500 group-hover/header:text-emerald-600 dark:group-hover/header:text-emerald-400 transition-colors bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900/20 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2" tabIndex={0} role="button" aria-label={isCollapsed ? "Expand group" : "Collapse group"}>
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={reducedMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={reducedMotion ? { height: "auto", opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-4 pb-6 px-1">
                          {activeEmployeeTasks.map((task, idx) => (
                            <motion.div
                              key={task.id}
                              initial={reducedMotion ? { opacity: 1 } : { x: -20, opacity: 0 }}
                              animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
                              transition={reducedMotion ? undefined : { delay: idx * 0.03 }}
                              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 hover:border-emerald-500/40 hover:shadow-xl dark:hover:shadow-slate-900/30 hover:shadow-emerald-500/5 transition-all duration-150 group cursor-pointer text-left focus:outline-none relative rounded-2xl shadow-sm dark:shadow-slate-900/20 active:scale-[0.98]"
                              onClick={() => setSelectedTaskDetails(task)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTaskDetails(task); } }}
                              role="button"
                              tabIndex={0}
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                className="absolute top-2 right-2 text-slate-200 dark:text-slate-600 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition-all duration-150 p-2 rounded-xl z-10 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                                title="Terminate Operation"
                                aria-label={`Delete task: ${task.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="flex flex-col xl:flex-row justify-between gap-4 xl:items-center pr-10">
                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
                                  <div className="flex items-center gap-3 min-w-[200px]">
                                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-black uppercase tracking-widest shadow-sm shrink-0 ${getStatusStyle(task.status)}`}>
                                      {task.status === 'todo' && <Clock className="w-3.5 h-3.5" />}
                                      {task.status === 'in-progress' && <Activity className="w-3.5 h-3.5" />}
                                      {task.status === 'in-review' && <Eye className="w-3.5 h-3.5" />}
                                      {task.status === 'todo' ? 'Standing By' : task.status === 'in-progress' ? 'Active' : 'Under Review'}
                                    </div>
                                    <h3 className="font-mono text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors duration-150 tracking-tight -tracking-[0.025em] truncate flex-1" title={task.title}>
                                      {task.title}
                                    </h3>
                                  </div>
                                  <div className="hidden md:block h-5 w-[1px] bg-slate-100 dark:bg-slate-700 shrink-0"></div>
                                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest font-bold flex-1">
                                    <div className={`flex items-center gap-2 border px-3 py-1 rounded-lg font-black shadow-lg ${getPriorityStyle(task.priority)}`}>
                                      <Zap className="w-3.5 h-3.5" /> {task.priority || 'medium'}
                                    </div>
                                    <div className={`flex items-center gap-2 border border-indigo-700 px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-lg font-bold ${task.status === "completed" ? "opacity-70" : ""}`}>
                                      <Calendar className="w-3.5 h-3.5" /> Assigned: {formatDate(task.createdAt)}
                                    </div>
                                    <div className={`flex items-center gap-2 border px-3 py-1 rounded-lg font-black ${getDeadlineStyle(task.timelineEnd, task.status === "completed")}`}>
                                       <Clock className={`w-3.5 h-3.5 ${task.timelineEnd && task.status !== "completed" ? "animate-pulse" : ""}`} /> Deadline: {task.timelineEnd ? formatDate(task.timelineEnd) : "Open Timeline"}
                                      {task.timelineEnd && task.status !== "completed" && (
                                        <span className="ml-auto px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs border border-emerald-500/10 font-black shadow-sm">{getTimeRemaining(task.timelineEnd)}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-row items-center gap-3 shrink-0">
                                  {task.status === "in-review" ? (
                                    <>
                                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, "completed", task); }} className="bg-emerald-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-widest py-2 px-4 hover:bg-emerald-400 transition-all duration-150 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                                      Approve
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, "in-progress", task); }} className="border border-orange-200 text-orange-600 bg-orange-50 font-mono text-xs font-bold uppercase tracking-widest py-2 px-4 hover:bg-orange-100 transition-all duration-150 rounded-xl active:scale-95 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, "completed", task); }} className="border border-emerald-200 text-emerald-600 bg-emerald-50 font-mono text-xs font-bold uppercase tracking-widest py-2 px-4 hover:bg-emerald-100 transition-all duration-150 rounded-xl active:scale-95 shadow-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                                    Resolve
                                  </button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedTaskDetails(task); }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold uppercase tracking-widest py-2.5 px-6 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-slate-100 transition-all duration-150 flex justify-center items-center gap-2 rounded-xl shadow-sm dark:shadow-slate-900/20 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                                    <FileText className="w-3 h-3" /> View Progress
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="font-mono text-xl text-slate-900 dark:text-slate-100 tracking-tight -tracking-[0.025em]">
            Completed Operations
          </h3>
          <div className="flex flex-col gap-10">
            {teamTasks.filter((t) => t.status === "completed").length === 0 && (
              <div className="border border-slate-100 dark:border-slate-700 p-16 text-center text-xs font-mono tracking-[0.25em] uppercase text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-500" /></div>
                No archived operations.
              </div>
            )}
            {Object.entries(teamGroupedCompletedTasks).map(([employeeId, tasks]) => {
              const employee = employees.find((e) => e.uid === employeeId);
              const employeeName = employee?.name || (employeeId === "unknown" ? "Unassigned" : `Former Member [${employeeId.slice(0, 8)}]`);
              const isCollapsed = collapsedGroups[`team_completed_${employeeId}`];
              const toggleGroup = () => setCollapsedGroups((prev) => ({ ...prev, [`team_completed_${employeeId}`]: !prev[`team_completed_${employeeId}`] }));

              return (
                <div key={`team_completed_${employeeId}`} className="space-y-6">
                  <div className={`flex items-center gap-6 px-1 cursor-pointer group/header ${!employee && employeeId !== "unknown" ? "opacity-60" : ""}`} onClick={toggleGroup}>
                    <div className={`w-2 h-2 rotate-45 shrink-0 ${!employee && employeeId !== "unknown" ? "bg-slate-300" : "bg-slate-500"}`}></div>
                    <h3 className={`font-mono text-xs font-black uppercase tracking-[0.3em] whitespace-nowrap transition-colors border-none p-0 bg-transparent flex items-center ${!employee && employeeId !== "unknown" ? "text-slate-400 dark:text-slate-500 group-hover/header:text-slate-600 dark:group-hover/header:text-slate-400 line-through" : "text-slate-700 dark:text-slate-300 group-hover/header:text-slate-900 dark:group-hover/header:text-slate-100"}`}>
                      Assigned To: {employeeName} <span className="ml-2 opacity-80 no-underline">({tasks.length})</span>
                    </h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent"></div>
                    <div className="text-slate-500 dark:text-slate-400 group-hover/header:text-slate-700 dark:group-hover/header:text-slate-300 transition-colors bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900/20 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2" tabIndex={0} role="button" aria-label={isCollapsed ? "Expand group" : "Collapse group"}>
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div initial={reducedMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }} animate={reducedMotion ? { height: "auto", opacity: 1 } : { height: "auto", opacity: 1 }} exit={reducedMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: "circOut" }} className="overflow-hidden">
                        <div className="grid grid-cols-1 gap-4 pb-6 px-1">
                          {tasks.map((task, idx) => (
                            <motion.div key={task.id} initial={reducedMotion ? { opacity: 1 } : { x: -20, opacity: 0 }} animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }} transition={reducedMotion ? undefined : { delay: idx * 0.03 }} className="border border-slate-100 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 py-3 px-4 hover:border-emerald-500/20 hover:bg-white dark:hover:bg-slate-700 transition-all group cursor-pointer text-left focus:outline-none relative rounded-2xl shadow-sm dark:shadow-slate-900/20" onClick={() => setSelectedTaskDetails(task)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTaskDetails(task); } }} role="button" tabIndex={0}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                className="absolute top-2 right-2 text-slate-200 dark:text-slate-600 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition-all p-2 rounded-xl z-10"
                                title="Purge Record"
                                aria-label={`Delete task: ${task.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="flex flex-col xl:flex-row justify-between gap-4 xl:items-center pr-10">
                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
                                  <div className="flex items-center gap-3 min-w-[200px]">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <h3 className="font-mono text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors duration-150 tracking-tight -tracking-[0.025em] truncate flex-1" title={task.title}>
                                      {task.title}
                                    </h3>
                                  </div>
                                  <div className="hidden md:block h-5 w-[1px] bg-slate-50 dark:bg-slate-700 shrink-0"></div>
                                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest font-bold flex-1">
                                    <div className="flex items-center gap-2 border border-indigo-700 px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-lg font-bold opacity-70">
                                      <Calendar className="w-3.5 h-3.5" /> Assigned: {formatDate(task.createdAt)}
                                    </div>
                                    <div className={`flex items-center gap-2 border px-3 py-1 rounded-lg font-black ${getDeadlineStyle(task.timelineEnd, true)}`}>
                                       <Clock className="w-3.5 h-3.5" /> Deadline: {task.timelineEnd ? formatDate(task.timelineEnd) : "Archived"}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-row items-center gap-3 shrink-0">
                                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-mono text-xs font-bold uppercase tracking-widest py-2 px-4 flex justify-center items-center gap-2 rounded-xl shadow-sm shadow-emerald-500/5 whitespace-nowrap">
                                    <CheckCircle2 className="w-3 h-3" /> Resolved
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedTaskDetails(task); }} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold uppercase tracking-widest py-2.5 px-6 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-slate-100 transition-all flex justify-center items-center gap-2 rounded-xl shadow-sm dark:shadow-slate-900/20 whitespace-nowrap">
                                    <FileText className="w-3 h-3" /> View Report
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
