import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import ResumeUploadDropzone from '../components/common/ResumeUploadDropzone';

export default function AtsCheckerPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [inputMode, setInputMode] = useState('select'); // 'select' | 'paste' | 'upload'
  
  const [uploadedText, setUploadedText] = useState('');
  const [uploadedInfo, setUploadedInfo] = useState(null);
  const [parsing, setParsing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadResumes() {
      try {
        const res = await api.get('/resumes');
        const list = res.resumes || [];
        setResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
        } else {
          setInputMode('upload');
        }
      } catch (err) {
        console.warn('Could not load resumes:', err.message);
        setInputMode('upload');
      } finally {
        setInitialLoading(false);
      }
    }
    loadResumes();
  }, []);

  async function handleAnalyze(e) {
    e?.preventDefault();
    setError('');
    setResult(null);

    let textToAnalyze = '';

    if (inputMode === 'select') {
      if (!selectedResumeId) {
        setError('Please choose a saved resume or switch to upload/paste mode.');
        return;
      }
    } else if (inputMode === 'paste') {
      if (!resumeText.trim()) {
        setError('Please paste your resume text to analyze.');
        return;
      }
      textToAnalyze = resumeText.trim();
    } else if (inputMode === 'upload') {
      if (!uploadedText.trim()) {
        setError('Please upload a .pdf or .docx resume first.');
        return;
      }
      textToAnalyze = uploadedText.trim();
    }

    setLoading(true);
    try {
      let data;
      if (inputMode === 'select' && selectedResumeId) {
        data = await api.getAtsScore(selectedResumeId, jobDescription.trim());
      } else {
        data = await api.getRawAtsScore(textToAnalyze, jobDescription.trim());
      }
      setResult(data);
    } catch (err) {
      setError(err.message || 'ATS analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const score = result?.score ?? 0;
  const rating = result?.summary?.rating || 'Pending';
  const checks = result?.checks || [];
  const passedCount = result?.summary?.passedCount || 0;
  const totalCount = result?.summary?.totalCount || checks.length;
  const jobMatch = result?.jobMatch;

  const scoreColor =
    score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';
  const strokeColor =
    score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#e11d48';
  const badgeBg =
    score >= 80
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : score >= 60
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  const isSubmitDisabled =
    loading ||
    parsing ||
    (inputMode === 'select' && !selectedResumeId) ||
    (inputMode === 'paste' && !resumeText.trim()) ||
    (inputMode === 'upload' && !uploadedText.trim());

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col gap-1 border-b border-surface-200 dark:border-surface-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <ShieldCheck size={22} strokeWidth={2} />
            </span>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">Standalone ATS Checker</h1>
          </div>
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            Scan your resume against strict Applicant Tracking System parsing filters & evaluate job keyword density.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="rounded-card border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-card transition-colors">
        <form onSubmit={handleAnalyze} className="space-y-5">
          {/* Mode switch — 3-tab toggle */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-surface-600 dark:text-surface-300">
                1. Resume Input Source
              </label>
              <div className="flex flex-wrap rounded-button border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-0.5 text-xs">
                <button
                  type="button"
                  disabled={resumes.length === 0}
                  onClick={() => setInputMode('select')}
                  className={`rounded-button px-3 py-1 font-medium transition-colors ${
                    inputMode === 'select'
                      ? 'bg-white dark:bg-surface-700 font-semibold text-brand-700 dark:text-brand-300 shadow-xs'
                      : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 disabled:opacity-40'
                  }`}
                >
                  Saved Resumes ({resumes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`rounded-button px-3 py-1 font-medium transition-colors ${
                    inputMode === 'paste'
                      ? 'bg-white dark:bg-surface-700 font-semibold text-brand-700 dark:text-brand-300 shadow-xs'
                      : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                  }`}
                >
                  Paste Raw Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`rounded-button px-3 py-1 font-medium transition-colors ${
                    inputMode === 'upload'
                      ? 'bg-white dark:bg-surface-700 font-semibold text-brand-700 dark:text-brand-300 shadow-xs'
                      : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                  }`}
                >
                  Upload File (.pdf / .docx)
                </button>
              </div>
            </div>

            {/* Tab 1: Saved Resumes */}
            {inputMode === 'select' && (
              <div>
                {initialLoading ? (
                  <div className="h-10 animate-pulse rounded-lg bg-surface-100" />
                ) : resumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="input-field text-sm"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title || 'Untitled Resume'} — Last modified {new Date(r.updatedAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-xs text-surface-600">
                    No saved resumes found. Switch to &quot;Upload File&quot; or &quot;Paste Raw Text&quot; above.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Paste Raw Text */}
            {inputMode === 'paste' && (
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste full plain text of your resume here (Contact info, Summary, Experience, Skills, Education)..."
                rows={6}
                className="input-field text-xs font-mono resize-y"
              />
            )}

            {/* Tab 3: Upload File (.pdf / .docx) */}
            {inputMode === 'upload' && (
              <ResumeUploadDropzone
                uploadedInfo={uploadedInfo}
                parsing={parsing}
                setParsing={setParsing}
                onTextExtracted={(text, info) => {
                  setUploadedText(text);
                  setUploadedInfo(info);
                }}
                onClear={() => {
                  setUploadedText('');
                  setUploadedInfo(null);
                }}
              />
            )}
          </div>

          {/* Job Description input (optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-surface-600">
                2. Target Job Description (Optional)
              </label>
              <span className="text-[11px] text-surface-400">Scans for keyword overlap & gaps</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job requirements or job posting text here to evaluate keyword match %..."
              rows={4}
              className="input-field text-xs resize-y"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Analyzing ATS Compliance...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Score Header Card */}
          <div className="rounded-card border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-card transition-colors">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                {/* Gauge */}
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-100 dark:text-surface-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      stroke={strokeColor}
                      strokeWidth="3.5"
                      strokeDasharray={`${score}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-2xl font-extrabold ${scoreColor}`}>{score}</span>
                    <span className="text-[10px] font-medium text-surface-400 dark:text-surface-500">/ 100</span>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold ${badgeBg}`}>
                    {rating}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-surface-900 dark:text-surface-100">
                    Passed {passedCount} of {totalCount} Standard Checks
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Evaluated against reverse-chronological order, plain fonts, action verbs, and quantifiable metrics.
                  </p>
                </div>
              </div>

              {jobMatch?.jdAnalyzed && (
                <div className="rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-4 text-center sm:text-right">
                  <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">Job Keyword Match</span>
                  <div className="text-2xl font-black text-brand-700 dark:text-brand-400">{jobMatch.matchScore}%</div>
                  <span className="text-[11px] text-surface-400 dark:text-surface-500">
                    {jobMatch.matchedKeywords.length} of {jobMatch.totalKeywordsChecked} keywords matched
                  </span>
                </div>
              )}
            </div>

            {/* Keyword chips if JD was provided */}
            {jobMatch?.jdAnalyzed && (
              <div className="mt-6 border-t border-surface-200 dark:border-surface-800 pt-5 space-y-3">
                {jobMatch.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Missing Keywords from Job Description ({jobMatch.missingKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {jobMatch.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {jobMatch.matchedKeywords.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      Matched Keywords ({jobMatch.matchedKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {jobMatch.matchedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Checks Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-700 dark:text-surface-300">
              Audit Breakdown ({passedCount}/{totalCount})
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {checks.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-card border p-4 transition-colors ${
                    c.passed
                      ? 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900'
                      : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {c.passed ? (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={14} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                          <AlertCircle size={14} strokeWidth={2.5} />
                        </span>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-surface-900 dark:text-surface-100">{c.label}</h4>
                          <span className="rounded bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 text-[10px] font-semibold text-surface-500 dark:text-surface-400">
                            {c.category}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-surface-600 dark:text-surface-400">{c.details}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-surface-700 dark:text-surface-300 tabular-nums">
                      {c.score}/{c.maxScore}
                    </span>
                  </div>

                  {c.suggestion && (
                    <div className="mt-3 rounded-button border border-amber-200/80 dark:border-amber-900/40 bg-white dark:bg-surface-900 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                      <span className="font-semibold text-amber-700 dark:text-amber-400">Recommendation: </span>
                      {c.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
