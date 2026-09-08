import { useState } from 'react';

const inputBase =
  'w-full rounded-input border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-900 shadow-card transition-all duration-150 placeholder:text-surface-400 hover:border-surface-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500 dark:hover:border-surface-600 dark:focus:border-brand-400 dark:focus:ring-brand-500/25';

const inputError =
  'border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-500/15 dark:border-red-800 dark:focus:border-red-500';

const inputMixin = `rounded-input border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-900 shadow-card transition-all duration-150 placeholder:text-surface-400 hover:border-surface-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500 dark:hover:border-surface-600 dark:focus:border-brand-400 dark:focus:ring-brand-500/25`;

export function Input({ label, value, onChange, placeholder, type = 'text', className = '', helper, error }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</span>}
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`${inputMixin} ${error ? inputError : ''}`}
      />
      {error && <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{error}</span>}
      {helper && !error && <span className="mt-1 block text-xs text-surface-400 dark:text-surface-500">{helper}</span>}
    </label>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</span>}
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputMixin} resize-y`}
      />
    </label>
  );
}

export function FieldGrid({ children, cols = 'sm:grid-cols-2 xl:grid-cols-3' }) {
  return <div className={`grid grid-cols-1 gap-4 ${cols}`}>{children}</div>;
}

/* Collapsible expandable card with drag handle */
export function ExpandableCard({ title, subtitle, onRemove, onToggle, expanded, children, dragHandle }) {
  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-card-hover">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 sm:px-5">
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {dragHandle}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-surface-900 dark:text-surface-100">{title || 'Untitled entry'}</p>
            {subtitle && <p className="truncate text-xs text-surface-400 dark:text-surface-500">{subtitle}</p>}
          </div>
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse entry' : 'Expand entry'}
          className="icon-btn"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="icon-btn hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            aria-label="Remove entry"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t border-surface-100 dark:border-surface-800 px-4 py-4 sm:px-5 animate-fade-in">
          <div className="space-y-4">{children}</div>
        </div>
      )}
    </div>
  );
}

/* Legacy entry card for backward compat */
export function EntryCard({ title, children, onRemove, badge }) {
  return (
    <div className="card p-4 transition-shadow hover:shadow-card-hover">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {badge && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 text-[11px] font-semibold text-surface-500 dark:text-surface-400">
              {badge}
            </span>
          )}
          <span className="truncate text-sm font-semibold text-surface-800 dark:text-surface-200">{title || 'Untitled entry'}</span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="icon-btn hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            aria-label="Remove entry"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-button border-2 border-dashed border-surface-200 dark:border-surface-700 px-4 py-3 text-sm font-medium text-surface-500 dark:text-surface-400 transition-all duration-150 hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-950/30 hover:text-brand-600 dark:hover:text-brand-400"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {label}
    </button>
  );
}

export function EmptyHint({ message }) {
  return (
    <p className="rounded-input border border-dashed border-surface-200 dark:border-surface-800 px-4 py-6 text-center text-sm text-surface-400 dark:text-surface-500">
      {message}
    </p>
  );
}

/* Drag handle icon for reordering */
export function DragHandle({ isDragging }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${isDragging ? 'text-brand-500' : 'text-surface-300 dark:text-surface-600'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M7 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM13 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM13 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM13 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
    </svg>
  );
}

/* Tag / chip input for skills and technologies */
export function TagInput({ value, onChange, placeholder, label }) {
  const [draft, setDraft] = useState('');
  const items = value || [];

  function commit() {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...new Set([...items, ...parts])]);
    setDraft('');
  }

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</span>}
      <div className={`flex flex-wrap items-center gap-1.5 rounded-input border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-2 shadow-card transition-all duration-150 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15 hover:border-surface-300 dark:hover:border-surface-600`}>
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="group inline-flex items-center gap-1.5 rounded-button bg-surface-100 dark:bg-surface-700 py-1 pl-2.5 pr-1.5 text-xs font-medium text-surface-700 dark:text-surface-200"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-surface-400 dark:text-surface-400 transition-colors hover:text-red-500"
              aria-label={`Remove ${item}`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
          className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-surface-900 dark:text-surface-100 outline-none placeholder:text-surface-400 dark:placeholder:text-surface-500"
          aria-label={label || 'Add items'}
        />
      </div>
    </div>
  );
}
