import { useMemo, useId } from 'react';
import { 
  ShieldAlert, 
  Zap, 
  Users, 
  Target,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, UserProfile } from '../../lib/types';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';

interface Props {
  teamTasks: Task[];
  employees: UserProfile[];
}

export default function CommandOverview({ teamTasks, employees }: Props) {
  const activeTeamTasks = useMemo(() => teamTasks.filter(t => t.status !== 'completed'), [teamTasks]);
  const reducedMotion = useReducedMotion();
  const gradientId = useId();
  const activeOps = useMemo(() => activeTeamTasks.length, [activeTeamTasks]);
  const criticalOps = useMemo(() => teamTasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length, [teamTasks]);
  const completionRate = useMemo(() => teamTasks.length > 0
    ? Math.round((teamTasks.reduce((count, t) => t.status === 'completed' ? count + 1 : count, 0) / teamTasks.length) * 100)
    : 0, [teamTasks]);

  // Derive chart data from completed task timestamps
  const data = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return { date: d, label: dayLabels[d.getDay()], count: 0 };
    });
    teamTasks.filter(t => t.status === 'completed').forEach(t => {
      const ts = t.updatedAt || t.createdAt;
      if (!ts) return;
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      const match = days.find(day => day.date.getTime() === d.getTime());
      if (match) match.count++;
    });
    return days.map(d => ({ name: d.label, completed: d.count }));
  }, [teamTasks]);

  return (
    <div className="space-y-8 pb-12">
      {/* Tactical Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rotate-45 shadow-sm"></div>
          <h2 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-slate-400">Real-time Intelligence</h2>
        </div>
        <h2 className="font-serif text-2xl text-slate-900 tracking-tight -tracking-[0.025em]">
          Command Dashboard
        </h2>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Active Operations" 
          value={activeOps} 
          icon={<Target className="w-5 h-5 text-emerald-500" />} 
          reducedMotion={reducedMotion}
        />
        <KPICard 
          title="Critical Alerts" 
          value={criticalOps} 
          icon={<ShieldAlert className={`w-5 h-5 ${criticalOps > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-300'}`} />} 
          isAlert={criticalOps > 0}
          reducedMotion={reducedMotion}
        />
        <KPICard 
          title="Success Rate" 
          value={`${completionRate}%`} 
          icon={<Zap className="w-5 h-5 text-sky-500" />} 
          reducedMotion={reducedMotion}
        />
        <KPICard 
          title="Deployment Size" 
          value={employees.length} 
          icon={<Users className="w-5 h-5 text-indigo-500" />} 
          reducedMotion={reducedMotion}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h3 className="font-mono text-xs font-black uppercase tracking-widest text-slate-400">Operational Tempo</h3>
              <p className="font-serif text-lg text-slate-900 -tracking-[0.025em]">Task Completion Velocity</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
               <Clock className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-xs font-black uppercase tracking-widest text-slate-500">Last 7 Cycles</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full" tabIndex={0} aria-label={`Area chart showing task completions over the last 7 days: ${data.map(d => `${d.name}: ${d.completed}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="100%">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontFamily: 'JetBrains Mono', fill: '#94a3b8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontFamily: 'JetBrains Mono', fill: '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill={`url(#${gradientId})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="sr-only">
            <p>Chart data: {data.map(d => `${d.name}: ${d.completed} completions`).join('. ')}</p>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
          <div className="relative z-10 space-y-8">
            <div className="space-y-1">
              <h3 className="font-mono text-xs font-black uppercase tracking-widest text-slate-500">Threat Matrix</h3>
              <p className="font-serif text-lg -tracking-[0.025em]">Tactical Distribution</p>
            </div>

            <div className="space-y-6">
              <PriorityRow label="Critical" count={criticalOps} total={activeTeamTasks.length} color="bg-orange-600" reducedMotion={reducedMotion} />
              <PriorityRow label="High" count={activeTeamTasks.filter(t => t.priority === 'high').length} total={activeTeamTasks.length} color="bg-orange-500" reducedMotion={reducedMotion} />
              <PriorityRow label="Medium" count={activeTeamTasks.filter(t => t.priority === 'medium').length} total={activeTeamTasks.length} color="bg-emerald-500" reducedMotion={reducedMotion} />
              <PriorityRow label="Low" count={activeTeamTasks.filter(t => t.priority === 'low').length} total={activeTeamTasks.length} color="bg-slate-600" reducedMotion={reducedMotion} />
            </div>

            <div className="pt-6 border-t border-slate-800">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="font-mono text-xs uppercase font-bold text-slate-500">Active Reports</div>
                    <div className="font-mono text-xs font-black text-white">{teamTasks.filter(t => t.status === 'in-review').length} PENDING REVIEW</div>
                  </div>
               </div>
            </div>
          </div>

          {/* Decorative mesh */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isAlert?: boolean;
  reducedMotion: boolean;
}

function KPICard({ title, value, icon, isAlert, reducedMotion }: KPICardProps) {
  return (
    <motion.div 
      whileHover={reducedMotion ? undefined : { y: -5 }}
      className={`p-6 rounded-2xl border transition-all duration-150 ${
        isAlert ? 'bg-orange-50 border-orange-100 shadow-lg shadow-orange-500/5' : 'bg-white border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/30'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${isAlert ? 'bg-white border border-orange-100' : 'bg-slate-50 border border-slate-50'}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="font-mono text-xs font-black uppercase tracking-widest text-slate-400">{title}</h4>
        <div className={`font-serif text-xl font-bold ${isAlert ? 'text-orange-600' : 'text-slate-900'}`}>
          {value}
        </div>
      </div>
    </motion.div>
  );
}

interface PriorityRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
  reducedMotion: boolean;
}

function PriorityRow({ label, count, total, color, reducedMotion }: PriorityRowProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="font-mono text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
        <span className="font-mono text-xs font-black text-white">{count}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={reducedMotion ? { width: `${percentage}%` } : { width: 0 }}
          animate={reducedMotion ? { width: `${percentage}%` } : { width: `${percentage}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
