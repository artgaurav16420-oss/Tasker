import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { Logo } from './Logo';
import { useReducedMotion } from '../lib/hooks/useReducedMotion';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && password.length < 8) {
        setError('Password must be at least 8 characters.');
        setLoading(false);
        return;
      }
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name },
          },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setVerificationSent(true);
        } else {
          setIsLogin(true);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Operation failed. Please try again.';
      if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'user_already_exists') {
        setError('Email is already in use.');
      } else if (message === 'Failed to fetch') {
        setError('Failed to connect. Please check your Supabase URL and CORS settings.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-10 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40">
            <div className="w-16 h-16 bg-emerald-50/70 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-mono font-black -tracking-[0.025em] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 mb-3">Verify Your Email</h2>
            <p className="font-mono text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              A verification link has been sent to <span className="text-emerald-600 font-mono text-xs">{email}</span>. Click the link to activate your account, then log in.
            </p>
            <button
              onClick={() => { setVerificationSent(false); setIsLogin(true); }}
              className="mt-8 w-full bg-emerald-500 text-slate-950 rounded-xl py-4 font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const authContent = (
    <>
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <Logo className="w-24 h-24" />
        </div>
        <h1 className="text-2xl font-mono -tracking-[0.025em] tracking-[0.1em] font-black mb-2 text-slate-900 dark:text-slate-100">Tasker</h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-mono uppercase tracking-[0.1em] font-bold">Raja Ramanna Centre for Advanced Technology</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="flex gap-8 mb-10 relative z-10">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-150 border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-t-xl ${isLogin ? 'border-emerald-500 text-slate-950 dark:text-slate-100' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-150 border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-t-xl ${!isLogin ? 'border-emerald-500 text-slate-950 dark:text-slate-100' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div id="auth-error" className="mb-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl text-orange-600 dark:text-orange-400 text-xs font-mono font-bold relative z-10" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10" aria-describedby={error ? "auth-error" : undefined}>
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="auth-name" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Full Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-150" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  placeholder="Jane Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="auth-email" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-150" />
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                placeholder="name@rrcat.gov.in"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="auth-password" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-150" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 hover:text-slate-500 transition-colors duration-150 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-slate-950 rounded-xl py-4 mt-8 font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-lg shadow-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            {loading ? (
              <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isLogin ? 'Login' : 'Register'}
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Task Manager v1.0.4</p>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-mono selection:bg-emerald-100 selection:text-emerald-900">
      {reducedMotion ? (
        <div className="w-full max-w-md">
          {authContent}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {authContent}
        </motion.div>
      )}
    </div>
  );
}
