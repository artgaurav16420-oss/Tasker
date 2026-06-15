import type { Task } from './types';

export const getPriorityStyle = (priority: Task['priority']) => {
  switch (priority) {
    case 'critical': return 'bg-orange-600 text-white border-orange-700 shadow-orange-500/20 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
    case 'high': return 'bg-orange-500 text-white border-orange-600 shadow-orange-500/20 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
    case 'medium': return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/10 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
    case 'low': return 'bg-slate-200 text-slate-600 border-slate-300';
    default: return 'bg-slate-500 text-white border-slate-600 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
  }
};

export const getStatusStyle = (status: Task['status']) => {
  switch (status) {
    case 'in-progress': return 'bg-sky-500 text-white border-sky-600 shadow-sky-500/20 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
    case 'in-review': return 'bg-indigo-500 text-white border-indigo-600 shadow-indigo-500/20 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
    case 'completed': return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
    default: return 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
  }
};

export const getDeadlineStyle = (deadline: string | null | undefined, isCompleted: boolean) => {
  if (isCompleted) return 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-lg opacity-70 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
  if (!deadline) return 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
  const end = new Date(deadline);
  if (isNaN(end.getTime())) return 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'bg-orange-600 text-white border-orange-700 shadow-lg font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
  if (diffDays <= 3) return 'bg-orange-500 text-white border-orange-600 shadow-lg font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
  return 'bg-emerald-600 text-white border-emerald-700 shadow-lg font-bold [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]';
};

const AVATAR_COLORS = [
  '#10b981', '#059669', '#0891b2', '#0284c7',
  '#4f46e5', '#7c3aed', '#a855f7', '#d946ef',
  '#db2777', '#e11d48', '#ea580c', '#ca8a04',
];

export const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const formatDate = (date: string | number | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
