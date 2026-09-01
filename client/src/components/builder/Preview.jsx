import { useEffect, useRef, useState, useMemo } from 'react';
import { useResume } from '../../context/ResumeContext';
import ModernTemplate from '../preview/ModernTemplate';
import ClassicTemplate from '../preview/ClassicTemplate';
import MinimalTemplate from '../preview/MinimalTemplate';
import ExportModal from '../ExportModal';
import { sanitizeObject } from '../../lib/sanitize';

const TEMPLATES = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
};

const A4_WIDTH = 820;

export default function Preview({ onExport, onExportDocx, exporting, onToast }) {
  const { resume, setSection } = useResume();
  const [zoom, setZoom] = useState(100);
  const [exportOpen, setExportOpen] = useState(false);
  const scrollRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(A4_WIDTH);

  const safeResume = useMemo(() => sanitizeObject(resume), [resume]);

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
  const Template = TEMPLATES[safeResume.template] || ModernTemplate;

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
      <div className="no-print flex items-center justify-between gap-2 rounded-button border border-surface-200 bg-white px-2.5 py-2 shadow-card">
        {/* Template select */}
        <label className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-surface-400 sm:inline">Template:</span>
          <div className="relative">
            <select
              value={resume.template}
              onChange={(e) => setSection('template', e.target.value)}
              className="select-field !w-auto !py-1.5 !pl-3 !pr-8 text-xs font-medium"
              aria-label="Resume template"
            >
              {Object.entries(TEMPLATE_OPTIONS()).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </label>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 rounded-button border border-surface-200 p-0.5">
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
            <span className="w-11 text-center text-xs font-medium text-surface-600 tabular-nums">{zoom}%</span>
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

          <div className="mx-1 h-5 w-px bg-surface-200" />

          <button onClick={() => window.print()} className="btn-secondary !py-1.5 !px-2.5 text-xs">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" />
            </svg>
            Print
          </button>
          <button onClick={() => setExportOpen(true)} className="btn-primary !py-1.5 !px-3 text-xs">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </button>
          <button onClick={() => setExportOpen(true)} className="btn-secondary !py-1.5 !px-3 text-xs">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Download DOCX
          </button>
        </div>
      </div>

      {/* A4 preview area with realistic paper */}
      <div
        ref={scrollRef}
        className="scrollbar-thin h-[calc(100vh-16rem)] min-h-[500px] overflow-auto rounded-card bg-surface-100 ring-1 ring-surface-200/50 p-4 sm:p-6"
      >
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
              <Template resume={safeResume} />
            </div>
          </div>
        </div>
      </div>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        resume={resume}
        onDownload={handleDownload}
        onExportDocx={handleDocxDownload}
        onPrint={() => window.print()}
        exporting={exporting}
      />
    </div>
  );
}

function TEMPLATE_OPTIONS() {
  return { modern: 'Modern', classic: 'Classic', minimal: 'Minimal' };
}
