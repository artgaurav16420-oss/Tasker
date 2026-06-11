import { Dispatch, SetStateAction, useMemo } from "react";
import { Avatar } from "../Avatar";
import {
  Users,
  Trash2,
  Calendar,
  Activity,
  Plus
} from "lucide-react";
import { motion } from "motion/react";
import { UserProfile, Task, NewTaskForm } from "../../lib/types";
import { useReducedMotion } from "../../lib/hooks/useReducedMotion";

interface Props {
  employees: UserProfile[];
  teamTasks: Task[];
  handleRemoveEmployee: (id: string) => void;
  setSelectedEmployee: (emp: UserProfile | null) => void;
  setNewTask: Dispatch<SetStateAction<NewTaskForm>>;
  setIsTaskModalOpen: (open: boolean) => void;
}

export default function PersonnelRoster({
  employees,
  teamTasks,
  handleRemoveEmployee,
  setSelectedEmployee,
  setNewTask,
  setIsTaskModalOpen,
}: Props) {
  const reducedMotion = useReducedMotion();

  const taskCountsByUser = useMemo(() => {
    const counts: Record<string, { active: number; total: number }> = {};
    employees.forEach(emp => { counts[emp.uid] = { active: 0, total: 0 }; });
    teamTasks.forEach(task => {
      if (task.employeeId && counts[task.employeeId]) {
        counts[task.employeeId].total++;
        if (task.status !== "completed") counts[task.employeeId].active++;
      }
    });
    return counts;
  }, [employees, teamTasks]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-700 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rotate-45 shadow-sm"></div>
            <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Personnel</h2>
          </div>
          <h2 className="font-mono text-2xl text-slate-900 dark:text-slate-100 -tracking-[0.025em] tracking-tight">
            Team Roster ({employees.length})
          </h2>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-16 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-inner">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-bold">
            No operatives assigned
          </p>
          <p className="font-mono text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-md mx-auto">
            Team members will appear here once they join your reporting structure via the Settings panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...employees].sort((a, b) => a.name.localeCompare(b.name)).map((emp, idx) => (
            <motion.div
              key={emp.uid}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { delay: idx * 0.05 }}
              className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-slate-900/40 hover:border-emerald-500/30 transition-all duration-150 cursor-pointer shadow-sm dark:shadow-slate-900/20 active:scale-[0.98]"
              onClick={() => setSelectedEmployee(emp)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedEmployee(emp); } }}
              role="button"
              tabIndex={0}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveEmployee(emp.uid); }}
                className="absolute top-4 right-4 p-2 text-slate-200 dark:text-slate-600 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-150 z-10"
                title="Remove from Team"
                aria-label={`Remove ${emp.name} from team`}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-6 pr-8">
                <div className="w-14 h-14 rounded-full border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-sm dark:shadow-slate-900/20">
                  <Avatar name={emp.name} size={56} className="rounded-full" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-mono text-xl text-slate-900 dark:text-slate-100 -tracking-[0.025em] truncate group-hover:text-emerald-600 transition-colors duration-150" title={emp.name}>
                    {emp.name}
                  </h3>
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mt-1 truncate" title={emp.email}>
                    {emp.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                  <Activity className="w-4 h-4 text-emerald-500 mx-auto mb-2" />
                  <div className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Active</div>
                  <div className="font-mono text-xl text-slate-900 dark:text-slate-100 mt-1">{(taskCountsByUser[emp.uid] || { active: 0, total: 0 }).active}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                  <Calendar className="w-4 h-4 text-indigo-500 mx-auto mb-2" />
                  <div className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Total</div>
                  <div className="font-mono text-xl text-slate-900 dark:text-slate-100 mt-1">{(taskCountsByUser[emp.uid] || { active: 0, total: 0 }).total}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewTask({ title: '', description: '', employeeId: emp.uid, timelineEnd: '', priority: 'medium' });
                    setIsTaskModalOpen(true);
                  }}
                  className="p-4 bg-white dark:bg-slate-800 border border-dashed border-emerald-300 dark:border-emerald-500/30 rounded-2xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all duration-150 flex flex-col items-center justify-center group/add"
                >
                  <Plus className="w-4 h-4 mb-1 group-hover/add:scale-125 transition-transform duration-150" />
                  <div className="font-mono text-xs uppercase tracking-widest font-bold">Assign</div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
