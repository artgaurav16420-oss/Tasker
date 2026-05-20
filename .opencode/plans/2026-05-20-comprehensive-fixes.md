# Tasker Comprehensive Fix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 50 murderboard findings across security, type safety, state management, architecture, and error handling to deliver a robust, polished task management experience.

**Architecture:** 4 sequential phases — (1) UX/Error fixes for immediate user benefit, (2) Type safety for compile-time correctness, (3) State/Realtime stability for data integrity, (4) Architecture cleanup + SQL hardening. Each phase builds on the previous and is independently testable.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Supabase (Postgres + Realtime), Framer Motion

---

## Phase 1: UX & Error Handling (Immediate User Impact)

### Task 1.1: Add toast severity types — errors in red/orange, success in green

**Files:**
- Modify: `src/components/Dashboard.tsx:78,139-145,538-542`
- Modify: `src/lib/hooks/useTaskOperations.ts:13,80-318` (all showToast calls)

- [ ] **Step 1: Update toast state to carry severity**

In `Dashboard.tsx` line 78, replace:
```tsx
const [toastQueue, setToastQueue] = useState<string[]>([]);
```
With:
```tsx
interface Toast { message: string; type: 'success' | 'error' | 'info' }
const [toastQueue, setToastQueue] = useState<Toast[]>([]);
```

- [ ] **Step 2: Update showToast to accept severity**

Replace lines 139-145:
```tsx
const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  setToastQueue((prev) => [...prev, { message: msg, type }]);
  const timer = window.setTimeout(() => {
    setToastQueue((prev) => prev.slice(1));
    toastTimersRef.current = toastTimersRef.current.filter(t => t !== timer);
  }, type === 'error' ? 6000 : 3000);
  toastTimersRef.current.push(timer);
}, []);
```

- [ ] **Step 3: Update toast rendering with color variants**

Replace lines 538-542:
```tsx
{toastQueue[0] && (
  <motion.div key={toastQueue[0].message + toastQueue[0].type} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }} role="status" aria-live="polite" className={`fixed bottom-10 right-10 z-[120] font-mono text-xs uppercase tracking-[0.25em] font-black px-10 py-5 border rounded-xl shadow-xl ${
    toastQueue[0].type === 'error' ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/20' :
    toastQueue[0].type === 'success' ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20' :
    'bg-slate-800 text-white border-slate-700 shadow-slate-500/20'
  }`}>
    {toastQueue[0].message}
  </motion.div>
)}
```

- [ ] **Step 4: Update showToast type in useTaskOperations.ts**

Line 13, replace:
```tsx
showToast: (msg: string) => void;
```
With:
```tsx
showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
```

- [ ] **Step 5: Update all showToast calls in useTaskOperations.ts**

Add severity as second argument to every call:
- Line 80: `showToast('Task created successfully', 'success');`
- Line 83: `showToast('Failed to create task. Please try again.', 'error');`
- Line 94: `showToast('Unauthorized: Only the task manager can modify this operation.', 'error');`
- Line 125: `showToast('Task updated successfully', 'success');`
- Line 128: `showToast('Failed to update task. Please try again.', 'error');`
- Line 138: `showToast('Unauthorized: Only the creator can terminate this operation.', 'error');`
- Line 153: `showToast('Task and associated reports purged.', 'success');`
- Line 157: `showToast('Failed to delete task. Please try again.', 'error');`
- Line 171: `showToast('Only the manager can finalize this task.', 'error');`
- Line 199: `showToast(\`Status updated to ${newStatus}\`, 'success');`
- Line 202: `showToast(\`Failed to update status to ${newStatus}. Please try again.\`, 'error');`
- Line 231: `showToast('Personal task added', 'success');`
- Line 234: `showToast('Operation failed. Please try again.', 'error');`
- Line 250: `showToast('Failed to update task. Please try again.', 'error');`
- Line 267: `showToast('Task Deleted', 'success');`
- Line 270: `showToast('Operation failed. Please try again.', 'error');`
- Line 288: `showToast('Operation report must contain data.', 'error');`
- Line 294: `showToast('Unauthorized: You are not linked to this operation.', 'error');`
- Line 318: `showToast('Operation failed. Please try again.', 'error');`

