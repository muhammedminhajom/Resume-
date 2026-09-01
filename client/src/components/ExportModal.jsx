import { useState } from 'react';
import Modal from './ui/Modal';
import MiniPreview from './preview/MiniPreview';
import { sanitizeObject } from '../lib/sanitize';

export default function ExportModal({ open, onClose, resume, onDownload, onPrint, exporting }) {
  const safeResume = sanitizeObject(resume);
  const [tab, setTab] = useState('pdf');
  const [result, setResult] = useState(''); // '' | 'success' | 'error'

  async function handleDownload() {
    setResult('');
    const res = await onDownload();
    if (res?.success) setResult('success');
    else setResult('error');
  }

  function handleClose() {
    setResult('');
    onClose();
  }

  const status = exporting ? 'loading' : result;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Export your resume"
      subtitle="Preview and choose how to download your resume."
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Format tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTab('pdf')}
            aria-pressed={tab === 'pdf'}
            className={`flex items-center justify-center gap-2.5 rounded-button border px-4 py-3 text-sm font-medium transition-all ${
              tab === 'pdf'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/15'
                : 'border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            PDF
          </button>
          <button
            onClick={() => setTab('docx')}
            aria-pressed={tab === 'docx'}
            className={`flex items-center justify-center gap-2.5 rounded-button border px-4 py-3 text-sm font-medium transition-all ${
              tab === 'docx'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/15'
                : 'border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            DOCX
          </button>
          <button
            onClick={() => setTab('print')}
            aria-pressed={tab === 'print'}
            className={`flex items-center justify-center gap-2.5 rounded-button border px-4 py-3 text-sm font-medium transition-all ${
              tab === 'print'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/15'
                : 'border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" />
            </svg>
            Print
          </button>
        </div>

        {/* Status messages */}
        {status === 'loading' && (
          <div className="flex items-center gap-2.5 rounded-input border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 animate-fade-in">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Preparing your PDF...
          </div>
        )}
        {status === 'success' && (
          <div className="flex items-center gap-2.5 rounded-input border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 animate-fade-in">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            Your resume is ready.
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2.5 rounded-input border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Unable to export your resume. Please try again.
          </div>
        )}

        {/* Preview */}
        <div>
          <p className="label-text">Preview</p>
          <div className="flex justify-center overflow-hidden rounded-input border border-surface-200 bg-surface-50 p-4">
            <div className="scale-[0.35] origin-top">
              <MiniPreview resume={safeResume} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-surface-100 pt-4">
          <button onClick={handleClose} className="btn-secondary">Close</button>
          {tab === 'pdf' ? (
            <button onClick={handleDownload} disabled={exporting} className="btn-primary">
              {exporting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Preparing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          ) : tab === 'docx' ? (
            <button onClick={handleDownload} disabled={exporting} className="btn-primary">
              {exporting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Preparing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Download DOCX
                </>
              )}
            </button>
          ) : (
            <button onClick={() => { setResult(''); onPrint(); }} className="btn-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659" />
              </svg>
              Print
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
