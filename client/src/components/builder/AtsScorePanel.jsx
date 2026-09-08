import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client';
import { useResume } from '../../context/ResumeContext';

export default function AtsScorePanel({ open, onClose, resumeId, onToast }) {
  const { resume, setSection } = useResume();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState('breakdown'); // 'breakdown' | 'jd'

  const fetchScore = useCallback(async (jdText = jobDescription) => {
    if (!resumeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getAtsScore(resumeId, jdText);
      setData(res);
    } catch (err) {
      setError(err.message || 'Unable to analyze resume.');
    } finally {
      setLoading(false);
    }
  }, [resumeId, jobDescription]);

  useEffect(() => {
    if (open && resumeId) {
      fetchScore();
    }
  }, [open, resumeId, fetchScore]);

  function handleAddSkill(keyword) {
    const current = resume.skills || [];
    if (!current.includes(keyword)) {
      const updated = [...current, keyword];
      setSection('skills', updated);
      onToast?.(`Added "${keyword}" to skills.`, 'success');
      // Re-run analysis with current JD
      setTimeout(() => fetchScore(jobDescription), 300);
    }
  }

  if (!open) return null;

  const score = data?.score ?? 0;
  const rating = data?.summary?.rating || 'Calculating...';
  const checks = data?.checks || [];
  const passedCount = data?.summary?.passedCount || 0;
  const totalCount = data?.summary?.totalCount || checks.length;
  const jobMatch = data?.jobMatch;

  const scoreColor =
    score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';
  const strokeColor =
    score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#e11d48';
  const bgBadge =
    score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
    'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold text-surface-900">ATS Score & Review</h2>
              <p className="text-xs text-surface-500">Applicant Tracking System optimization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
            aria-label="Close panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Score Overview Banner */}
        <div className="border-b border-surface-200 bg-surface-50 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Circular Gauge */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-200"
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
                  <span className={`text-xl font-extrabold ${scoreColor}`}>{score}</span>
                  <span className="text-[10px] font-medium text-surface-400">/100</span>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bgBadge}`}>
                  {rating}
                </span>
                <p className="mt-1 text-xs text-surface-600">
                  Passed <strong className="font-semibold text-surface-900">{passedCount}</strong> of <strong className="font-semibold text-surface-900">{totalCount}</strong> standard ATS checks
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchScore()}
              disabled={loading}
              className="btn-secondary !py-1.5 !px-3 text-xs"
              title="Refresh analysis"
            >
              {loading ? (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              )}
              Re-scan
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 flex gap-2 border-t border-surface-200/80 pt-3">
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`rounded-button px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'breakdown'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-surface-600 hover:bg-surface-200/60'
              }`}
            >
              Checks Breakdown ({passedCount}/{totalCount})
            </button>
            <button
              onClick={() => setActiveTab('jd')}
              className={`rounded-button px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'jd'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-surface-600 hover:bg-surface-200/60'
              }`}
            >
              Job Match & Keywords {jobMatch?.jdAnalyzed ? `(${jobMatch.matchScore}%)` : ''}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className={`rounded-card border p-4 transition-colors ${
                    check.passed
                      ? 'border-surface-200 bg-white'
                      : 'border-amber-200/80 bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {check.passed ? (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </span>
                      ) : (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        </span>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-surface-900">{check.label}</h4>
                          <span className="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-500">
                            {check.category}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-surface-600">{check.details}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-surface-700 tabular-nums">
                      {check.score}/{check.maxScore}
                    </span>
                  </div>

                  {check.suggestion && (
                    <div className="mt-3 rounded-button border border-amber-200/80 bg-white p-2.5">
                      <div className="flex items-start gap-2 text-xs text-amber-800">
                        <span className="font-semibold text-amber-700 shrink-0">Tip:</span>
                        <span>{check.suggestion}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'jd' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1">
                  Paste Target Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job posting text here to scan for missing keywords and evaluate job match percentage..."
                  rows={6}
                  className="input-field text-xs resize-y"
                />
                <button
                  type="button"
                  onClick={() => fetchScore(jobDescription)}
                  disabled={loading || !jobDescription.trim()}
                  className="btn-primary mt-2 w-full text-xs justify-center"
                >
                  {loading ? 'Scanning Job Description...' : 'Scan against Job Description'}
                </button>
              </div>

              {jobMatch && (
                <div className="space-y-4 pt-2 border-t border-surface-200">
                  <div className="flex items-center justify-between rounded-card border border-surface-200 bg-surface-50 p-4">
                    <div>
                      <span className="text-xs font-semibold text-surface-500">JD Keyword Match</span>
                      <h3 className="text-xl font-bold text-surface-900">{jobMatch.matchScore}%</h3>
                    </div>
                    <span className="text-xs text-surface-500">
                      {jobMatch.matchedKeywords.length} of {jobMatch.totalKeywordsChecked} keywords found
                    </span>
                  </div>

                  {/* Missing Keywords */}
                  {jobMatch.missingKeywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-rose-700 mb-1.5 flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                        </svg>
                        Missing Keywords from Job Description ({jobMatch.missingKeywords.length})
                      </h4>
                      <p className="text-[11px] text-surface-500 mb-2">
                        Click any keyword to add it directly to your resume skills:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatch.missingKeywords.map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => handleAddSkill(kw)}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
                            title="Click to add to skills"
                          >
                            <span>+</span>
                            <span>{kw}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Keywords */}
                  {jobMatch.matchedKeywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 mb-1.5 flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Matched Keywords ({jobMatch.matchedKeywords.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatch.matchedKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
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
          )}
        </div>
      </div>
    </div>
  );
}
