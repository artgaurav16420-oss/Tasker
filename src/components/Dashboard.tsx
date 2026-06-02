// src/components/Dashboard.tsx
import { useState, useEffect, useCallback, useMemo, useRef, FormEvent } from "react";
import { useAuthStore } from "../lib/store";
import { Task, UserProfile, PersonalTask, Report } from "../lib/types";
import { supabase } from "../lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";
import { Users, LayoutGrid, CheckCircle, LogOut, Copy, Activity, Settings, SunMoon } from "lucide-react";

import ErrorBoundary from "./ErrorBoundary";
import TaskAssignmentModal from "./modals/TaskAssignmentModal";
import ReportSubmissionModal from "./modals/ReportSubmissionModal";
import TaskDetailsModal from "./modals/TaskDetailsModal";
import EditTaskModal from "./modals/EditTaskModal";
import NewPersonalTaskModal from "./modals/NewPersonalTaskModal";
import EmployeeTasksModal from "./modals/EmployeeTasksModal";
import TeamOperationsBoard from "./features/TeamOperationsBoard";
import PersonalTasksList from "./features/PersonalTasksList";
import PersonnelRoster from "./features/PersonnelRoster";
import SettingsPanel from "./features/SettingsPanel";
import AssignedToMeBoard from "./features/AssignedToMeBoard";
import CommandOverview from "./features/CommandOverview";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { Skeleton } from "./Skeleton";
import { SkipLink } from "./SkipLink";
import { useThemeStore } from "../lib/hooks/useThemeStore";

import { useTaskOperations } from "../lib/hooks/useTaskOperations";
import { useTeamManagement } from "../lib/hooks/useTeamManagement";
import { useDashboardData } from "../lib/hooks/useDashboardData";
import { useDashboardModals } from "../lib/hooks/useDashboardModals";
import { useSessionActions } from "../lib/hooks/useSessionActions";
import { useReducedMotion } from "../lib/hooks/useReducedMotion";
import { getDeadlineStyle } from "../lib/utils";

