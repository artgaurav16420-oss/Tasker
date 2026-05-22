import { UserProfile } from '../../lib/types';
import { Settings, Shield, ShieldAlert, LogOut, Copy, UserPlus, Users } from 'lucide-react';
import { useSessionActions } from '../../lib/hooks/useSessionActions';

interface SettingsPanelProps {
  profile: UserProfile | null;
  superiors: UserProfile[];
  employees: UserProfile[];
  managerCode: string;
  setManagerCode: (v: string) => void;
  handleUpdateManager: (e: React.FormEvent) => void;
  isJoining: boolean;
  memberCode: string;
  setMemberCode: (v: string) => void;
  handleAddMember: (e: React.FormEvent) => void;
  isAddingMember: boolean;
  handleRemoveSuperior: (id: string) => void;
  handleRemoveEmployee: (id: string) => void;
  showToast: (msg: string) => void;
}

export default function SettingsPanel({
  profile,
  superiors,
  employees,
  managerCode,
  setManagerCode,
  handleUpdateManager,
  isJoining,
  memberCode,
  setMemberCode,
  handleAddMember,
  isAddingMember,
  handleRemoveSuperior,
  handleRemoveEmployee,
  showToast
}: SettingsPanelProps) {

  const { copyId, handleLogout } = useSessionActions({ profile, showToast });

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <h2 className="text-lg font-mono text-slate-800 dark:text-slate-100">Identity & Connections</h2>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-2 block">Your Identity Information</label>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700 font-mono text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Name:</span>
                  <span className="text-slate-900 dark:text-slate-100">{profile?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Email:</span>
                  <span className="text-slate-900 dark:text-slate-100">{profile?.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 block">Your Connector ID</label>
              <div className="flex overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 font-mono text-sm text-slate-600 dark:text-slate-400 flex-1 break-all truncate">
                  {profile?.uid}
                </div>
                <button
                  onClick={copyId}
                  className="bg-white dark:bg-slate-800 px-4 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-colors duration-150 border-l border-slate-200 dark:border-slate-700 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> <span className="font-mono text-xs font-bold uppercase tracking-widest">Copy</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share this ID or your email with your manager to be added to their team.</p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-mono text-xs uppercase font-bold tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 hover:text-orange-600 hover:border-orange-200 transition-colors duration-150 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Secure Logout
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-500" /> Connect to Superior
              </h3>
              <label htmlFor="manager-code" className="text-sm text-slate-600 dark:text-slate-400 mb-4 block">
                Enter your manager's email address or connector ID to join their reporting structure.
              </label>
              <form onSubmit={handleUpdateManager} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Manager's Email or ID..."
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-150"
                  value={managerCode}
                  onChange={(e) => setManagerCode(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={isJoining || !managerCode.trim()}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors duration-150 disabled:opacity-50"
                >
                  {isJoining ? "Connecting..." : "Connect"}
                </button>
              </form>

              {superiors.length > 0 && (
                <div className="mt-6 space-y-3">
                  <span className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Current Superiors</span>
                  {superiors.map(sup => (
                    <div key={sup.uid} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{sup.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{sup.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSuperior(sup.uid)}
                        className="text-slate-500 dark:text-slate-400 hover:text-orange-500 p-2 transition-colors duration-150"
                        title="Disconnect from Manager"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/30 shadow-sm shadow-indigo-500/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> Add to Team Roster
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Enter an operative's email address or connector ID to add them to your team.
              </p>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <input
                  id="member-code"
                  type="text"
                  placeholder="Operative's Email or ID..."
                  aria-label="Operative's email or ID"
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={isAddingMember || !memberCode.trim()}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors duration-150 disabled:opacity-50"
                >
                  {isAddingMember ? "Adding..." : "Add"}
                </button>
              </form>

              {employees.length > 0 && (
                <div className="mt-6 space-y-3">
                  <span className="text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">Current Team ({employees.length})</span>
                  {employees.map(emp => (
                    <div key={emp.uid} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex flex-col items-center justify-center pb-1">
                          <span className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">{emp.name.substring(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{emp.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveEmployee(emp.uid)}
                        className="text-slate-500 dark:text-slate-400 hover:text-orange-500 p-2 transition-colors duration-150 font-mono text-xs uppercase"
                        title="Remove from Team"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
