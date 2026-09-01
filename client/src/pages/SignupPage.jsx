import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);
  const strengthMeta = STRENGTH_COLORS[strength];

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
      await signup(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function toggle(target) {
    setForm((f) => ({ ...f, [target]: !f[target] }));
  }

  return (
    <AuthLayout
      title="Create your professional resume"
      subtitle="Get started for free and build resumes that stand out."
      footer={
        <p className="text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <ErrorAlert message={error} />

        <div>
          <label htmlFor="signup-name" className="label-text">Full name</label>
          <input
            id="signup-name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="label-text">Email</label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="label-text">Password</label>
          <div className="relative">
            <input
              id="signup-password"
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
              onClick={() => toggle('showPassword')}
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
          <label htmlFor="signup-confirm" className="label-text">Confirm password</label>
          <input
            id="signup-confirm"
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
