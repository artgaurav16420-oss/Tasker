import { X, Send, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../../lib/types";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  reportContent: string;
  setReportContent: (content: string) => void;
  handleSubmitReport: (e: React.FormEvent) => Promise<void>;
  isSubmittingReport: boolean;
}

export default function ReportSubmissionModal({
  selectedTask,
  setSelectedTask,
  reportContent,
  setReportContent,
  handleSubmitReport,
  isSubmittingReport,
}: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {selectedTask && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            onClick={() => setSelectedTask(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.95 }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-submission-title"
            className="relative w-full max-w-2xl bg-white border border-slate-100 shadow-2xl p-6 sm:p-10 flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="font-mono text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-2 block">Field Report</span>
                <h2 id="report-submission-title" className="font-serif text-xl text-slate-900 -tracking-[0.025em] tracking-tight pr-8">{selectedTask.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-3 rounded-full transition-all duration-150"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="report-content" className="text-xs font-mono font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Transmission Content</label>
                <textarea
                  id="report-content"
                  required
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-700 min-h-[200px] focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all duration-150 resize-none font-serif text-base leading-relaxed"
                  placeholder="Detail the operational progress..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingReport || !reportContent.trim()}
                  className="bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-[0.2em] py-5 px-8 hover:bg-emerald-400 transition-all duration-150 rounded-xl shadow-xl shadow-emerald-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 w-full sm:w-auto"
                >
                  {isSubmittingReport ? (
                    <Activity className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Transmit Report
                    </>
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
