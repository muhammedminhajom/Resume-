import { useEffect, useRef, useState, useMemo } from 'react';
import MiniPreview from './preview/MiniPreview';
import { sanitizeObject } from '../lib/sanitize';

const TEMPLATE_META = {
  modern: { label: 'Modern', badge: 'badge badge-brand' },
  classic: { label: 'Classic', badge: 'badge badge-gray' },
  minimal: { label: 'Minimal', badge: 'badge badge-gray' },
};

function formatRelative(value) {
  if (!value) return '—';
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ResumeCard({ resume, onEdit, onDelete, onDuplicate }) {
  const meta = TEMPLATE_META[resume.template] || TEMPLATE_META.modern;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const safeResume = useMemo(() => sanitizeObject(resume), [resume]);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="group card flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      {/* Resume thumbnail */}
      <button
        onClick={onEdit}
        className="relative block h-48 w-full cursor-pointer overflow-hidden border-b border-surface-100 bg-surface-50 transition-colors hover:bg-surface-100"
        aria-label={`Edit ${resume.title || 'resume'}`}
      >
        <div className="pointer-events-none scale-[0.28] origin-top-left">
          <MiniPreview resume={safeResume} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-button bg-white/90 px-2 py-1 text-[10px] font-semibold text-surface-700 opacity-0 shadow-card backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          Open
        </span>
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-surface-900" title={resume.title}>
              {resume.title || 'Untitled Resume'}
            </h3>
            <p className="mt-0.5 text-xs text-surface-400">
              Updated {formatRelative(resume.updated_at)}
            </p>
          </div>
          <span className={meta.badge}>{meta.label}</span>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <button onClick={onEdit} className="btn-secondary flex-1 !py-1.5 !px-3 text-[13px]">
            Edit
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="icon-btn border border-surface-200 bg-white"
              title="More actions"
              aria-label={`More actions for ${resume.title || 'resume'}`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-button border border-surface-200 bg-white shadow-elevated animate-scale-in"
                role="menu"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-surface-700 transition-colors hover:bg-surface-50"
                >
                  <svg className="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" />
                  </svg>
                  Duplicate
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2.5 border-t border-surface-100 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.111 48.111 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