- [ ] **Step 6: Verify build**

Run: `npm run lint`
Expected: PASS

---

### Task 1.2: Separate log insert from main operation try/catch

**Files:**
- Modify: `src/lib/hooks/useTaskOperations.ts:50-87` (handleCreateTask)
- Modify: `src/lib/hooks/useTaskOperations.ts:166-204` (handleStatusChange)

- [ ] **Step 1: Fix handleCreateTask**

Replace lines 50-87:
```tsx
const handleCreateTask = async (e: FormEvent, newTask: NewTaskForm) => {
  e.preventDefault();
  if (!profile) return;
  setIsCreatingTask?.(true);
  try {
    const payload: Record<string, unknown> = {
      title: newTask.title,
      description: newTask.description,
      managerId: profile.uid,
      employeeId: newTask.employeeId,
      status: 'todo',
      priority: newTask.priority || 'medium',
    };
    if (newTask.timelineEnd) payload.timelineEnd = newTask.timelineEnd;
    const { data: createdTask, error: insertError } = await supabase.from('tasks').insert(payload).select().single();
    if (insertError) throw insertError;
    if (!createdTask) throw new Error('Task was created but no data returned. Check RLS policies.');

    onTaskCreated?.(createdTask as Task);

    setIsTaskModalOpen(false);
    setNewTask({ title: '', description: '', employeeId: '', timelineEnd: '', priority: 'medium' });
    showToast('Task created successfully', 'success');

    supabase.from('logs').insert({
      taskId: (createdTask as Record<string, unknown>).id as string,
      userId: profile.uid,
      event: 'TASK_CREATED',
      newValue: 'Operation Initialized'
    }).catch((err) => console.error('Failed to create audit log:', err));
  } catch (err) {
    console.error(err);
    showToast('Failed to create task. Please try again.', 'error');
  } finally {
    setIsCreatingTask?.(false);
  }
};
```

- [ ] **Step 2: Fix handleStatusChange**

Replace lines 166-204:
```tsx
const handleStatusChange = async (taskId: string, newStatus: Task['status'], task?: Task) => {
  try {
    if (!profile) return;
    if (!task) {
      showToast('Task data not available. Please refresh.', 'error');
      return;
    }
    if (newStatus === 'completed' && profile?.uid !== task.managerId) {
      showToast('Only the manager can finalize this task.', 'error');
      return;
    }

    const oldStatus = task?.status;

    const { data: updatedTask } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .select()
      .single()
      .throwOnError();

    onStatusChanged?.(taskId, newStatus);

    if (selectedTaskDetails?.id === taskId) {
      setSelectedTaskDetails({ ...selectedTaskDetails, status: newStatus });
    }

    showToast(`Status updated to ${newStatus}`, 'success');

    supabase.from('logs').insert({
      taskId,
      userId: profile.uid,
      event: 'STATUS_TRANSITION',
      oldValue: oldStatus,
      newValue: newStatus
    }).catch((err) => console.error('Failed to create audit log:', err));
  } catch (err) {
    console.error(err);
    showToast(`Failed to update status to ${newStatus}. Please try again.`, 'error');
  }
};
```

- [ ] **Step 3: Verify build**

Run: `npm run lint`

---

### Task 1.3: Fix handleCreatePersonalTask — show error on failure

**Files:**
- Modify: `src/lib/hooks/useTaskOperations.ts:206-236`

- [ ] **Step 1: Replace handleCreatePersonalTask**

```tsx
const handleCreatePersonalTask = async (
  e: FormEvent,
  newPersonalTask: { title: string; timelineEnd: string },
  setNewPersonalTask: Dispatch<SetStateAction<{ title: string; timelineEnd: string }>>,
  setIsPersonalTaskModalOpen: (v: boolean) => void,
) => {
  e.preventDefault();
  if (!profile || !newPersonalTask.title.trim()) return;
  try {
    const payload: Record<string, unknown> = {
      title: newPersonalTask.title.trim(),
      status: 'todo' as const,
      userId: profile.uid,
    };
    if (newPersonalTask.timelineEnd) payload.timelineEnd = newPersonalTask.timelineEnd;
    const { data: createdTask, error: insertError } = await supabase
      .from('personal_tasks')
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    if (!createdTask) throw new Error('Personal task was created but no data returned.');

    onPersonalTaskCreated?.(createdTask as PersonalTask);
    setNewPersonalTask({ title: '', timelineEnd: '' });
    setIsPersonalTaskModalOpen(false);
    showToast('Personal task added', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to add personal task. Please try again.', 'error');
  }
};
```

