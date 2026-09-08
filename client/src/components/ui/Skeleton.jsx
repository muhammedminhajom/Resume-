export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-surface-200 dark:bg-surface-800 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24 bg-surface-100 dark:bg-surface-800/60" />
        <Skeleton className="h-8 bg-surface-100 dark:bg-surface-800/60" />
      </div>
    </div>
  );
}
