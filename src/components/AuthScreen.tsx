import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Shield, User as UserIcon, LogIn, UserPlus, RotateCw, AlertCircle } from 'lucide-react';
import { supabase, ORG_EMAIL_DOMAIN } from '../lib/supabase/client';
import { useAuthStore } from '../lib/store';
import { Logo } from './Logo';
import { useReducedMotion } from '../lib/hooks/useReducedMotion';
import { log } from '../lib/logger';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [needsOtp, setNeedsOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [changeEmail, setChangeEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [changeNewPw, setChangeNewPw] = useState('');
  const [changeConfirmPw, setChangeConfirmPw] = useState('');
  const reducedMotion = useReducedMotion();
  const recoveryMode = useAuthStore((s) => s.recoveryMode);
  const setRecovery = useAuthStore((s) => s.setRecovery);
  const changePasswordMode = useAuthStore((s) => s.changePasswordMode);
  const setChangePasswordMode = useAuthStore((s) => s.setChangePasswordMode);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (recoveryMode) {
      setIsResetting(true);
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  }, [recoveryMode]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleResend = useCallback(async () => {
    if (resendTimer > 0) return;
    setError('');
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email + '@' + ORG_EMAIL_DOMAIN,
    });
    if (resendError) {
      setError(resendError.message);
    } else {
      setResendTimer(60);
    }
  }, [email, resendTimer]);

  const handleResendReset = useCallback(async () => {
    if (resendTimer > 0) return;
    setError('');
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(resetEmail + '@' + ORG_EMAIL_DOMAIN, {
      redirectTo: window.location.origin,
    });
    if (resendError) {
      setError(resendError.message);
    } else {
      setResendTimer(60);
    }
  }, [resetEmail, resendTimer]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail + '@' + ORG_EMAIL_DOMAIN, {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      setIsForgotPassword(false);
      setIsResetting(true);
      setNeedsOtp(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (needsOtp && !resetOtp) {
      setError('Please enter the recovery code from the email.');
      return;
    }
    setLoading(true);
    try {
      if (needsOtp) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: resetEmail + '@' + ORG_EMAIL_DOMAIN,
          token: resetOtp,
          type: 'recovery',
        });
        if (verifyError) throw verifyError;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setRecovery(false);
      setIsResetting(false);
      setIsLogin(true);
      setNeedsOtp(false);
      setResetOtp('');
      setResetEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (changeNewPw !== changeConfirmPw) {
      setError('Passwords do not match.');
      return;
    }
    if (changeNewPw.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    const targetEmail = changeEmail
      ? changeEmail.includes('@') ? changeEmail : changeEmail + '@' + ORG_EMAIL_DOMAIN
      : currentUser?.email || '';
    if (!targetEmail) { setError('Email is required.'); setLoading(false); return; }
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: currentPw,
      });
      if (signInError) throw signInError;
      const { error: updateError } = await supabase.auth.updateUser({ password: changeNewPw });
      if (updateError) throw updateError;
      setChangePasswordMode(false);
      setIsChangePassword(false);
      setChangeEmail('');
      setCurrentPw('');
      setChangeNewPw('');
      setChangeConfirmPw('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fullEmail = email + '@' + ORG_EMAIL_DOMAIN;

    try {
      if (!isLogin && password.length < 8) {
        setError('Password must be at least 8 characters.');
        setLoading(false);
        return;
      }
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: fullEmail, password });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: fullEmail,
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
      log.error(err);
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

  if (isForgotPassword) {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-10 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40">
            <div className="w-16 h-16 bg-orange-50/70 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="font-mono font-black -tracking-[0.025em] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 mb-3">Reset Your Password</h2>
            <p className="font-mono text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-150 z-10" />
                <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                  <input
                    id="reset-email"
                    type="text"
                    required
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value.replace(/@.*$/, ''))}
                    className="flex-1 bg-transparent border-none py-4 pl-12 pr-2 text-sm focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500"
                    placeholder="name"
                  />
                  <span className="pr-4 text-sm text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">@rrcat.gov.in</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-slate-950 rounded-xl py-4 font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-lg shadow-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>Send Reset Link</>
                )}
              </button>
            </form>
            <button
              onClick={() => { setIsForgotPassword(false); setResetEmail(''); setError(''); }}
              className="mt-4 w-full text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-widest transition-colors duration-150"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isResetting) {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-10 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40">
            <div className="w-16 h-16 bg-emerald-50/70 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-mono font-black -tracking-[0.025em] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 mb-3">Set New Password</h2>
            <p className="font-mono text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {needsOtp ? 'Enter the recovery code from your email and your new password.' : 'Enter your new password below.'}
            </p>
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              {needsOtp && (
                <div className="space-y-2">
                  <label htmlFor="reset-otp" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Recovery Code</label>
                  <input
                    id="reset-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter the code from email"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 px-4 text-sm text-center text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500 font-mono tracking-[0.3em] focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/5 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-150" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-150" />
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl text-orange-600 dark:text-orange-400 text-xs font-mono font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-slate-950 rounded-xl py-4 font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-lg shadow-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>Update Password</>
                )}
              </button>
            </form>
            {needsOtp && (
              <button
                onClick={handleResendReset}
                disabled={resendTimer > 0}
                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl py-3 font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <RotateCw className={`w-4 h-4 ${resendTimer > 0 ? '' : ''}`} />
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Reset Link'}
              </button>
            )}
            <button
              onClick={() => { setIsResetting(false); setIsLogin(true); setNeedsOtp(false); setResetOtp(''); setResetEmail(''); setNewPassword(''); setConfirmPassword(''); }}
              className="mt-4 w-full text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-widest transition-colors duration-150"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isChangePassword || changePasswordMode) {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-10 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40">
            <div className="w-16 h-16 bg-orange-50/70 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="font-mono font-black -tracking-[0.025em] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 mb-3">Change Password</h2>
            <p className="font-mono text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Enter your current password and a new password.
            </p>
            <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="change-email" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-orange-500 transition-colors duration-150 z-10" />
                  <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-orange-500/5 transition-all">
                    <input
                      id="change-email"
                      type="text"
                      required
                      autoComplete="email"
                      value={changeEmail}
                      onChange={(e) => setChangeEmail(e.target.value.replace(/@.*$/, ''))}
                      className="flex-1 bg-transparent border-none py-4 pl-12 pr-2 text-sm focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500"
                      placeholder="name"
                    />
                    <span className="pr-4 text-sm text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">@rrcat.gov.in</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="change-current-pw" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Current Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-orange-500 transition-colors duration-150" />
                  <input
                    id="change-current-pw"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    placeholder="Current password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="change-new-pw" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-orange-500 transition-colors duration-150" />
                  <input
                    id="change-new-pw"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={changeNewPw}
                    onChange={(e) => setChangeNewPw(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    placeholder="New password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="change-confirm-pw" className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-orange-500 transition-colors duration-150" />
                  <input
                    id="change-confirm-pw"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={changeConfirmPw}
                    onChange={(e) => setChangeConfirmPw(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl text-orange-600 dark:text-orange-400 text-xs font-mono font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white rounded-xl py-4 font-mono font-bold text-xs uppercase tracking-[0.2em] hover:bg-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-lg shadow-orange-500/10 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>Update Password</>
                )}
              </button>
            </form>
            <button
              onClick={() => {
                if (changePasswordMode) setChangePasswordMode(false);
                setIsChangePassword(false);
                setError('');
                setChangeEmail('');
                setCurrentPw('');
                setChangeNewPw('');
                setChangeConfirmPw('');
              }}
              className="mt-4 w-full text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-widest transition-colors duration-150"
            >
              {changePasswordMode ? 'Back to Settings' : 'Back to Login'}
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
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors duration-150 z-10" />
              <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                <input
                  id="auth-email"
                  type="text"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.replace(/@.*$/, ''))}
                  className="flex-1 bg-transparent border-none py-4 pl-12 pr-2 text-sm focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-500"
                  placeholder="name"
                />
                <span className="pr-4 text-sm text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">@rrcat.gov.in</span>
              </div>
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

          {isLogin && (
            <div className="mt-4 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setResetEmail(email);
                  setError('');
                }}
                className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold uppercase tracking-widest transition-colors duration-150"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangePassword(true);
                  setChangeEmail(email);
                  setError('');
                }}
                className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold uppercase tracking-widest transition-colors duration-150"
              >
                Change password
              </button>
            </div>
          )}
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