- [ ] **Step 2: Verify build**

Run: `npm run lint`

---

### Task 1.4: Add error state to TaskDetailsModal log fetch

**Files:**
- Modify: `src/components/modals/TaskDetailsModal.tsx`

- [ ] **Step 1: Read the file first to understand current structure**

- [ ] **Step 2: Add logsError state**

Add near the existing useState declarations:
```tsx
const [logsError, setLogsError] = useState<string | null>(null);
```

- [ ] **Step 3: Update fetchLogs catch block**

In the catch block of fetchLogs, replace `console.error(err)` with:
```tsx
catch (err) {
  console.error(err);
  setLogsError('Failed to load audit logs.');
  setLogs([]);
  setIsLoadingLogs(false);
}
```

- [ ] **Step 4: Reset logsError when task changes**

At the start of the useEffect that fetches logs, add:
```tsx
setLogsError(null);
```

- [ ] **Step 5: Add error UI in render**

Where "No audit data available" is rendered, add before it:
```tsx
{logsError && (
  <div className="text-center py-8">
    <p className="font-mono text-xs text-orange-500">{logsError}</p>
    <button onClick={() => { setLogsError(null); fetchLogs(); }} className="mt-2 px-4 py-2 text-xs font-mono text-emerald-500 hover:text-emerald-400">Retry</button>
  </div>
)}
```

- [ ] **Step 6: Verify build**

Run: `npm run lint`

---

### Task 1.5: Wrap all modals in ErrorBoundary + wire outer ErrorBoundary to refetch

**Files:**
- Modify: `src/components/Dashboard.tsx:312,498-503`
- Modify: `src/components/ErrorBoundary.tsx`

- [ ] **Step 1: Read ErrorBoundary.tsx**

- [ ] **Step 2: Update ErrorBoundary to accept onRetry prop**

Add to Props interface:
```tsx
interface Props {
  children: React.ReactNode;
  onRetry?: () => void;
}
```

Update the component function signature and handleReset:
```tsx
export default function ErrorBoundary({ children, onRetry }: Props) {
  // ...
  const handleReset = () => {
    setResetKey(k => k + 1);
    setHasError(false);
    onRetry?.();
  };
  // ...
}
```

- [ ] **Step 3: Wire outer ErrorBoundary to refetch**

Line 312, replace `<ErrorBoundary>` with:
```tsx
<ErrorBoundary onRetry={refetch}>
```

- [ ] **Step 4: Wrap each modal in ErrorBoundary**

Replace lines 498-503:
```tsx
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
  <TaskDetailsModal selectedTaskDetails={selectedTaskDetails} setSelectedTaskDetails={setSelectedTaskDetails} managedReports={managedReports} profile={profile} handleStatusChange={handleStatusChange} setEditingTask={setEditingTask} handleDeleteTask={handleDeleteTask} getDeadlineStyle={getDeadlineStyle} getTimeRemaining={getTimeRemaining} />
</ErrorBoundary>
<ErrorBoundary>
  <EditTaskModal editingTask={editingTask} setEditingTask={setEditingTask} employees={employees} handleUpdateTask={handleUpdateTask} isUpdating={isUpdatingTask} />
</ErrorBoundary>
<ErrorBoundary>
  <NewPersonalTaskModal isOpen={isPersonalTaskModalOpen} onClose={() => setIsPersonalTaskModalOpen(false)} newPersonalTask={newPersonalTask} setNewPersonalTask={setNewPersonalTask} handleCreatePersonalTask={handleCreatePersonalTask} />
</ErrorBoundary>
```

- [ ] **Step 5: Verify build**

Run: `npm run lint`

---

### Task 1.6: Fix confirm dialog error swallowing

**Files:**
- Modify: `src/components/Dashboard.tsx:516-522`

