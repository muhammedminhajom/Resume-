import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="absolute inset-0 animate-fade-in bg-surface-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`card relative w-full ${maxWidth} animate-slide-up shadow-modal`}>
        <div className="flex items-start justify-between border-b border-surface-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-surface-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-surface-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-button p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