export default function Dashboard() {
  const { profile } = useAuthStore();
  const reducedMotion = useReducedMotion();

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const getTimeRemaining = useCallback((deadline: string) => {
    if (!deadline) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = parseLocalDate(deadline);
    if (!end || isNaN(end.getTime())) return null;
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    return `Due in ${diffDays}d`;
  }, []);

  const [activeTab, setActiveTab] = useState<"command" | "assigned-to-me" | "my-tasks" | "team" | "personnel" | "settings">("assigned-to-me");

  const {
    isTaskModalOpen, setIsTaskModalOpen,
    isPersonalTaskModalOpen, setIsPersonalTaskModalOpen,
    newTask, setNewTask,
    newPersonalTask, setNewPersonalTask,
    selectedTask, setSelectedTask,
    selectedTaskDetails, setSelectedTaskDetails,
    editingTask, setEditingTask,
    selectedEmployee, setSelectedEmployee,
    reportContent, setReportContent,
    isSubmittingReport, setIsSubmittingReport,
    isCreatingTask, setIsCreatingTask,
    isUpdatingTask, setIsUpdatingTask,
    isDeletingTask, setIsDeletingTask,
    isTogglingPersonalTask, setIsTogglingPersonalTask,
    confirmDialog, setConfirmDialog,
    isConfirming, setIsConfirming,
  } = useDashboardModals();
  const [managerCode, setManagerCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [memberCode, setMemberCode] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  interface Toast { message: string; type: 'success' | 'error' | 'info' }
  const [toastQueue, setToastQueue] = useState<Toast[]>([]);
  const toastTimersRef = useRef<number[]>([]);

  const superiorIdsCache = useMemo(() => {
    if (!profile) return "[]";
    const ids = new Set([...(profile.managerIds || [])]);
    return JSON.stringify(Array.from(ids).sort());
  }, [profile?.managerIds]);

  // Custom Hook for Data Fetching & Subscriptions
  const { employees, setEmployees, myTasks, setMyTasks, teamTasks, setTeamTasks, managedReports, setManagedReports, personalTasks, setPersonalTasks, superiors, setSuperiors, error, isLoading, refetch } = useDashboardData(profile, superiorIdsCache);



  const isManager = employees.length > 0;
  const isOperative = superiors.length > 0 || myTasks.length > 0;

  const initialTabSetRef = useRef(false);

  const orderedTabs: ("command" | "assigned-to-me" | "my-tasks" | "team" | "personnel" | "settings")[] = ["assigned-to-me", "team", "my-tasks", "personnel", "command", "settings"];

  const pendingReviewRef = useRef<Task | null>(null);

  // Ensure valid tab section on initial mount only
  useEffect(() => {
    if (initialTabSetRef.current) return;
    initialTabSetRef.current = true;
    const available = orderedTabs.filter((tab) => {
      if (tab === "assigned-to-me") return isOperative;
      if (tab === "team" || tab === "personnel" || tab === "command") return isManager;
      return true;
    });
    if (!available.includes(activeTab)) setActiveTab(available[0]);
  }, [isManager, isOperative]);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastQueue((prev) => [...prev, { message: msg, type }]);
    const timer = window.setTimeout(() => {
      setToastQueue((prev) => prev.slice(1));
      toastTimersRef.current = toastTimersRef.current.filter(t => t !== timer);
    }, type === 'error' ? 6000 : 3000);
    toastTimersRef.current.push(timer);
  }, []);

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach(clearTimeout);
      toastTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (selectedTask === null) setReportContent("");
  }, [selectedTask]);

  useEffect(() => {
    if (error) showToast(error);
  }, [error]);

  // Task 4: hooks
  const {
    handleCreateTask: _handleCreateTask,
    handleUpdateTask: _handleUpdateTask,
    handleDeleteTask,
    handleStatusChange,
    handleCreatePersonalTask: _handleCreatePersonalTask,
    handleTogglePersonalTask,
    handleDeletePersonalTask,
    handleSubmitReport: _handleSubmitReport,
  } = useTaskOperations({
    profile,
    setIsTaskModalOpen,
    setNewTask,
    setEditingTask,
    selectedTaskDetails,
    setSelectedTaskDetails,
    setConfirmDialog,
    showToast,
    setIsCreatingTask,
    setIsUpdatingTask,
    setIsDeletingTask,
    setIsTogglingPersonalTask,
    onPersonalTaskCreated: (task) => {
      setPersonalTasks((prev) => prev.some((t) => t.id === task.id) ? prev : [...prev, task]);
      refetch();
    },
    onTaskCreated: (task) => {
      if (task.employeeId === profile?.uid) setMyTasks((prev) => prev.some((t) => t.id === task.id) ? prev : [...prev, task]);
      if (task.managerId === profile?.uid) setTeamTasks((prev) => prev.some((t) => t.id === task.id) ? prev : [...prev, task]);
      refetch();
    },
    onTaskUpdated: (task) => {
      setMyTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
      setTeamTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
      refetch();
    },
    onTaskDeleted: (taskId) => {
      setMyTasks((prev) => prev.filter((t) => t.id !== taskId));
      setTeamTasks((prev) => prev.filter((t) => t.id !== taskId));
      refetch();
    },
    onStatusChanged: (taskId, newStatus) => {
      setMyTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
      setTeamTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
      refetch();
    },
    onPersonalTaskToggled: (taskId, newStatus) => {
      setPersonalTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
      refetch();
    },
    onPersonalTaskDeleted: (taskId) => {
      setPersonalTasks((prev) => prev.filter((t) => t.id !== taskId));
      refetch();
    },
    onReportCreated: (report) => {
      setManagedReports((prev) => prev.some((r) => r.id === report.id) ? prev : [...prev, report]);
      const reviewTask = pendingReviewRef.current;
      if (reviewTask) {
        pendingReviewRef.current = null;
        handleStatusChange(reviewTask.id, 'in-review', reviewTask);
      }
      refetch();
    },
  });

  const {
    handleUpdateManager: _handleUpdateManager,
    handleAddMember: _handleAddMember,
    handleRemoveSuperior,
    handleRemoveEmployee,
  } = useTeamManagement({
    profile,
    showToast,
    setConfirmDialog,
    onEmployeeAdded: (emp) => setEmployees((prev) => prev.some((e) => e.uid === emp.uid) ? prev : [...prev, emp]),
    onEmployeeRemoved: (employeeId) => setEmployees((prev) => prev.filter((e) => e.uid !== employeeId)),
    onSuperiorAdded: (sup) => setSuperiors((prev) => prev.some((s) => s.uid === sup.uid) ? prev : [...prev, sup]),
    onSuperiorRemoved: (superiorId) => setSuperiors((prev) => prev.filter((s) => s.uid !== superiorId)),
    refetchData: refetch,
  });

  // Adapter wrappers to match existing modal prop signatures
  const handleCreateTask = (e: FormEvent) => _handleCreateTask(e, newTask);
  const handleUpdateTask = (e: FormEvent) => { if (editingTask) _handleUpdateTask(e, editingTask); };
  const handleCreatePersonalTask = (e: FormEvent) =>
    _handleCreatePersonalTask(e, newPersonalTask, setNewPersonalTask, setIsPersonalTaskModalOpen);
  const handleSubmitReport = (e: FormEvent) =>
    _handleSubmitReport(e, selectedTask, reportContent, setReportContent, setSelectedTask, setIsSubmittingReport);
  const handleUpdateManager = (e: FormEvent) =>
    _handleUpdateManager(e, managerCode, setManagerCode, setIsJoining);
  const handleAddMember = (e: FormEvent) =>
    _handleAddMember(e, memberCode, setMemberCode, setIsAddingMember);

  const handleSubmitForReview = useCallback((task: Task) => {
    pendingReviewRef.current = task;
    setSelectedTask(task);
  }, []);

  const { copyId, handleLogout } = useSessionActions({ profile, showToast });

  if (!profile) {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 dark:bg-slate-800 border border-orange-100 dark:border-slate-700 flex items-center justify-center">
            <span className="text-orange-500 font-mono text-xl font-bold">!</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Profile Not Loaded</p>
          <p className="font-mono text-base text-slate-500 dark:text-slate-400 max-w-md">Could not load your profile. This may be a network issue or missing account setup.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
        <nav className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 grid grid-cols-3 items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 border-t-2 border-t-emerald-500/10 shadow-sm">
          <div className="flex items-center gap-4 justify-self-start">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="hidden sm:flex flex-col gap-2">
              <Skeleton variant="text" className="w-16 h-3" />
              <Skeleton variant="text" className="w-32 h-5" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton variant="text" className="w-24 h-5" />
            <Skeleton variant="text" className="w-48 h-3 hidden md:block" />
          </div>
          <div className="flex items-center gap-4 justify-self-end">
            <div className="hidden sm:flex flex-col items-end gap-2">
              <Skeleton variant="text" className="w-16 h-3" />
              <Skeleton variant="text" className="w-28 h-6" />
            </div>
            <Skeleton variant="circular" className="w-10 h-10" />
          </div>
        </nav>
        <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-8 mt-4 md:mt-6">
          <div className="hidden md:flex md:flex-col col-span-12 md:col-span-3 lg:col-span-2 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" className="w-full h-12" />
            ))}
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
            <Skeleton variant="rectangular" className="w-full h-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton variant="rectangular" className="w-full h-32" />
              <Skeleton variant="rectangular" className="w-full h-32" />
            </div>
            <Skeleton variant="rectangular" className="w-full h-40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onRetry={refetch}>
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono selection:bg-emerald-100 selection:text-emerald-900">
        <SkipLink />
        <nav className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 grid grid-cols-3 items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 border-t-2 border-t-emerald-500/10 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-4 justify-self-start overflow-hidden">
            <div className="w-10 h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm overflow-hidden shrink-0">
              <Avatar name={profile.name} size={40} className="rounded-full" />
            </div>
            <div className="hidden sm:flex flex-col overflow-hidden">
              <div className="font-mono text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-black">Member</div>
              <div className="font-mono text-2xl -tracking-[0.025em] text-slate-900 dark:text-slate-100 leading-none mt-1 truncate">{profile.name}</div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-1.5">
              <Logo className="w-8 h-8" />
              <h1 className="font-mono font-black -tracking-[0.025em] tracking-[0.3em] uppercase leading-none text-lg text-slate-900 dark:text-slate-100">Tasker</h1>
            </div>
            <p className="hidden md:block text-xs font-mono uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">Raja Ramanna Centre for Advanced Technology</p>
            <p className="md:hidden text-xs font-mono uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 font-bold">RRCAT</p>
          </div>
          <div className="flex items-center gap-4 justify-self-end">
            <button type="button" className="text-right hidden sm:flex flex-col items-end group cursor-pointer" onClick={copyId} aria-label="Copy User Code">
              <div className="text-xs font-mono uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 font-bold mb-1 group-hover:text-emerald-600 transition-colors">User Code</div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all duration-150 shadow-sm">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 select-all max-w-[100px] truncate" title={profile.uid}>{profile.uid}</span>
                <button type="button" className="hover:scale-110 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2" aria-label="Copy User Code">
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600" />
                </button>
              </div>
            </button>
            <button
              onClick={() => useThemeStore.getState().toggleTheme()}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150 shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              title="Toggle dark mode"
              aria-label="Toggle dark mode"
            >
              <SunMoon className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-all duration-150 shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>

        <div id="main-content" className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-8 mt-4 md:mt-6">
          {/* Mobile horizontal tab bar */}
          <div className="col-span-12 md:hidden overflow-x-auto flex gap-2 px-2 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {isOperative && (
              <button onClick={() => setActiveTab("assigned-to-me")} aria-current={activeTab === "assigned-to-me" ? "page" : undefined} className={`whitespace-nowrap px-4 py-2 rounded-lg flex-shrink-0 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "assigned-to-me" ? "bg-emerald-500 text-slate-950" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}>
                <Activity className="w-3.5 h-3.5" /> Assigned
              </button>
            )}
            {isManager && (
              <button onClick={() => setActiveTab("team")} aria-current={activeTab === "team" ? "page" : undefined} className={`whitespace-nowrap px-4 py-2 rounded-xl flex-shrink-0 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "team" ? "bg-emerald-500 text-slate-950" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}>
                <LayoutGrid className="w-3.5 h-3.5" /> Team
              </button>
            )}
            <button onClick={() => setActiveTab("my-tasks")} aria-current={activeTab === "my-tasks" ? "page" : undefined} className={`whitespace-nowrap px-4 py-2 rounded-lg flex-shrink-0 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "my-tasks" ? "bg-emerald-500 text-slate-950" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}>
              <CheckCircle className="w-3.5 h-3.5" /> Tasks
            </button>
            {isManager && (
              <button onClick={() => setActiveTab("personnel")} aria-current={activeTab === "personnel" ? "page" : undefined} className={`whitespace-nowrap px-4 py-2 rounded-lg flex-shrink-0 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "personnel" ? "bg-emerald-500 text-slate-950" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}>
                <Users className="w-3.5 h-3.5" /> Members
              </button>
            )}
            {isManager && (
              <button onClick={() => setActiveTab("command")} aria-current={activeTab === "command" ? "page" : undefined} className={`whitespace-nowrap px-4 py-2 rounded-lg flex-shrink-0 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "command" ? "bg-emerald-500 text-slate-950" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}>
                <Activity className="w-3.5 h-3.5" /> Command
              </button>
            )}
            <button onClick={() => setActiveTab("settings")} aria-current={activeTab === "settings" ? "page" : undefined} className={`whitespace-nowrap px-4 py-2 rounded-xl flex-shrink-0 font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "settings" ? "bg-emerald-500 text-slate-950" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-700"}`}>
              <Settings className="w-3.5 h-3.5" /> Settings
            </button>
          </div>

          {/* Desktop sidebar nav */}
          <nav className="hidden md:flex md:flex-col col-span-12 md:col-span-3 lg:col-span-2 space-y-3" aria-label="Main navigation">
            {isOperative && (
              <button onClick={() => setActiveTab("assigned-to-me")} aria-current={activeTab === "assigned-to-me" ? "page" : undefined} className={`w-full text-left px-5 py-4 font-mono text-xs uppercase font-bold tracking-[0.2em] flex items-center gap-4 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "assigned-to-me" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent dark:border-slate-700 shadow-sm"}`}>
                <Activity className="w-4 h-4" /> Assigned to Me
              </button>
            )}
            {isManager && (
              <button onClick={() => setActiveTab("team")} aria-current={activeTab === "team" ? "page" : undefined} className={`w-full text-left px-5 py-4 font-mono text-xs uppercase font-bold tracking-[0.2em] flex items-center gap-4 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "team" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent dark:border-slate-700 shadow-sm"}`}>
                <LayoutGrid className="w-4 h-4" /> Team Tasks
              </button>
            )}
            <button onClick={() => setActiveTab("my-tasks")} aria-current={activeTab === "my-tasks" ? "page" : undefined} className={`w-full text-left px-5 py-4 font-mono text-xs uppercase font-bold tracking-[0.2em] flex items-center gap-4 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "my-tasks" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent dark:border-slate-700 shadow-sm"}`}>
              <CheckCircle className="w-4 h-4" /> My Tasks
            </button>
            {isManager && (
              <button onClick={() => setActiveTab("personnel")} aria-current={activeTab === "personnel" ? "page" : undefined} className={`w-full text-left px-5 py-4 font-mono text-xs uppercase font-bold tracking-[0.2em] flex items-center gap-4 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "personnel" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent dark:border-slate-700 shadow-sm"}`}>
                <Users className="w-4 h-4" /> Team Members ({employees.length})
              </button>
            )}
            {isManager && (
              <button onClick={() => setActiveTab("command")} aria-current={activeTab === "command" ? "page" : undefined} className={`w-full text-left px-5 py-4 font-mono text-xs uppercase font-bold tracking-[0.2em] flex items-center gap-4 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "command" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent dark:border-slate-700 shadow-sm"}`}>
                <Activity className="w-4 h-4" /> Command Center
              </button>
            )}
            <button onClick={() => setActiveTab("settings")} aria-current={activeTab === "settings" ? "page" : undefined} className={`w-full text-left px-5 py-4 font-mono text-xs uppercase font-bold tracking-[0.2em] flex items-center gap-4 transition-all rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${activeTab === "settings" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent dark:border-slate-700 shadow-sm"}`}>
              <Settings className="w-4 h-4" /> Settings
            </button>
          </nav>

          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            {/* Task 5: per-tab ErrorBoundary */}
            {activeTab === "assigned-to-me" && (
              <ErrorBoundary>
                <AssignedToMeBoard
                  profile={profile}
                  myTasks={myTasks}
                  superiors={superiors}
                  getDeadlineStyle={getDeadlineStyle}
                  getTimeRemaining={getTimeRemaining}
                  handleStatusChange={handleStatusChange}
                  setSelectedTask={setSelectedTask}
                  setSelectedTaskDetails={setSelectedTaskDetails}
                  onSubmitForReview={handleSubmitForReview}
                />
              </ErrorBoundary>
            )}
            {activeTab === "team" && (
              <ErrorBoundary>
                <TeamOperationsBoard
                  teamTasks={teamTasks}
                  employees={employees}
                  setIsTaskModalOpen={setIsTaskModalOpen}
                  setSelectedTaskDetails={setSelectedTaskDetails}
                  handleDeleteTask={handleDeleteTask}
                  handleStatusChange={handleStatusChange}
                  getDeadlineStyle={getDeadlineStyle}
                  getTimeRemaining={getTimeRemaining}
                />
              </ErrorBoundary>
            )}
            {activeTab === "my-tasks" && (
              <ErrorBoundary>
                <PersonalTasksList
                  personalTasks={personalTasks}
                  setIsPersonalTaskModalOpen={setIsPersonalTaskModalOpen}
                  handleTogglePersonalTask={handleTogglePersonalTask}
                  handleDeletePersonalTask={handleDeletePersonalTask}
                  getTimeRemaining={getTimeRemaining}
                />
              </ErrorBoundary>
            )}
            {activeTab === "personnel" && (
              <ErrorBoundary>
                <PersonnelRoster
                  employees={employees}
                  teamTasks={teamTasks}
                  handleRemoveEmployee={handleRemoveEmployee}
                  setSelectedEmployee={setSelectedEmployee}
                  setNewTask={setNewTask}
                  setIsTaskModalOpen={setIsTaskModalOpen}
                />
              </ErrorBoundary>
            )}
            {activeTab === "command" && (
              <ErrorBoundary>
                <CommandOverview
                  teamTasks={teamTasks}
                  employees={employees}
                />
              </ErrorBoundary>
            )}
            {activeTab === "settings" && (
              <ErrorBoundary>
                <SettingsPanel
                  profile={profile}
                  superiors={superiors}
                  employees={employees}
                  managerCode={managerCode}
                  setManagerCode={setManagerCode}
                  handleUpdateManager={handleUpdateManager}
                  isJoining={isJoining}
                  memberCode={memberCode}
                  setMemberCode={setMemberCode}
                  handleAddMember={handleAddMember}
                  isAddingMember={isAddingMember}
                  handleRemoveSuperior={handleRemoveSuperior}
                  handleRemoveEmployee={handleRemoveEmployee}
                  showToast={showToast}
                />
              </ErrorBoundary>
            )}
          </div>
        </div>

        {/* Modals */}
        <ErrorBoundary>
          <TaskAssignmentModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} newTask={newTask} setNewTask={setNewTask} employees={employees} handleCreateTask={handleCreateTask} isCreating={isCreatingTask} />
        </ErrorBoundary>
        <ErrorBoundary>
          <ReportSubmissionModal selectedTask={selectedTask} setSelectedTask={setSelectedTask} reportContent={reportContent} setReportContent={setReportContent} handleSubmitReport={handleSubmitReport} isSubmittingReport={isSubmittingReport} />
        </ErrorBoundary>
        <ErrorBoundary>
          <EmployeeTasksModal selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} teamTasks={teamTasks} setNewTask={setNewTask} setIsTaskModalOpen={setIsTaskModalOpen} handleDeleteTask={handleDeleteTask} handleStatusChange={handleStatusChange} setSelectedTaskDetails={setSelectedTaskDetails} getDeadlineStyle={getDeadlineStyle} getTimeRemaining={getTimeRemaining} />
        </ErrorBoundary>
        <ErrorBoundary>
          <TaskDetailsModal selectedTaskDetails={selectedTaskDetails} setSelectedTaskDetails={setSelectedTaskDetails} managedReports={managedReports} profile={profile} handleStatusChange={handleStatusChange} setEditingTask={setEditingTask} handleDeleteTask={handleDeleteTask} getTimeRemaining={getTimeRemaining} />
        </ErrorBoundary>
        <ErrorBoundary>
          <EditTaskModal editingTask={editingTask} setEditingTask={setEditingTask} employees={employees} handleUpdateTask={handleUpdateTask} isUpdating={isUpdatingTask} />
        </ErrorBoundary>
        <ErrorBoundary>
          <NewPersonalTaskModal isOpen={isPersonalTaskModalOpen} onClose={() => setIsPersonalTaskModalOpen(false)} newPersonalTask={newPersonalTask} setNewPersonalTask={setNewPersonalTask} handleCreatePersonalTask={handleCreatePersonalTask} />
        </ErrorBoundary>

        <AnimatePresence>
          {confirmDialog.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8" onKeyDown={(e) => { if (e.key === 'Escape') setConfirmDialog((p) => ({ ...p, isOpen: false })); }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }} onClick={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
              <motion.div initial={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.95 }} animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }} exit={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.95 }} transition={{ type: "spring", duration: 0.5, bounce: 0 }} role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl p-10 flex flex-col rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
                <h3 id="confirm-dialog-title" className="font-mono font-black uppercase tracking-[0.3em] text-slate-900 dark:text-slate-100 mb-8 text-base border-b border-slate-50 dark:border-slate-700 pb-6 text-center">{confirmDialog.title}</h3>
                <p id="confirm-dialog-message" className="font-mono text-base text-slate-500 dark:text-slate-400 mb-12 leading-relaxed text-center">"{confirmDialog.message}"</p>
                <div className="flex gap-6">
                  <button autoFocus onClick={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))} className="flex-1 py-4 font-mono text-xs uppercase tracking-[0.2em] text-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all duration-150 rounded-xl font-black shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">Abort</button>
                  <button
                    onClick={async () => {
                      if (isConfirming) return;
                      setIsConfirming(true);
                      try {
                        await Promise.resolve(confirmDialog.onConfirm());
                      } catch (err) {
                        console.error('Confirm dialog error:', err);
                      } finally {
                        setIsConfirming(false);
                      }
                    }}
                    disabled={isConfirming}
                    className={`flex-1 py-4 font-mono text-xs uppercase tracking-[0.2em] text-center font-black transition-all duration-150 rounded-xl shadow-xl flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''} ${confirmDialog.danger ? "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100 shadow-orange-500/5" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20"}`}
                  >
                    {isConfirming ? (
                      <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                    ) : confirmDialog.confirmText}
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toastQueue[0] && (
            <motion.div key={toastQueue[0].message + toastQueue[0].type} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.12 } }} transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }} role="status" aria-live="polite" className={`fixed bottom-10 right-10 z-[120] font-mono text-xs uppercase tracking-[0.25em] font-black px-10 py-5 border rounded-xl shadow-xl ${
              toastQueue[0].type === 'error' ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/20' :
              toastQueue[0].type === 'success' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20' :
              'bg-slate-800 dark:bg-slate-900 text-white border-slate-700 shadow-slate-500/20'
            }`}>
              {toastQueue[0].message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
