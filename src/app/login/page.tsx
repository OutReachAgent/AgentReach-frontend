'use client';

import { api } from '@/lib/api';
import { applyTheme, getStoredUser, saveAuthSession } from '@/lib/localAuth';
import { ArrowLeft, ArrowRight, KeyRound, Mail, RefreshCw, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type AuthMode = 'login' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('oswinalex1@gmail.com');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('oswinalex1@gmail.com');
  const [resetVerified, setResetVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    applyTheme(user.theme);
    setEmail(user.email);
    setResetEmail(user.email);
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    api.auth.login({ email, password })
      .then((session) => {
        saveAuthSession(session);
        applyTheme(session.user.theme);
        router.replace('/dashboard');
      })
      .catch((error: Error) => {
        setMessage(error.message || 'Invalid email or password.');
      });
  };

  const handleResetRequest = (event: React.FormEvent) => {
    event.preventDefault();
    const user = getStoredUser();

    if (resetEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setMessage('No account found for that email.');
      setResetVerified(false);
      return;
    }

    setMessage('Email verified. Set a new password below.');
    setResetVerified(true);
  };

  const handlePasswordReset = (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    api.auth.resetPassword({ email: resetEmail, newPassword })
      .then(() => {
        setPassword(newPassword);
        setMode('login');
        setResetVerified(false);
        setNewPassword('');
        setConfirmPassword('');
        setMessage('Password reset. Sign in with the new password.');
      })
      .catch((error: Error) => {
        setMessage(error.message || 'Could not reset password.');
      });
  };

  const openReset = () => {
    setMode('reset');
    setResetEmail(email || getStoredUser().email);
    setResetVerified(false);
    setMessage('');
  };

  const backToLogin = () => {
    setMode('login');
    setResetVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_440px]">
        <section className="hidden flex-col justify-between px-8 py-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">ReachConvert</h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">AI Outreach Suite</p>
            </div>
          </div>

          <div className="max-w-2xl py-16">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-400">Secure workspace</p>
            <h2 className="mt-5 text-5xl font-extrabold tracking-tight text-white">
              Sign in to manage outreach campaigns.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-400">
              Access contacts, email campaigns, calling workflows, analytics, settings, and your editable user profile.
            </p>
          </div>

          <p className="text-xs text-zinc-600"></p>
        </section>

        <section className="flex items-center px-5 py-8 sm:px-6 lg:py-10">
          <div className="w-full rounded-2xl border border-zinc-850 bg-zinc-900/70 p-6 shadow-2xl sm:p-8">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white">ReachConvert</h1>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">AI Outreach Suite</p>
                </div>
              </div>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">Welcome back</h2>
                  <p className="text-sm text-zinc-500">Sign in with your ReachConvert account.</p>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Email</label>
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent py-3 text-sm text-zinc-200 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
                    <button
                      type="button"
                      onClick={openReset}
                      className="text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3">
                    <KeyRound className="h-4 w-4 text-zinc-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent py-3 text-sm text-zinc-200 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
                >
                  Sign In <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={backToLogin}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
                </button>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">Reset password</h2>
                  <p className="text-sm leading-6 text-zinc-500">
                    Enter your account email first. Once verified, choose a new password.
                  </p>
                </div>
                <form onSubmit={handleResetRequest} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Account Email</label>
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3">
                      <Mail className="h-4 w-4 text-zinc-500" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        className="w-full bg-transparent py-3 text-sm text-zinc-200 outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm font-bold text-zinc-200 hover:bg-zinc-900"
                  >
                    <RefreshCw className="h-4 w-4" /> Verify Email
                  </button>
                </form>

                {resetVerified && (
                  <form onSubmit={handlePasswordReset} className="space-y-4 border-t border-zinc-850 pt-5">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-400"
                    >
                      Save New Password
                    </button>
                  </form>
                )}
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-semibold text-zinc-300">
                {message}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
