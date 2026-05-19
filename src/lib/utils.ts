import type { Task } from './types';

export const getPriorityStyle = (priority: Task['priority']) => {
  switch (priority) {
    case 'critical': return 'bg-orange-600 text-white border-orange-700 shadow-orange-500/20';
    case 'high': return 'bg-orange-500 text-white border-orange-600 shadow-orange-500/20';
    case 'medium': return 'bg-emerald-500 text-slate-950 border-emerald-600 shadow-emerald-500/10';
    case 'low': return 'bg-slate-200 text-slate-600 border-slate-300';
    default: return 'bg-slate-500 text-white border-slate-600';
  }
};
