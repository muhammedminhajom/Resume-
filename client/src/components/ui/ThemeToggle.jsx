import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-600 shadow-sm transition-all duration-200 hover:border-surface-300 hover:bg-surface-50 hover:text-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-surface-600 dark:hover:bg-surface-750 dark:hover:text-surface-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? (
        <Sun
          size={18}
          strokeWidth={2}
          className="text-amber-400 transition-transform duration-300 group-hover:rotate-45"
        />
      ) : (
        <Moon
          size={18}
          strokeWidth={2}
          className="text-surface-600 transition-transform duration-300 group-hover:-rotate-12"
        />
      )}
    </button>
  );
}
