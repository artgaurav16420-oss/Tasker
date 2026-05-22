import { 
  X, 
  Calendar, 
  FileText, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Activity,
  Eye,
  Clock,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Task, Report } from "../../lib/types";
import { formatDate, getPriorityStyle, getStatusStyle } from "../../lib/utils";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";
import { useFocusTrap } from '../../lib/hooks/useFocusTrap';
import { useAuditLogs } from "../../lib/hooks/useAuditLogs";

interface Props {
  selectedTaskDetails: Task | null;
  setSelectedTaskDetails: (task: Task | null) => void;
  managedReports: Report[];
  profile: UserProfile | null;
  handleStatusChange: (taskId: string, newStatus: Task['status'], task?: Task) => Promise<void>;
  setEditingTask: (task: Task | null) => void;
  handleDeleteTask: (task: Task) => void;
  getTimeRemaining: (deadline: string) => string | null;
}

export default function TaskDetailsModal({
  selectedTaskDetails,
  setSelectedTaskDetails,
  managedReports,
  profile,
  handleStatusChange,
  setEditingTask,
  handleDeleteTask,
  getTimeRemaining,
}: Props) {
  const { logs, isLoading: isLoadingLogs, error: logsError } = useAuditLogs(selectedTaskDetails?.id ?? null);
  const reducedMotion = useReducedMotion();
  const focusTrapRef = useFocusTrap(selectedTaskDetails != null);

  if (!selectedTaskDetails) return null;

  const reports = managedReports.filter(r => r.taskId === selectedTaskDetails.id);
  const isManager = profile?.uid === selectedTaskDetails.managerId;
  const statusLabel = selectedTaskDetails.status === 'in-progress' ? 'In Progress' : selectedTaskDetails.status === 'in-review' ? 'In Review' : selectedTaskDetails.status.charAt(0).toUpperCase() + selectedTaskDetails.status.slice(1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedTaskDetails(null)}
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
          aria-labelledby="task-details-title"
          className="relative w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xl dark:shadow-slate-900/50 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>

          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start sticky top-0 bg-white dark:bg-slate-800 z-10">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-black uppercase tracking-widest shadow-sm ${getStatusStyle(selectedTaskDetails.status)}`}>
                  {selectedTaskDetails.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {selectedTaskDetails.status === 'todo' && <Clock className="w-3.5 h-3.5" />}
                  {selectedTaskDetails.status === 'in-progress' && <Activity className="w-3.5 h-3.5" />}
                  {selectedTaskDetails.status === 'in-review' && <Eye className="w-3.5 h-3.5" />}
                  {statusLabel}
                </div>
              </div>
              <h2 id="task-details-title" className="font-serif text-xl text-slate-900 dark:text-slate-100 tracking-tight truncate pr-4">
                {selectedTaskDetails.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {isManager && (
                <>
                  <button
                    onClick={() => { setEditingTask(selectedTaskDetails); setSelectedTaskDetails(null); }}
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-all duration-150 rounded-xl border border-slate-100 dark:border-slate-700"
                    title="Edit"
                    aria-label="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(selectedTaskDetails)}
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/20 transition-all duration-150 rounded-xl border border-slate-100 dark:border-slate-700"
                    title="Delete"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedTaskDetails(null)}
                aria-label="Close"
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-150 rounded-xl border border-slate-100 dark:border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

            {/* Description */}
            <div>
              <h3 className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Description</h3>
              <p className="text-slate-600 dark:text-slate-400 font-serif text-base leading-relaxed whitespace-pre-wrap">
                {selectedTaskDetails.description || "No description provided."}
              </p>
            </div>

            {/* Key Details */}
            <div>
              <h3 className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Key Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-500 mb-2" />
                  <div className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Created</div>
                  <div className="font-mono text-sm font-black text-slate-900 dark:text-slate-100 mt-1">{formatDate(selectedTaskDetails.createdAt)}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <Calendar className="w-4 h-4 text-orange-500 mb-2" />
                  <div className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Deadline</div>
                  <div className="font-mono text-sm font-black text-slate-900 dark:text-slate-100 mt-1">{selectedTaskDetails.timelineEnd ? formatDate(selectedTaskDetails.timelineEnd) : "—"}</div>
                  {selectedTaskDetails.timelineEnd && selectedTaskDetails.status !== 'completed' && (
                    <div className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 mt-1">{getTimeRemaining(selectedTaskDetails.timelineEnd)}</div>
                  )}
                </div>
                <div className={`p-4 rounded-2xl border ${getPriorityStyle(selectedTaskDetails.priority)}`}>
                  <div className="font-mono text-xs uppercase tracking-widest opacity-80 font-bold">Priority</div>
                  <div className="font-mono text-sm font-black mt-1">{selectedTaskDetails.priority || 'medium'}</div>
                </div>
                <div className={`p-4 rounded-2xl border ${selectedTaskDetails.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : selectedTaskDetails.status === 'in-review' ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700'}`}>
                  <div className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Status</div>
                  <div className={`font-mono text-sm font-black mt-1 flex items-center gap-2 ${selectedTaskDetails.status === 'completed' ? 'text-emerald-600' : selectedTaskDetails.status === 'in-review' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    {statusLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Actions */}
            {isManager && selectedTaskDetails.status !== 'completed' && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
                <h3 className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStatusChange(selectedTaskDetails.id, 'completed', selectedTaskDetails)}
                    className="flex-1 bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-widest py-4 rounded-xl hover:bg-emerald-400 transition-all duration-150 shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Completion
                  </button>
                  {selectedTaskDetails.status === 'in-review' && (
                    <button
                      onClick={() => handleStatusChange(selectedTaskDetails.id, 'in-progress', selectedTaskDetails)}
                      className="flex-1 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/20 font-mono text-xs font-black uppercase tracking-widest py-4 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/30 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" /> Request Changes
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Field Reports */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h3 className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Reports ({reports.length})</h3>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></div>
              </div>
              {reports.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">No reports submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report, idx) => (
                    <div
                      key={report.id}
                      className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500">Report #{idx + 1}</span>
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{new Date(report.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-serif text-sm leading-relaxed">"{report.content}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Trail */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h3 className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Activity Log ({logs.length})</h3>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700"></div>
              </div>
              {isLoadingLogs ? (
                <div className="flex justify-center p-8">
                  <Activity className="w-5 h-5 text-emerald-500 animate-spin" />
                </div>
              ) : logsError ? (
                <p className="text-center font-mono text-xs text-orange-500 py-4">{logsError}</p>
              ) : logs.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">No activity recorded yet.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 dark:border-slate-700">
                  {logs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-4">
                          <span className="font-mono text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{log.event.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-xs text-slate-400 dark:text-slate-500 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        {(log.oldValue || log.newValue) && (
                          <p className="text-slate-500 dark:text-slate-400 font-serif text-xs">
                            {log.oldValue && log.newValue ? (
                              <>{log.oldValue} → <span className="text-slate-900 dark:text-slate-100 font-bold">{log.newValue}</span></>
                            ) : (
                              log.newValue || log.oldValue
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">ID: {selectedTaskDetails.id.slice(0, 8)}...</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Live</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