- [ ] **Step 1: Replace confirm dialog onClick handler**

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run lint`

---

### Task 1.7: Remove 'completed' from EditTaskModal + fix button color

**Files:**
- Modify: `src/components/modals/EditTaskModal.tsx:146-160,182`

- [ ] **Step 1: Remove completed option from status dropdown**

Replace lines 146-160:
```tsx
{/* Status */}
<div className="space-y-2">
  <label className="font-mono text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Live Status</label>
  <select
    required
    value={editingTask.status}
    onChange={(e) => { if (isValidStatus(e.target.value)) setEditingTask({ ...editingTask, status: e.target.value }); }}
    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-bold uppercase tracking-wider"
  >
    <option value="todo">Pending Deployment</option>
    <option value="in-progress">In Progress</option>
    <option value="in-review">Under Review</option>
  </select>
  <p className="font-mono text-[10px] text-slate-400 mt-1">To complete a task, use the status action buttons.</p>
</div>
```

- [ ] **Step 2: Fix submit button to use emerald (design system)**

Line 182, replace `bg-slate-900 text-white` with `bg-emerald-500 text-slate-950` and `hover:bg-slate-800` with `hover:bg-emerald-400`:
```tsx
className="w-full bg-emerald-500 text-slate-950 font-mono text-xs font-black uppercase tracking-[0.3em] py-6 rounded-xl hover:bg-emerald-400 transition-all duration-150 shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
```

- [ ] **Step 3: Verify build**

Run: `npm run lint`

---

### Task 1.8: Fix TaskAssignmentModal submit button color

**Files:**
- Modify: `src/components/modals/TaskAssignmentModal.tsx`

- [ ] **Step 1: Read the file to find the submit button**

- [ ] **Step 2: Change bg-slate-900 to bg-emerald-500**

Find the submit button and replace `bg-slate-900 text-white` with `bg-emerald-500 text-slate-950` and `hover:bg-slate-800` with `hover:bg-emerald-400`.

- [ ] **Step 3: Verify build**

Run: `npm run lint`

---

### Task 1.9: Fix Avatar null safety + delete dead utils

**Files:**
- Modify: `src/components/Avatar.tsx:9-16`
- Modify: `src/lib/utils.ts:28-46`

- [ ] **Step 1: Fix getInitials**

```tsx
function getInitials(name: string) {
  if (!name || name.trim() === '') return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}
```

- [ ] **Step 2: Delete dead utility functions**

In `utils.ts`, delete `getStatusDotColor` and `getStatusLabel` (lines 28-46).

- [ ] **Step 3: Verify build**

Run: `npm run lint`

---

### Task 1.10: Fix CommandOverview percentages + PersonnelRoster performance

**Files:**
- Modify: `src/components/features/CommandOverview.tsx`
- Modify: `src/components/features/PersonnelRoster.tsx`

- [ ] **Step 1: Fix CommandOverview**

Add useMemo:
```tsx
const activeTeamTasks = useMemo(() => teamTasks.filter(t => t.status !== 'completed'), [teamTasks]);
```

Replace all `teamTasks.length` in PriorityRow with `activeTeamTasks.length`.

- [ ] **Step 2: Fix PersonnelRoster**

Add useMemo before the .map():
```tsx
const taskCountsByUser = useMemo(() => {
  const counts: Record<string, { active: number; total: number }> = {};
  employees.forEach(emp => { counts[emp.uid] = { active: 0, total: 0 }; });
  teamTasks.forEach(task => {
    if (task.employeeId && counts[task.employeeId]) {
      counts[task.employeeId].total++;
      if (task.status !== 'completed') counts[task.employeeId].active++;
    }
  });
  return counts;
}, [employees, teamTasks]);
```

In the .map(), replace individual filter calls with:
```tsx
const counts = taskCountsByUser[emp.uid] || { active: 0, total: 0 };
```

- [ ] **Step 3: Verify build**

Run: `npm run lint`

---

## Phase 2: Type Safety (Compile-Time Correctness)

### Task 2.1: Fix types.ts — align with DB schema

**Files:**
- Modify: `src/lib/types.ts` (entire file)

- [ ] **Step 1: Rewrite types.ts**

```tsx
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  managerIds?: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  managerId: string;
  employeeId: string | null;
  status: 'todo' | 'in-progress' | 'in-review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timelineEnd?: string | null;
  createdAt: string;
  updatedAt: number;
}

