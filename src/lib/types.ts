export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  managerId?: string;
  managerIds?: string[];
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  managerId: string;
  employeeId: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timelineEnd?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Report {
  id: string;
  taskId: string;
  employeeId: string;
  managerId: string;
  content: string;
  createdAt: number;
}

export interface PersonalTask {
  id: string;
  title: string;
  status: 'todo' | 'completed';
  userId: string;
  timelineEnd?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLog {
  id: string;
  taskId: string;
  userId: string;
  event: string;
  oldValue?: string;
  newValue?: string;
  createdAt: number;
}

export interface NewTaskForm {
  title: string;
  description: string;
  employeeId: string;
  timelineEnd: string;
  priority: string;
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
  onConfirm: () => void;
}
