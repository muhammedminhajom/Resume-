import { useEffect, useRef } from 'react';

/**
 * Reusable Google AdSense AdSlot component.
 *
 * @param {string} slotId - The AdSense Ad Unit ID (from Google AdSense dashboard).
 * @param {string} format - The ad layout format, defaults to 'auto'.
 * @param {boolean|string} responsive - Whether the unit is responsive, defaults to 'true'.
 * @param {string} className - Additional CSS classes for outer container.
 * @param {object} style - Inline style overrides.
 */
export default function AdSlot({
  slotId = 'XXXXXXXXXX',
  format = 'auto',
  responsive = 'true',
  className = '',
  style = {},
}) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';
  const isRealClient =
    typeof clientId === 'string' &&
    clientId.startsWith('ca-pub-') &&
    !clientId.includes('XXXX') &&
    !clientId.includes('%');
  const isPlaceholder = !slotId || slotId === 'XXXXXXXXXX' || !isRealClient;
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    // Only attempt to push to adsbygoogle once per mount, and only if script is present
    if (!pushedRef.current) {
      try {
        if (typeof window !== 'undefined' && !isPlaceholder) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      } catch (err) {
        // Suppress AdSense push errors in dev or when blocked by ad blockers
        if (isDev) {
          console.warn('[AdSense] AdSlot notice:', err?.message || err);
        }
      }
    }
  }, [slotId, isPlaceholder, isDev]);

  return (
    <div
      className={`no-print relative my-6 flex flex-col items-center justify-center overflow-hidden rounded-xl transition-all ${className}`}
      style={style}
      aria-label="Advertisement"
    >
      {/* Visual indicator / dev placeholder */}
      {isPlaceholder ? (
        <div className="w-full rounded-xl border border-dashed border-surface-300 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-800/40 p-4 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
            Advertisement
          </span>
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            Ad slot ready &bull; Slot ID: <code className="font-mono text-xs text-surface-600 dark:text-surface-300">{slotId}</code>
          </p>
        </div>
      ) : (
        <>
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-surface-400 dark:text-surface-500">
            Advertisement
          </span>
          <ins
            ref={adRef}
            className="adsbygoogle block w-full"
            style={{ display: 'block', minHeight: '90px' }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive={String(responsive)}
          />
        </>
      )}
    </div>
  );
}