export interface Report {
  id: string;
  taskId: string;
  employeeId: string;
  managerId: string;
  content: string;
  createdAt: string;
}

export interface PersonalTask {
  id: string;
  title: string;
  status: 'todo' | 'completed';
  userId: string;
  timelineEnd?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  taskId: string;
  userId: string;
  event: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface NewTaskForm {
  title: string;
  description: string;
  employeeId: string;
  timelineEnd: string;
  priority: Task['priority'];
}

export interface NewPersonalTaskForm {
  title: string;
  timelineEnd: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}
```

- [ ] **Step 2: Fix downstream type errors**

Key fixes needed after types change:

**Dashboard.tsx line 85:** Remove `profile.managerId` reference:
```tsx
const ids = new Set([...(profile.managerIds || [])]);
```

**EditTaskModal.tsx:** Handle nullable fields:
- Line 100: `value={editingTask.description || ''}`
- Line 115: `value={editingTask.employeeId || ''}`

**useTaskOperations.ts:** Remove `updatedAt: Date.now()` from all payloads (lines 62, 106, 179).

**useDashboardData.ts:** All `as Task`/`as UserProfile` casts are now more accurate since types match DB reality.

- [ ] **Step 3: Run type check and fix iteratively**

Run: `npm run lint`
Fix any remaining type errors.

---

### Task 2.2: Type Realtime payload handlers — eliminate all `any`

**Files:**
- Modify: `src/lib/hooks/useDashboardData.ts:1,24,238-344`

- [ ] **Step 1: Add imports**

```tsx
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js';
```

- [ ] **Step 2: Type activeChannelsRef**

Line 24:
```tsx
const activeChannelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
```

- [ ] **Step 3: Type each handler**

```tsx
const handleUserChange = (payload: RealtimePostgresChangesPayload<{ uid: string; managerIds: string[]; name: string; email: string; createdAt: string }>) => {
  const newManagerIds = (payload.newType === 'INSERT' || payload.newType === 'UPDATE')
    ? ((payload.new as Record<string, unknown>)?.managerIds as string[] | undefined) || []
    : [];
  const oldManagerIds = (payload.oldType === 'UPDATE' || payload.oldType === 'DELETE')
    ? ((payload.old as Record<string, unknown>)?.managerIds as string[] | undefined) || []
    : [];
  const safeNewManagerIds = Array.isArray(newManagerIds) ? newManagerIds : [];
  const safeOldManagerIds = Array.isArray(oldManagerIds) ? oldManagerIds : [];
  // ... rest of handler uses safeNewManagerIds/safeOldManagerIds
```

```tsx
const handleTaskInsert = (payload: RealtimePostgresChangesPayload<Task>) => {
  const task = payload.new as Task;
  // ... rest unchanged
```

```tsx
const handleTaskUpdate = (payload: RealtimePostgresChangesPayload<Task>) => {
  const updated = payload.new as Task;
  const old = payload.old as Task;
  // ... rest unchanged
```

```tsx
const handleTaskDelete = (payload: RealtimePostgresChangesPayload<Task>) => {
  const old = payload.old as Task;
  // ... rest unchanged
```

```tsx
const handleReportChange = async (payload: RealtimePostgresChangesPayload<Report>) => {
  // ... rest unchanged
```

```tsx
const handlePersonalTaskInsert = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
  // ... rest unchanged
```

```tsx
const handlePersonalTaskUpdate = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
  // ... rest unchanged
```

```tsx
const handlePersonalTaskDelete = (payload: RealtimePostgresChangesPayload<PersonalTask>) => {
  // ... rest unchanged
```

- [ ] **Step 4: Verify build**

Run: `npm run lint`

---

### Task 2.3: Remove updatedAt from client payloads

**Files:**
- Modify: `src/lib/hooks/useTaskOperations.ts:62,106,179`

- [ ] **Step 1: Remove updatedAt lines**

- Line 62: Delete `updatedAt: Date.now(),`
- Line 106: Delete `updatedAt: Date.now(),`
- Line 179: Delete `updatedAt: Date.now()` from the update object

- [ ] **Step 2: Verify build**

Run: `npm run lint`

---

### Task 2.4: Fix onTaskDeleted callback signature

**Files:**
- Modify: `src/lib/hooks/useTaskOperations.ts:21,152`

- [ ] **Step 1: Simplify callback type**

Line 21:
```tsx
onTaskDeleted?: (taskId: string) => void;
```

Line 152:
```tsx
onTaskDeleted?.(task.id);
```

- [ ] **Step 2: Verify build**

Run: `npm run lint`

---

## Phase 3: State Management & Realtime Stability

### Task 3.1: Fix Realtime channel error recovery

**Files:**
- Modify: `src/lib/hooks/useDashboardData.ts:30,361-369,376`

- [ ] **Step 1: Add recoveryKey state**

Near line 30:
```tsx
const [recoveryKey, setRecoveryKey] = useState(0);
```

- [ ] **Step 2: Update subscribe callback**

Lines 361-369:
```tsx
.subscribe((status) => {
  if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
    if (!cancelled && initialFetchDoneRef.current) {
      setTimeout(() => {
        if (!cancelled) setRecoveryKey(k => k + 1);
      }, 1000);
    }
  }
});
```

- [ ] **Step 3: Add recoveryKey to effect deps**

Line 376:
```tsx
}, [profile?.uid, refetch, recoveryKey]);
```

- [ ] **Step 4: Verify build**

Run: `npm run lint`

---

### Task 3.2: Remove refetch from useEffect deps — use ref

**Files:**
- Modify: `src/lib/hooks/useDashboardData.ts`

- [ ] **Step 1: Add refetchRef**

Near line 28:
```tsx
const refetchRef = useRef(refetch);
```

Add effect to keep it synced:
```tsx
useEffect(() => { refetchRef.current = refetch; }, [refetch]);
```

- [ ] **Step 2: Replace refetch() calls inside the main effect with refetchRef.current()**

Find all `refetch()` calls inside the main useEffect and replace with `refetchRef.current()`.

- [ ] **Step 3: Remove refetch from deps**

Line 376:
```tsx
}, [profile?.uid, recoveryKey]);
```

- [ ] **Step 4: Verify build**

Run: `npm run lint`

---

### Task 3.3: Remove dead cancelledRef + consolidate ref-sync effects

**Files:**
- Modify: `src/lib/hooks/useDashboardData.ts:28,33-63,91`

- [ ] **Step 1: Remove cancelledRef**

Line 28: Delete `const cancelledRef = useRef(false);`
Line 91: Remove `cancelledRef.current ||` from the condition.

- [ ] **Step 2: Consolidate 9 ref-sync effects into 1**

Replace lines 33-63:
```tsx
useEffect(() => {
  employeesRef.current = employees;
  myTasksRef.current = myTasks;
  teamTasksRef.current = teamTasks;
  managedReportsRef.current = managedReports;
  personalTasksRef.current = personalTasks;
  superiorsRef.current = superiors;
  profileRef.current = profile;
  profileUidRef.current = profile?.uid ?? null;
}, [employees, myTasks, teamTasks, managedReports, personalTasks, superiors, profile]);
```

- [ ] **Step 3: Verify build**

Run: `npm run lint`

---

### Task 3.4: Eliminate dual-write race — remove optimistic callbacks

**Files:**
- Modify: `src/components/Dashboard.tsx:185-234`
- Modify: `src/lib/hooks/useDashboardData.ts:378-389`

- [ ] **Step 1: Remove optimistic callbacks from useTaskOperations call**

In Dashboard.tsx lines 185-211, replace all callbacks with no-ops:
```tsx
onPersonalTaskCreated: () => {},
onTaskCreated: () => {},
onTaskUpdated: () => {},
onTaskDeleted: () => {},
onStatusChanged: () => {},
onPersonalTaskToggled: () => {},
onPersonalTaskDeleted: () => {},
onReportCreated: () => {},
```

- [ ] **Step 2: Replace useTeamManagement optimistic callbacks with refetch**

Lines 223-234:
```tsx
onEmployeeAdded: () => { refetch(); },
onEmployeeRemoved: () => { refetch(); },
onSuperiorAdded: () => { refetch(); },
onSuperiorRemoved: () => { refetch(); },
```

- [ ] **Step 3: Remove raw setters from useDashboardData return**

Lines 378-389, remove: `setPersonalTasks, setEmployees, setMyTasks, setTeamTasks, setManagedReports, setSuperiors`

Return only: `employees, myTasks, teamTasks, managedReports, personalTasks, superiors, error, isLoading, refetch`

- [ ] **Step 4: Remove setter usage from Dashboard**

Line 91, remove `setPersonalTasks, setEmployees, setMyTasks, setTeamTasks, setManagedReports, setSuperiors` from the destructuring.

- [ ] **Step 5: Verify build**

Run: `npm run lint`

---

### Task 3.5: Fix superior fetch missing .catch()

**Files:**
- Modify: `src/lib/hooks/useDashboardData.ts:132-138`

- [ ] **Step 1: Add .catch()**

```tsx
supabase
  .from("users")
  .select("*")
  .in("uid", limitedIds)
  .then(({ data, error }) => {
    if (cancelled) return;
    if (error) {
      console.error('Superior fetch error:', error);
      return;
    }
    if (data) setSuperiors(data as UserProfile[]);
  })
  .catch((err) => {
    if (!cancelled) console.error('Superior fetch exception:', err);
  });
```

- [ ] **Step 2: Verify build**

Run: `npm run lint`

---

### Task 3.6: Guard unnecessary task reassignment refetches

**Files:**
- Modify: `src/lib/hooks/useDashboardData.ts:288-291`

- [ ] **Step 1: Add guard**

```tsx
const affectsViewer =
  old?.employeeId === profile.uid ||
  old?.managerId === profile.uid ||
  updated.employeeId === profile.uid ||
  updated.managerId === profile.uid;

if (affectsViewer) {
  if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  debounceTimerRef.current = setTimeout(() => fetchAll(), 300);
}
```

- [ ] **Step 2: Verify build**

Run: `npm run lint`

---

## Phase 4: Architecture Cleanup + SQL Hardening

### Task 4.1: SQL — add EXISTS check to task INSERT/UPDATE policies

**Files:**
- Modify: `setup.sql:79-88,180,185-189`

- [ ] **Step 1: Fix task INSERT policy**

Line 180:
```sql
CREATE POLICY "Managers can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  auth.uid() = "managerId" AND
  ("employeeId" IS NULL OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.uid = "employeeId" AND auth.uid() = ANY(u."managerIds")
  ))
);
```

- [ ] **Step 2: Fix task UPDATE policy**

Lines 185-189:
```sql
CREATE POLICY "Managers can update tasks" ON public.tasks FOR UPDATE USING (
  auth.uid() = "managerId"
) WITH CHECK (
  auth.uid() = "managerId" AND
  ("employeeId" IS NULL OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.uid = "employeeId" AND auth.uid() = ANY(u."managerIds")
  ))
);
```

- [ ] **Step 3: Fix member_join_team**

Lines 79-88:
```sql
CREATE OR REPLACE FUNCTION member_join_team(superior_uid UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE uid = superior_uid) THEN
    RAISE EXCEPTION 'Superior not found.';
  END IF;
  UPDATE public.users
  SET "managerIds" = array_append("managerIds", superior_uid)
  WHERE uid = auth.uid()
    AND NOT (superior_uid = ANY("managerIds"));
