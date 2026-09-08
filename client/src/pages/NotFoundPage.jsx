import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
      <p className="text-7xl font-bold tracking-tight text-surface-200 dark:text-surface-800">404</p>
      <h1 className="mt-4 text-xl font-semibold text-surface-900 dark:text-surface-100">Page not found</h1>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn-primary mt-6">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
        </svg>
        Back to dashboard
      </Link>
    </div>
  );
}
