export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div
      className={`card flex flex-col items-center rounded-modal px-8 py-16 text-center ${className}`}
      role="status"
    >
      {icon && (
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-50 to-surface-100 ring-1 ring-surface-200/60 dark:from-surface-800 dark:to-surface-800/80 dark:ring-surface-700">
          <div className="absolute inset-0 rounded-2xl bg-brand-500/5" aria-hidden="true" />
          <div className="relative">{icon}</div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-surface-500 dark:text-surface-400">{description}</p>
      )}
      {action && (
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">{action}</div>
      )}
    </div>
  );
}