END;
$$;
```

---

### Task 4.2: SQL — logs FK SET NULL to preserve audit trail

**Files:**
- Modify: `setup.sql:27-35`

- [ ] **Step 1: Change logs table FK**

Lines 27-35:
```sql
CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "taskId" UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    "userId" UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
    event TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Task 4.3: Move grouping logic into TeamOperationsBoard

**Files:**
- Modify: `src/components/Dashboard.tsx:57,95-113,444-459`
- Modify: `src/components/features/TeamOperationsBoard.tsx`

- [ ] **Step 1: Read TeamOperationsBoard.tsx**

- [ ] **Step 2: Remove grouping from Dashboard**

Delete lines 57 (collapsedGroups state) and lines 95-113 (two grouping useMemo blocks).

- [ ] **Step 3: Remove grouping props from TeamOperationsBoard call**

Lines 444-459, remove:
- `teamGroupedActiveTasks={teamGroupedActiveTasks}`
- `teamGroupedCompletedTasks={teamGroupedCompletedTasks}`
- `collapsedGroups={collapsedGroups}`
- `setCollapsedGroups={setCollapsedGroups}`

- [ ] **Step 4: Add grouping logic inside TeamOperationsBoard**

Add to TeamOperationsBoard:
```tsx
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
```

- [ ] **Step 5: Verify build**

