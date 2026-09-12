import { useEffect, useRef, useState, useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import ATSResumeTemplate from '../preview/ATSResumeTemplate';
import { sanitizeObject } from '../../lib/sanitize';
import { ATS_FONTS, isResumeEmpty } from '../../lib/resume';

const A4_WIDTH = 820;

export default function Preview({ onExport, onExportDocx, exporting, onToast }) {
  const { resume, setSection } = useResume();
  const [zoom, setZoom] = useState(100);
  const scrollRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(A4_WIDTH);

  const safeResume = useMemo(() => sanitizeObject(resume), [resume]);
  const isEmpty = useMemo(() => isResumeEmpty(safeResume), [safeResume]);

  useEffect(() => {
    function update() {
      if (!scrollRef.current) return;
      setScrollWidth(scrollRef.current.clientWidth - 32);
    }
    update();
    const observer = new ResizeObserver(update);
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  const effectiveZoom = Math.min(zoom, (scrollWidth / A4_WIDTH) * 100);
  const selectedFont = resume.font || resume.template || 'Arial';

  async function handleDownload() {
    const result = await onExport?.();
    if (result?.success) onToast?.('Your resume is ready.', 'success');
    else onToast?.(result?.message || 'Something went wrong.', 'error');
  }

  async function handleDocxDownload() {
    const result = await onExportDocx?.();
    if (result?.success) onToast?.('Your resume is ready.', 'success');
    else onToast?.(result?.message || 'Something went wrong.', 'error');
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between gap-2 rounded-button border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-2.5 py-2 shadow-card transition-colors">
        {/* Font select */}
        <label className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-surface-500 dark:text-surface-400 sm:inline">ATS Font:</span>
          <div className="relative">
            <select
              value={selectedFont}
              onChange={(e) => {
                setSection('font', e.target.value);
                setSection('template', e.target.value);
              }}
              className="select-field !w-auto !py-1.5 !pl-3 !pr-8 text-xs font-medium"
              aria-label="ATS Font"
            >
              {ATS_FONTS.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </label>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 rounded-button border border-surface-200 dark:border-surface-700 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="icon-btn !h-7 !w-7"
              aria-label="Zoom out"
              disabled={zoom <= 50}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            <span className="w-11 text-center text-xs font-medium text-surface-600 dark:text-surface-300 tabular-nums">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="icon-btn !h-7 !w-7"
              aria-label="Zoom in"
              disabled={zoom >= 150}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-surface-200 dark:bg-surface-700" />

          {/* Direct Export Buttons: Download PDF | Download DOCX */}
          <button
            onClick={handleDownload}
            disabled={exporting || isEmpty}
            className="btn-primary !py-1.5 !px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download PDF"
          >
            {exporting ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            Download PDF
          </button>
          <button
            onClick={handleDocxDownload}
            disabled={exporting || isEmpty}
            className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download DOCX"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Download DOCX
          </button>
        </div>
      </div>

      {/* A4 preview area with realistic paper or empty state */}
      <div
        ref={scrollRef}
        className="scrollbar-thin flex min-h-[500px] h-[calc(100vh-16rem)] flex-col overflow-auto rounded-card bg-surface-100 dark:bg-surface-900/60 ring-1 ring-surface-200/50 dark:ring-surface-800 p-4 sm:p-6 transition-colors"
      >
        {isEmpty ? (
          <div
            data-testid="preview-empty-state"
            className="my-auto flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-surface-800 shadow-card ring-1 ring-surface-200 dark:ring-surface-700 text-surface-400 dark:text-surface-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-surface-800 dark:text-surface-100">
              Your resume will appear here
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-surface-500 dark:text-surface-400">
              Fill in your details in the sections on the left to see your ATS-formatted resume preview in real time.
            </p>
          </div>
        ) : (
          <div className="print-area mx-auto transition-all duration-200">
            <div
              className="overflow-hidden bg-white shadow-elevated ring-1 ring-surface-900/[0.08]"
              style={{
                width: (A4_WIDTH * effectiveZoom) / 100,
                height: (A4_WIDTH * 1.414 * effectiveZoom) / 100,
              }}
            >
              <div
                style={{
                  transform: `scale(${effectiveZoom / 100})`,
                  transformOrigin: 'top left',
                  width: A4_WIDTH,
                  padding: '44px 48px',
                }}
              >
                <ATSResumeTemplate resume={safeResume} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
