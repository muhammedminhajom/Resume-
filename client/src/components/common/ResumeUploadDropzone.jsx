import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ResumeUploadDropzone({
  onTextExtracted,
  onClear,
  uploadedInfo,
  parsing,
  setParsing,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError('');

    // Format validation
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      setError('Invalid file type. Please upload a .pdf or .docx resume.');
      return;
    }

    // Size validation
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File is too large (${formatBytes(file.size)}). Maximum allowed size is 5MB.`);
      return;
    }

    setParsing(true);
    try {
      const res = await api.uploadResume(file);
      if (res && res.text) {
        onTextExtracted(res.text, {
          filename: res.filename || file.name,
          size: res.size || file.size,
          charCount: res.text.length,
        });
      } else {
        setError('No text could be extracted from this document.');
      }
    } catch (err) {
      setError(err.message || 'Failed to parse resume document. Please try pasting the text instead.');
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleRemove() {
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onClear();
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {uploadedInfo ? (
        /* File Uploaded Success Card */
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <FileText size={20} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-xs font-bold text-surface-900 dark:text-surface-100">{uploadedInfo.filename}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 size={11} /> Ready
                </span>
              </div>
              <p className="text-[11px] text-surface-500 dark:text-surface-400">
                {formatBytes(uploadedInfo.size)} • {uploadedInfo.charCount?.toLocaleString()} characters extracted
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-button border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-2.5 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors shadow-xs"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-button p-1.5 text-surface-400 hover:bg-white dark:hover:bg-surface-700 hover:text-rose-600 transition-colors"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !parsing && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 scale-[1.005]'
              : 'border-surface-200 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-900/60 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-white dark:hover:bg-surface-800'
          } ${parsing ? 'opacity-75 pointer-events-none' : ''}`}
        >
          {parsing ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <RefreshCw size={24} className="animate-spin text-brand-600" />
              <p className="text-xs font-semibold text-surface-800 dark:text-surface-200">Extracting text from resume...</p>
              <p className="text-[11px] text-surface-400 dark:text-surface-500">Parsing PDF / Word document structure</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-xs">
                <UploadCloud size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-surface-800 dark:text-surface-200">
                  <span className="text-brand-600 dark:text-brand-400 underline underline-offset-2">Click to browse</span> or drag and drop your resume
                </p>
                <p className="mt-0.5 text-[11px] text-surface-400 dark:text-surface-500">
                  Supports PDF (.pdf) and Microsoft Word (.docx) up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inline Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
          <span className="leading-snug">{error}</span>
        </div>
      )}
    </div>
  );
}