Run: `npm run lint`

---

### Task 4.4: Extract useAuditLogs hook

**Files:**
- Create: `src/lib/hooks/useAuditLogs.ts`
- Modify: `src/components/modals/TaskDetailsModal.tsx`

- [ ] **Step 1: Create useAuditLogs hook**

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { AuditLog } from '../types';

export function useAuditLogs(taskId: string | null) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setLogs([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    supabase
      .from('logs')
      .select('*')
      .eq('taskId', taskId)
      .order('createdAt', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError('Failed to load audit logs.');
          console.error(error);
        } else if (data) {
          setLogs(data as AuditLog[]);
        }
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [taskId]);

  return { logs, isLoading, error };
}
```

- [ ] **Step 2: Update TaskDetailsModal**

Replace inline log fetching with:
```tsx
const { logs, isLoading: isLoadingLogs, error: logsError } = useAuditLogs(selectedTaskDetails?.id ?? null);
```

Remove the old useState for logs, isLoadingLogs, and the useEffect that fetched them.

- [ ] **Step 3: Verify build**

Run: `npm run lint`

---

### Task 4.5: Fix parseLocalDate for ISO datetime strings

**Files:**
- Modify: `src/components/Dashboard.tsx:37-40`

- [ ] **Step 1: Replace parseLocalDate**

```tsx
const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
};
```

- [ ] **Step 2: Verify build**

Run: `npm run lint`

---

### Task 4.6: Use sessionStorage for Supabase auth

**Files:**
- Modify: `src/lib/supabase/client.ts`

- [ ] **Step 1: Read client.ts**

- [ ] **Step 2: Add sessionStorage config**

```tsx
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

