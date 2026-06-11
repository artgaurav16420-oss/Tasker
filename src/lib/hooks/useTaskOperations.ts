import type { FormEvent, Dispatch, SetStateAction } from 'react';
import { supabase } from '../supabase/client';
import { UserProfile, Task, PersonalTask, NewTaskForm, ConfirmDialogState, Report } from '../types';
import { log } from '../logger';
import { mapPgError } from '../errors';

interface UseTaskOperationsParams {
  profile: UserProfile | null;
  setIsTaskModalOpen: (v: boolean) => void;
  setNewTask: Dispatch<SetStateAction<NewTaskForm>>;
  setEditingTask: (t: Task | null) => void;
  selectedTaskDetails: Task | null;
  setSelectedTaskDetails: (t: Task | null) => void;
  setConfirmDialog: Dispatch<SetStateAction<ConfirmDialogState>>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  setIsCreatingTask?: (v: boolean) => void;
  setIsUpdatingTask?: (v: boolean) => void;
  setIsDeletingTask?: (v: boolean) => void;
  setIsTogglingPersonalTask?: (v: boolean) => void;
  onPersonalTaskCreated?: (task: PersonalTask) => void;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onStatusChanged?: (taskId: string, newStatus: Task['status']) => void;
  onPersonalTaskToggled?: (taskId: string, newStatus: PersonalTask['status']) => void;
  onPersonalTaskDeleted?: (taskId: string) => void;
  onReportCreated?: (report: Report) => void;
}

export function useTaskOperations({
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
  onPersonalTaskCreated,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onStatusChanged,
  onPersonalTaskToggled,
  onPersonalTaskDeleted,
  onReportCreated,
}: UseTaskOperationsParams) {
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

      void supabase.from('logs').insert({
        taskId: (createdTask as Record<string, unknown>).id as string,
        userId: profile.uid,
        event: 'TASK_CREATED',
        newValue: 'Operation Initialized'
      }).then(({ error }) => { if (error) log.error('Failed to create audit log:', error); });
    } catch (err) {
      log.error(err);
      showToast(mapPgError(err).message, 'error');
    } finally {
      setIsCreatingTask?.(false);
    }
  };

  const handleUpdateTask = async (e: FormEvent, editingTask: Task) => {
    e.preventDefault();
    if (!profile || !editingTask) return;

    if (profile.uid !== editingTask.managerId) {
      showToast('Unauthorized: Only the task manager can modify this operation.', 'error');
      return;
    }

    setIsUpdatingTask?.(true);
    try {
      const payload: Record<string, unknown> = {
        title: editingTask.title,
        description: editingTask.description,
        employeeId: editingTask.employeeId,
        status: editingTask.status,
        priority: editingTask.priority,
      };
      payload.timelineEnd = editingTask.timelineEnd || null;

      const { data: updatedTask } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', editingTask.id)
        .select()
        .single()
        .throwOnError();

      onTaskUpdated?.(updatedTask as Task);

      const serverTask = updatedTask as Task;
      setEditingTask(null);
      if (selectedTaskDetails?.id === editingTask.id) {
        setSelectedTaskDetails(serverTask);
      }
      showToast('Task updated successfully', 'success');
    } catch (err) {
      log.error(err);
      showToast(mapPgError(err).message, 'error');
    } finally {
      setIsUpdatingTask?.(false);
    }
  };

  const handleDeleteTask = (task: Task) => {
    if (!profile || !task) return;

    if (profile.uid !== task.managerId) {
      showToast('Unauthorized: Only the creator can terminate this operation.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? Associated reports will also be purged.',
      confirmText: 'Terminate',
      danger: true,
      onConfirm: async () => {
        setIsDeletingTask?.(true);
        try {
          await supabase.from('tasks').delete().eq('id', task.id).throwOnError();
          onTaskDeleted?.(task.id);
          showToast('Task and associated reports purged.', 'success');
          setSelectedTaskDetails(null);
        } catch (err) {
          log.error(err);
          showToast(mapPgError(err).message, 'error');
        } finally {
          setIsDeletingTask?.(false);
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        }
      },
    });
  };

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

      void supabase.from('logs').insert({
        taskId,
        userId: profile.uid,
        event: 'STATUS_TRANSITION',
        oldValue: oldStatus,
        newValue: newStatus
      }).then(({ error }) => { if (error) log.error('Failed to create audit log:', error); });
    } catch (err) {
      log.error(err);
      showToast(mapPgError(err).message, 'error');
    }
  };

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
      log.error(err);
      showToast(mapPgError(err).message, 'error');
    }
  };

  const handleTogglePersonalTask = async (taskId: string, currentStatus: PersonalTask['status']) => {
    setIsTogglingPersonalTask?.(true);
    try {
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      await supabase
        .from('personal_tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .throwOnError();
      onPersonalTaskToggled?.(taskId, newStatus as PersonalTask['status']);
    } catch (err) {
      log.error(err);
      showToast(mapPgError(err).message, 'error');
    } finally {
      setIsTogglingPersonalTask?.(false);
    }
  };

  const handleDeletePersonalTask = (taskId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Personal Task',
      message: 'Are you sure you want to delete this personal task?',
      confirmText: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await supabase.from('personal_tasks').delete().eq('id', taskId).throwOnError();
          onPersonalTaskDeleted?.(taskId);
          showToast('Task Deleted', 'success');
        } catch (err) {
          log.error(err);
          showToast(mapPgError(err).message, 'error');
        }
        setConfirmDialog((p) => ({ ...p, isOpen: false }));
      },
    });
  };

  const handleSubmitReport = async (
    e: FormEvent,
    selectedTask: Task | null,
    reportContent: string,
    setReportContent: (v: string) => void,
    setSelectedTask: (t: Task | null) => void,
    setIsSubmittingReport: (v: boolean) => void,
  ) => {
    e.preventDefault();
    if (!profile || !selectedTask) return;
    if (!reportContent.trim()) {
      showToast('Operation report must contain data.', 'error');
      return;
    }
    setIsSubmittingReport(true);
    try {
      if (profile.uid !== selectedTask.employeeId && profile.uid !== selectedTask.managerId) {
        showToast('Unauthorized: You are not linked to this operation.', 'error');
        return;
      }

      const payload: Record<string, unknown> = {
        taskId: selectedTask.id,
        employeeId: selectedTask.employeeId || profile.uid,
        managerId: selectedTask.managerId,
      };
      if (reportContent) payload.content = reportContent;

      const { data: createdReport } = await supabase
        .from('reports')
        .insert(payload)
        .select()
        .single()
        .throwOnError();

      onReportCreated?.(createdReport as Report);

      setReportContent('');
      setSelectedTask(null);
    } catch (err) {
      log.error(err);
      showToast(mapPgError(err).message, 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return {
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleStatusChange,
    handleCreatePersonalTask,
    handleTogglePersonalTask,
    handleDeletePersonalTask,
    handleSubmitReport,
  };
}
