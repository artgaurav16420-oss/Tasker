import { useEffect } from 'react';
import { useAuthStore, initAuth } from './lib/store';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { ToastProvider } from './components/providers/ToastProvider';

export default function App() {
  const { user, loading, recoveryMode, changePasswordMode } = useAuthStore();

  useEffect(() => {
    const cleanup = initAuth();
    return () => {
      cleanup();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user && !recoveryMode && !changePasswordMode ? <ToastProvider><Dashboard /></ToastProvider> : <AuthScreen />;
}
