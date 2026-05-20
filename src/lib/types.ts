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
