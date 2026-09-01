import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Logo({ dark = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Resume Builder home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </span>
      <span className={`text-lg font-bold ${dark ? 'text-white' : 'text-surface-900'}`}>Resume Builder</span>
    </Link>
  );
}

function MarketingPanel() {
  return (
    <div className="relative hidden w-[45%] shrink-0 flex-col justify-between overflow-hidden bg-surface-900 p-12 lg:flex xl:p-14">
      {/* subtle backdrop texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
          backgroundSize: '34px 34px',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <Logo dark />
      </div>

      <div className="relative max-w-md">
        <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-[2.75rem]">
          Build a resume that gets noticed.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-surface-400">
          Create a professional, ATS-friendly resume in minutes.
        </p>

        {/* abstract resume visual */}
        <div className="mt-12">
          <div className="w-80 max-w-full rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-sm">
            <div className="space-y-4">
              <div>
                <div className="h-5 w-36 rounded-md bg-white/90" />
                <div className="mt-2 h-3 w-28 rounded bg-white/40" />
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded bg-white/20" />
                <div className="h-2.5 w-4/5 rounded bg-white/20" />
                <div className="h-2.5 w-3/5 rounded bg-white/20" />
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="h-3 w-20 rounded bg-brand-400/60" />
                <div className="mt-2.5 space-y-2">
                  <div className="h-2.5 w-full rounded bg-white/20" />
                  <div className="h-2.5 w-11/12 rounded bg-white/20" />
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="h-3 w-16 rounded bg-brand-400/60" />
                <div className="mt-2.5 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-white/15" />
                  <div className="h-6 w-20 rounded-full bg-white/15" />
                  <div className="h-6 w-14 rounded-full bg-white/15" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="relative text-xs text-surface-600">&copy; {new Date().getFullYear()} Resume Builder. All rights reserved.</p>
    </div>
  );
}

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <MarketingPanel />

      {/* Right auth card */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="card animate-slide-up rounded-modal p-8 shadow-elevated sm:p-10">
            <div className="mb-8">
              <span className="badge badge-brand mb-4">Professional resume builder</span>
              <h1 className="text-2xl font-bold tracking-tight text-surface-900">{title}</h1>
              {subtitle && <p className="mt-2 text-sm leading-relaxed text-surface-500">{subtitle}</p>}
            </div>
            {children}
          </div>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

function ShowPasswordToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 transition-colors hover:text-surface-600"
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
      aria-pressed={show}
    >
      {show ? (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );
}

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-input border border-red-200 bg-red-50 px-3.5 py-3 animate-fade-in">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const field = (cls) => `${cls} ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-500/15' : ''}`;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your resumes and continue where you left off."
      footer={
        <p className="text-center text-sm text-surface-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
            Create account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <ErrorAlert message={error} />

        <div>
          <label htmlFor="login-email" className="label-text">Email</label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={field('input-field')}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="mb-0 text-sm font-medium text-surface-700">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={field('input-field pr-11')}
              placeholder="Enter your password"
            />
            <ShowPasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500/20"
          />
          <span className="text-sm text-surface-600">Remember me</span>
        </label>

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
