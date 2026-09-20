import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { AuthLayout, ErrorAlert } from './LoginPage';

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = [
  { bar: 'bg-surface-300', text: 'text-surface-500' },
  { bar: 'bg-red-500', text: 'text-red-600' },
  { bar: 'bg-amber-500', text: 'text-amber-600' },
  { bar: 'bg-lime-500', text: 'text-lime-600' },
  { bar: 'bg-emerald-500', text: 'text-emerald-600' },
];

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);
  const strengthMeta = STRENGTH_COLORS[strength];

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is missing or invalid."
        footer={
          <p className="text-center text-sm text-surface-500">
            <Link to="/forgot-password" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Request a new link
            </Link>
          </p>
        }
      >
        <div className="flex items-center gap-2.5 rounded-input border border-red-200 bg-red-50 px-4 py-3 animate-fade-in">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">Missing or invalid reset token. Please request a new password reset link.</p>
        </div>
      </AuthLayout>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Your new password must be at least 6 characters."
      footer={
        success ? (
          <p className="text-center text-sm text-surface-500">
            <Link to="/login" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Sign in with new password
            </Link>
          </p>
        ) : (
          <p className="text-center text-sm text-surface-500">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Sign in
            </Link>
          </p>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {success ? (
          <div className="flex items-start gap-2.5 rounded-input border border-emerald-200 bg-emerald-50 px-4 py-3 animate-fade-in">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-emerald-700">Your password has been reset successfully.</p>
          </div>
        ) : (
          <>
            <ErrorAlert message={error} />
            <div>
              <label htmlFor="reset-password" className="label-text">New password</label>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-11"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 transition-colors hover:text-surface-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
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
              </div>
              {form.password && (
                <div className="mt-2 animate-fade-in">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                          i < strength ? strengthMeta.bar : 'bg-surface-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`mt-1.5 text-xs font-medium ${strengthMeta.text}`}>
                    {form.password.length === 0 ? '' : `Password strength: ${STRENGTH_LABELS[strength]}`}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reset-confirm" className="label-text">Confirm password</label>
              <input
                id="reset-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="Re-enter your password"
              />
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Resetting...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </>
        )}
      </form>
    </AuthLayout>
  );
}