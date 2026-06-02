import { useState } from "react";
import type { Task, UserProfile, NewTaskForm, NewPersonalTaskForm, ConfirmDialogState } from "../types";

export function useDashboardModals() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPersonalTaskModalOpen, setIsPersonalTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({ title: "", description: "", employeeId: "", timelineEnd: "", priority: "medium" });
  const [newPersonalTask, setNewPersonalTask] = useState<NewPersonalTaskForm>({ title: "", timelineEnd: "" });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isTogglingPersonalTask, setIsTogglingPersonalTask] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
  });
  const [isConfirming, setIsConfirming] = useState(false);

  return {
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
  };
}
