import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function Footer({ className = '' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`no-print mt-auto border-t border-surface-200 dark:border-surface-800 bg-white/50 dark:bg-surface-900/50 py-6 backdrop-blur-sm transition-colors ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand and Copyright */}
          <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-600 text-white">
              <FileText size={12} strokeWidth={2} />
            </span>
            <span>
              &copy; {currentYear} Resume Builder. All rights reserved.
            </span>
          </div>

          {/* Legal Compliance & Support Links */}
          <nav className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-surface-600 dark:text-surface-400">
            <Link
              to="/privacy-policy"
              className="font-semibold hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="font-semibold hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-surface-300 dark:text-surface-700">&bull;</span>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=supportbuilderresume@gmail.com&su=Resume%20Builder%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              title="Contact & Support (Opens Gmail)"
            >
              Contact &amp; Support
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
