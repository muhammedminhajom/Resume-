import { useState, useEffect } from 'react';
import { Target, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Lightbulb, ArrowRight, Plus } from 'lucide-react';
import { api } from '../api/client';
import ResumeUploadDropzone from '../components/common/ResumeUploadDropzone';

export default function JobMatchPage() {
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

  async function handleCompare(e) {
    e?.preventDefault();
    setError('');
    setResult(null);

    let textToCompare = '';

    if (inputMode === 'select') {
      if (!selectedResumeId) {
        setError('Please select a saved resume.');
        return;
      }
    } else if (inputMode === 'paste') {
      if (!resumeText.trim()) {
        setError('Please paste your resume text to compare.');
        return;
      }
      textToCompare = resumeText.trim();
    } else if (inputMode === 'upload') {
      if (!uploadedText.trim()) {
        setError('Please upload a .pdf or .docx resume first.');
        return;
      }
      textToCompare = uploadedText.trim();
    }

    if (!jobDescription.trim()) {
      setError('Please paste the target job description.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        jobDescription: jobDescription.trim(),
        resumeId: inputMode === 'select' ? selectedResumeId : undefined,
        resumeText: inputMode !== 'select' ? textToCompare : undefined,
      };

      const data = await api.compareJobMatch(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Job match analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const matchScore = result?.matchPercentage ?? 0;
  const matched = result?.matchedKeywords || [];
  const missing = result?.missingKeywords || [];
  const suggestions = result?.suggestions || [];
  const isAi = result?.source === 'gemini-ai';

  const scoreColor =
    matchScore >= 75 ? 'text-emerald-600' : matchScore >= 50 ? 'text-amber-600' : 'text-rose-600';
  const strokeColor =
    matchScore >= 75 ? '#059669' : matchScore >= 50 ? '#d97706' : '#e11d48';

  const isSubmitDisabled =
    loading ||
    parsing ||
    !jobDescription.trim() ||
    (inputMode === 'select' && !selectedResumeId) ||
    (inputMode === 'paste' && !resumeText.trim()) ||
    (inputMode === 'upload' && !uploadedText.trim());

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col gap-1 border-b border-surface-200 dark:border-surface-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Target size={22} strokeWidth={2} />
            </span>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">Job Description Matcher</h1>
          </div>
          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
            Compare your resume against any target role to discover matched competencies, skill gaps, and custom optimizations.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="rounded-card border border-surface-200 bg-white p-6 shadow-card dark:border-surface-800 dark:bg-surface-900">
        <form onSubmit={handleCompare} className="space-y-5">
          {/* Resume Selection with 3-tab toggle */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-surface-600 dark:text-surface-400">
                1. Resume Input Source
              </label>
              <div className="flex flex-wrap rounded-button border border-surface-200 bg-surface-50 p-0.5 text-xs dark:border-surface-800 dark:bg-surface-950">
                <button
                  type="button"
                  disabled={resumes.length === 0}
                  onClick={() => setInputMode('select')}
                  className={`rounded-button px-3 py-1 font-medium transition-colors ${
                    inputMode === 'select'
                      ? 'bg-white font-semibold text-brand-700 shadow-xs dark:bg-surface-800 dark:text-brand-300'
                      : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 disabled:opacity-40'
                  }`}
                >
                  Saved Resumes ({resumes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`rounded-button px-3 py-1 font-medium transition-colors ${
                    inputMode === 'paste'
                      ? 'bg-white font-semibold text-brand-700 shadow-xs dark:bg-surface-800 dark:text-brand-300'
                      : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
                  }`}
                >
                  Paste Raw Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`rounded-button px-3 py-1 font-medium transition-colors ${
                    inputMode === 'upload'
                      ? 'bg-white font-semibold text-brand-700 shadow-xs dark:bg-surface-800 dark:text-brand-300'
                      : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
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
                  <div className="h-10 animate-pulse rounded-lg bg-surface-100 dark:bg-surface-800" />
                ) : resumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="input-field text-sm"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title || 'Untitled Resume'} — {r.personal_info?.headline || 'No headline'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-xs text-surface-600 dark:border-surface-800 dark:bg-surface-950/60 dark:text-surface-400">
                    No saved resumes available. Switch to "Upload File" or "Paste Raw Text" above.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Paste Raw Text */}
            {inputMode === 'paste' && (
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content or bullet points here..."
                rows={5}
                className="input-field text-xs font-mono resize-y"
              />
            )}

            {/* Tab 3: Upload File */}
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

          {/* Job Description Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-surface-600 dark:text-surface-400 mb-1">
              2. Target Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job posting description, requirements, or qualifications here..."
              rows={6}
              className="input-field text-xs resize-y"
              required
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle size={16} className="shrink-0 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Analyzing Skill Match...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Compare Resume to Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Score Card */}
          <div className="rounded-card border border-surface-200 bg-white p-6 shadow-card dark:border-surface-800 dark:bg-surface-900">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                {/* Radial Gauge */}
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
                      strokeDasharray={`${matchScore}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-2xl font-extrabold ${scoreColor}`}>{matchScore}%</span>
                    <span className="text-[10px] font-medium text-surface-400 dark:text-surface-500">Match</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
                      {matchScore >= 80 ? 'High Compatibility' : matchScore >= 55 ? 'Moderate Match' : 'Keyword Gaps Detected'}
                    </h3>
                    <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-semibold text-surface-600 dark:bg-surface-800 dark:text-surface-300">
                      {isAi ? 'Gemini AI Analysis' : 'Keyword Engine'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-surface-600 dark:text-surface-400 max-w-xl">
                    {result.summary || `Found ${matched.length} matching skills and identified ${missing.length} opportunities for keyword alignment.`}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-3 border-t sm:border-t-0 sm:border-l border-surface-200 dark:border-surface-800 pt-3 sm:pt-0 sm:pl-6 text-center">
                <div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{matched.length}</div>
                  <div className="text-[11px] font-medium text-surface-500 dark:text-surface-400">Matched</div>
                </div>
                <div className="w-px bg-surface-200 dark:bg-surface-800" />
                <div>
                  <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{missing.length}</div>
                  <div className="text-[11px] font-medium text-surface-500 dark:text-surface-400">Missing</div>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords Breakdown Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Matched Keywords */}
            <div className="rounded-card border border-surface-200 bg-white p-5 shadow-card dark:border-surface-800 dark:bg-surface-900">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-800 dark:text-surface-200">
                  Matched Keywords ({matched.length})
                </h4>
              </div>
              {matched.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {matched.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-surface-400 dark:text-surface-500 italic">No direct keyword matches detected in candidate profile.</p>
              )}
            </div>

            {/* Missing Keywords */}
            <div className="rounded-card border border-surface-200 bg-white p-5 shadow-card dark:border-surface-800 dark:bg-surface-900">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  Missing Keywords ({missing.length})
                </h4>
              </div>
              {missing.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All prominent job description skills were identified!</p>
              )}
            </div>
          </div>

          {/* Actionable Suggestions */}
          {suggestions.length > 0 && (
            <div className="rounded-card border border-surface-200 bg-white p-5 shadow-card dark:border-surface-800 dark:bg-surface-900">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-amber-500 dark:text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-800 dark:text-surface-200">
                  Recommended Tailoring Steps
                </h4>
              </div>
              <ul className="space-y-2">
                {suggestions.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-surface-700 dark:text-surface-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