- [ ] **Step 3: Verify build**

Run: `npm run lint`

---

### Task 4.7: Final verification

- [ ] **Step 1: Run TypeScript type check**

Run: `npm run lint`
Expected: PASS with zero errors

- [ ] **Step 2: Run dev server**

Run: `npm run dev`
Expected: Starts on port 3000 without errors

- [ ] **Step 3: Smoke test**
- Login works
- Dashboard loads with data
- Create task → green success toast, appears via Realtime
- Update task → green success toast
- Delete task → confirm dialog → success toast
- Status change → green success toast
- Error toast is orange/red
- Modal error doesn't crash Dashboard
- Channel disconnect recovers

---

## Execution Order

```
Phase 1 (UX/Error) — 10 tasks
  1.1 Toast severity types + timer leak fix
  1.2 Separate log insert from try/catch
  1.3 Fix personal task false success
  1.4 TaskDetailsModal log error state
  1.5 Modal ErrorBoundaries + outer retry
  1.6 Confirm dialog error handling
  1.7 EditTaskModal remove completed + button color
  1.8 TaskAssignmentModal button color
  1.9 Avatar null safety + dead code cleanup
  1.10 CommandOverview percentages + PersonnelRoster perf

Phase 2 (Type Safety) — 4 tasks
  2.1 Fix types.ts alignment with DB
  2.2 Type Realtime payload handlers
  2.3 Remove updatedAt from client payloads
  2.4 Fix onTaskDeleted callback signature

Phase 3 (State/Realtime) — 6 tasks
  3.1 Channel error recovery
  3.2 Remove refetch from effect deps
  3.3 Remove dead cancelledRef + consolidate ref-sync
  3.4 Eliminate dual-write race
  3.5 Superior fetch .catch()
  3.6 Guard unnecessary refetches

Phase 4 (Architecture + SQL) — 7 tasks
  4.1 SQL: EXISTS checks on task policies
  4.2 SQL: logs FK SET NULL
  4.3 Move grouping into TeamOperationsBoard
  4.4 Extract useAuditLogs hook
  4.5 Robust date parsing
  4.6 sessionStorage for auth
  4.7 Final verification
```

Total: **27 tasks** across 4 phases.
