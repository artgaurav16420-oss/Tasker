import { useCallback, useEffect, useState } from "react";
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Activity,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Task, Report, AuditLog } from "../../lib/types";
import { supabase } from "../../lib/supabase/client";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  selectedTaskDetails: Task | null;
  setSelectedTaskDetails: (task: Task | null) => void;
  managedReports: Report[];
  profile: UserProfile | null;
  handleStatusChange: (taskId: string, newStatus: Task['status'], task?: Task) => Promise<void>;
  setEditingTask: (task: Task | null) => void;
  handleDeleteTask: (task: Task) => void;
  getDeadlineStyle: (deadline: string | null | undefined, isCompleted: boolean) => string;
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
  getDeadlineStyle,
  getTimeRemaining,
}: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const fetchLogs = useCallback(async () => {
    if (!selectedTaskDetails?.id) return;
    setIsLoadingLogs(true);
    setLogsError(null);
    try {
      const { data } = await supabase
        .from('logs')
        .select('*')
        .eq('taskId', selectedTaskDetails.id)
        .order('createdAt', { ascending: false });
      if (data) setLogs(data);
    } catch (err) {
      console.error(err);
      setLogsError('Failed to load audit logs.');
      setLogs([]);
      setIsLoadingLogs(false);
    }
  }, [selectedTaskDetails?.id]);

  useEffect(() => {
    if (selectedTaskDetails?.id) {
      fetchLogs();

      const channel = supabase
        .channel(`logs:${selectedTaskDetails.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'logs', filter: `taskId=eq.${selectedTaskDetails.id}` },
          (payload) => {
            setLogs((prev) => [payload.new as AuditLog, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTaskDetails?.id, fetchLogs]);

  if (!selectedTaskDetails) return null;

  const reports = managedReports.filter(r => r.taskId === selectedTaskDetails.id);
  const isManager = profile?.uid === selectedTaskDetails.managerId;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          onClick={() => setSelectedTaskDetails(null)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        />
        
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.95 }}
          animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-details-title"
          className="relative w-full max-w-4xl bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-slate-50 flex justify-between items-start sticky top-0 bg-white z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${selectedTaskDetails.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-500 shadow-sm animate-pulse'}`}></div>
                <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-400">Operation Briefing</h2>
              </div>
              <h2 id="task-details-title" className="font-serif text-2xl text-slate-900 -tracking-[0.025em] tracking-tight leading-tight">
                {selectedTaskDetails.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              {isManager && (
                <>
                  <button
                    onClick={() => {
                      setEditingTask(selectedTaskDetails);
                      setSelectedTaskDetails(null);
                    }}
                    className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-150 rounded-xl border border-slate-100"
                    title="Edit Metadata"
                    aria-label="Edit task metadata"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(selectedTaskDetails)}
                    className="p-3 text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-150 rounded-xl border border-slate-100"
                    title="Terminate Record"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedTaskDetails(null)}
                aria-label="Close dialog"
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all duration-150 rounded-xl border border-slate-100 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Mission Specs */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-50 pb-2">Technical Description</h3>
                  <p className="text-slate-600 font-serif text-base leading-relaxed whitespace-pre-wrap">
                    {selectedTaskDetails.description || "No tactical details provided for this operation."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <Calendar className="w-4 h-4 text-emerald-500 mb-3" />
                    <div className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-1 font-bold">Assigned</div>
                    <div className="font-mono text-sm font-black text-slate-900">{new Date(selectedTaskDetails.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className={`p-5 rounded-2xl border ${getDeadlineStyle(selectedTaskDetails.timelineEnd, selectedTaskDetails.status === 'completed')}`}>
                    <Clock className="w-4 h-4 mb-3" />
                    <div className="font-mono text-xs uppercase tracking-widest opacity-80 mb-1 font-bold">Target Deadline</div>
                    <div className="font-mono text-sm font-black">{selectedTaskDetails.timelineEnd || "Open Timeline"}</div>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-50 pb-2">Operation Status</h3>
                  <div className="flex items-center gap-4">
                    <div className={`px-6 py-3 rounded-full font-mono text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 ${
                      selectedTaskDetails.status === 'completed' 
                      ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/10' 
                      : 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
                    }`}>
                      {selectedTaskDetails.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      {selectedTaskDetails.status}
                    </div>
                    {selectedTaskDetails.timelineEnd && selectedTaskDetails.status !== 'completed' && (
                      <span className="font-mono text-xs font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                        {getTimeRemaining(selectedTaskDetails.timelineEnd)}
                      </span>
                    )}
                  </div>
                </div>

                {isManager && selectedTaskDetails.status !== 'completed' && (
                  <div className="space-y-4 pt-4">
                    <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-400">Command Actions</h3>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleStatusChange(selectedTaskDetails.id, 'completed', selectedTaskDetails)}
                        className="w-full bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-emerald-400 transition-all duration-150 shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center justify-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5" /> Authorize Completion
                      </button>
                      {selectedTaskDetails.status === 'in-review' && (
                        <button
                          onClick={() => handleStatusChange(selectedTaskDetails.id, 'in-progress', selectedTaskDetails)}
                          className="w-full border border-orange-200 text-orange-600 bg-orange-50 font-mono text-xs font-black uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-orange-100 transition-all duration-150 active:scale-95"
                        >
                          Request Revision
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Trail & Field Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
              {/* Field Reports */}
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-600 whitespace-nowrap flex items-center gap-3">
                    <MessageSquare className="w-4 h-4" /> Field Reports ({reports.length})
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                </div>

                <div className="space-y-6">
                  {reports.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/30">
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-400">No telemetry data recorded.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {reports.map((report, idx) => (
                        <motion.div
                          key={report.id}
                          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                          className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-mono text-xs font-black text-slate-400">
                                #{idx + 1}
                              </div>
                              <div className="font-mono text-xs font-black uppercase tracking-widest text-slate-400">
                                Transmission Logged
                              </div>
                            </div>
                            <div className="font-mono text-xs font-black text-slate-400">
                              {new Date(report.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-slate-700 font-serif text-base leading-relaxed pl-11">
                            "{report.content}"
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Trail */}
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <h3 className="font-mono text-xs font-black uppercase tracking-[0.3em] text-slate-600 whitespace-nowrap flex items-center gap-3">
                    <History className="w-4 h-4" /> Audit Trail ({logs.length})
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                </div>

                <div className="space-y-4">
                  {isLoadingLogs ? (
                    <div className="flex justify-center p-8">
                      <Activity className="w-6 h-6 text-emerald-500 animate-spin" />
                    </div>
                  ) : logsError ? (
                    <div className="text-center py-8">
                      <p className="font-mono text-xs text-orange-500">{logsError}</p>
                      <button onClick={() => { setLogsError(null); fetchLogs(); }} className="mt-2 px-4 py-2 text-xs font-mono text-emerald-500 hover:text-emerald-400">Retry</button>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/30">
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-400">No audit data available.</p>
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-8 border-l border-slate-100">
                      {logs.map((log, idx) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[31px] top-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs font-black uppercase tracking-[0.1em] text-emerald-600">{log.event}</span>
                              <span className="font-mono text-xs font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-500 font-serif text-xs">
                              {log.event === 'STATUS_TRANSITION' || log.event === 'STATUS_CHANGED' ? (
                                <>Transit from <span className="text-slate-900 font-bold">{log.oldValue}</span> to <span className="text-emerald-600 font-bold">{log.newValue}</span></>
                              ) : (
                                log.newValue || log.event
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Decoration */}
          <div className="p-6 bg-slate-50 flex justify-center sticky bottom-0 border-t border-slate-100">
             <div className="flex items-center gap-10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="font-mono text-xs uppercase tracking-widest font-black text-slate-400">Secure Line Active</span>
                 </div>
                 <div className="h-4 w-[1px] bg-slate-200"></div>
                 <div className="font-mono text-xs uppercase tracking-widest font-black text-slate-400">ID: {selectedTaskDetails.id}</div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
