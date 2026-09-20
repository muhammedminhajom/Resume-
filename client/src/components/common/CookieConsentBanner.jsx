import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Check } from 'lucide-react';

const STORAGE_KEY = 'resume_builder_cookie_consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay for smooth entry
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may fail in strict privacy settings
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: 'accepted', timestamp: Date.now() }));
    } catch {
      // ignore storage error
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: 'declined', timestamp: Date.now() }));
    } catch {
      // ignore storage error
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="no-print fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl animate-fade-in sm:left-6 sm:right-6 lg:left-auto lg:right-6"
    >
      <div className="rounded-2xl border border-surface-200/90 dark:border-surface-700/80 bg-white/95 dark:bg-surface-900/95 p-4 sm:p-5 shadow-elevated backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Cookie size={20} strokeWidth={2} />
          </span>

          <div className="flex-1 text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
            <p className="font-semibold text-surface-900 dark:text-surface-100 text-sm mb-1">
              Cookie &amp; Advertising Notice
            </p>
            <p>
              We use essential cookies to maintain your login session and preferences. Our third-party partners
              (including Google AdSense) may use cookies and web beacons to serve relevant advertisements. Review our{' '}
              <Link
                to="/privacy-policy"
                className="font-semibold text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
              >
                Privacy Policy
              </Link>{' '}
              to learn how your data is protected.
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleAccept}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-[0.98] transition-all"
              >
                <Check size={14} strokeWidth={2.5} />
                Accept All
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-3.5 py-1.5 text-xs font-semibold text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss cookie notice"
            className="rounded-lg p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-surface-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
