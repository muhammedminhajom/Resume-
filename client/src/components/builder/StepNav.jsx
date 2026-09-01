export default function StepNav({ steps, current, onSelect, completion }) {
  const completedCount = steps.filter((s) => s.count > 0).length;
  const progress =
    typeof completion === 'number' ? completion : Math.round((completedCount / steps.length) * 100);

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">Resume completion</span>
          <span className="text-xs font-semibold text-surface-700">{progress}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-200"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <nav className="space-y-1" aria-label="Resume sections">
        {steps.map((step, i) => {
          const active = i === current;
          const completed = step.count > 0;
          return (
            <button
              key={step.key}
              onClick={() => onSelect(i)}
              aria-current={active ? 'step' : undefined}
              className={`group flex w-full items-center gap-3 rounded-button px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : completed
                  ? 'text-surface-700 hover:bg-surface-100'
                  : 'text-surface-500 hover:bg-surface-100'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-brand-600 text-white ring-2 ring-brand-600/25'
                    : completed
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-surface-100 text-surface-400'
                }`}
                aria-hidden="true"
              >
                {completed ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className={active ? 'text-white' : ''}>{i + 1}</span>
                )}
              </span>
              <span className={`font-medium ${active ? 'text-brand-700' : ''}`}>{step.label}</span>
              {active && (
                <span className="ml-auto text-brand-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
