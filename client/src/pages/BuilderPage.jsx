import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ResumeProvider, useResume } from '../context/ResumeContext';
import { api, downloadBlob } from '../api/client';
import { makeSampleResume, makeEmptyResume } from '../lib/resume';
import { normalizeResume } from '../lib/utils';
import { validateSection, isSectionValid } from '../lib/validation';
import StepNav from '../components/builder/StepNav';
import Preview from '../components/builder/Preview';
import PersonalInfoStep from '../components/builder/sections/PersonalInfoStep';
import EducationStep from '../components/builder/sections/EducationStep';
import ExperienceStep from '../components/builder/sections/ExperienceStep';
import SkillsStep from '../components/builder/sections/SkillsStep';
import ProjectsStep from '../components/builder/sections/ProjectsStep';
import LeadershipStep from '../components/builder/sections/LeadershipStep';
import CertificationsStep from '../components/builder/sections/CertificationsStep';
import LanguagesStep from '../components/builder/sections/LanguagesStep';
import TemplateSwitcher from '../components/builder/TemplateSwitcher';

import Toast from '../components/ui/Toast';

const MIN_STEPS = 7;

export default function BuilderPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const seed = useMemo(() => (token && !id ? makeSampleResume() : makeEmptyResume()), [id, token]);

  return (
    <ResumeProvider key={id || 'new'} initial={seed}>
      <BuilderEdition id={id} />
    </ResumeProvider>
  );
}

function BuilderEdition({ id }) {
  const navigate = useNavigate();
  const { resume, setResume } = useResume();

  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savedState, setSavedState] = useState('idle'); // idle | saving | saved
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });
  const [mobileView, setMobileView] = useState('edit'); // edit | preview
  const [validationErrors, setValidationErrors] = useState({});
  const saveTimer = useRef(null);
  const autosaveTimer = useRef(null);
  const lastSavedResume = useRef(null);

  useEffect(() => {
    if (!id) return;
    (async function initialLoad() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await api.get(`/resumes/${id}`);
        setResume(normalizeResume(data.resume));
      } catch (err) {
        setLoadError(err.status === 404 ? 'This resume no longer exists.' : 'Unable to load this resume.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, setResume]);

  // Autosave: debounced 1.5s on field change
  useEffect(() => {
    if (!resume || saving || savedState === 'saving') return;
    if (lastSavedResume.current === JSON.stringify(resume)) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (lastSavedResume.current === JSON.stringify(resume)) return;
      const body = serialize(resume);
      try {
        setSavedState('saving');
        const data = resume._id
          ? await api.put(`/resumes/${resume._id}`, body)
          : await api.post('/resumes', body);
        const nextId = data.resume._id;
        if (!resume._id) {
          setResume((prev) => ({ ...prev, _id: nextId }));
          navigate(`/builder/${nextId}`, { replace: true });
        }
        lastSavedResume.current = JSON.stringify(resume);
        setSavedState('saved');
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => setSavedState('idle'), 3000);
      } catch (err) {
        console.error('[autosave] failed:', err.message);
        setSavedState('idle');
      }
    }, 1500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [resume, resume._id, saving, savedState, navigate, setResume]);

  // Clear validation errors when user makes changes
  const prevResumeRef = useRef(resume);
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0 && prevResumeRef.current !== resume) {
      setValidationErrors({});
    }
    prevResumeRef.current = resume;
  }, [resume, validationErrors]);

  function notify(message, type = 'success') {
    setToast({ open: true, type, message });
  }

  function serialize(data) {
    const plain = JSON.parse(JSON.stringify(data));
    delete plain._id;
    delete plain.user_id;
    delete plain.created_at;
    delete plain.updated_at;
    delete plain.__v;
    for (const section of ['education', 'experience', 'projects', 'certifications', 'languages', 'leadership']) {
      plain[section] = (plain[section] || []).map((item) => {
        if (typeof item === 'string') return item;
        const { _key, ...rest } = item;
        return rest;
      });
    }
    return plain;
  }

  async function save() {
    setSavedState('saving');
    try {
      const body = serialize(resume);
      const data = resume._id
        ? await api.put(`/resumes/${resume._id}`, body)
        : await api.post('/resumes', body);
      const nextId = data.resume._id;
      if (!resume._id) {
        setResume((prev) => ({ ...prev, _id: nextId }));
        navigate(`/builder/${nextId}`, { replace: true });
      }
      setSavedState('saved');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSavedState('idle'), 3000);
      return { success: true, id: nextId };
    } catch (err) {
      setSavedState('idle');
      notify(err.message || 'Something went wrong.', 'error');
      return { success: false, message: err.message || 'Unable to save.' };
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      let resumeId = resume._id;
      if (!resumeId) {
        const res = await save();
        if (!res.success) return { success: false, message: res.message };
        resumeId = res.id;
      }
      const blob = await api.exportPdf(resumeId);
      const base =
        (resume.title || 'resume')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || 'resume';
      downloadBlob(blob, `${base}.pdf`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'PDF export failed.' };
    } finally {
      setExporting(false);
    }
  }

  const steps = [
    { key: 'personal_info', label: 'Professional Summary', short: 'Summary', count: resume.personal_info?.name ? 1 : 0 },
    { key: 'experience', label: 'Work Experience', short: 'Experience', count: resume.experience?.length || 0 },
    { key: 'projects', label: 'Projects', short: 'Projects', count: resume.projects?.length || 0 },
    { key: 'skills', label: 'Skills', short: 'Skills', count: resume.skills?.length || 0 },
    { key: 'leadership', label: 'Leadership & Activities', short: 'Leadership', count: resume.leadership?.length || 0, optional: true },
    { key: 'education', label: 'Education', short: 'Education', count: resume.education?.length || 0 },
    { key: 'certifications', label: 'Certifications', short: 'Certifications', count: resume.certifications?.length || 0 },
    { key: 'languages', label: 'Languages', short: 'Languages', count: resume.languages?.length || 0 },
  ];

  const stepComponents = [
    <PersonalInfoStep key="personal_info" errors={validationErrors} />,
    <ExperienceStep key="experience" errors={validationErrors.experience || []} />,
    <ProjectsStep key="projects" errors={validationErrors.projects || []} />,
    <SkillsStep key="skills" />,
    <LeadershipStep key="leadership" errors={validationErrors.leadership || []} />,
    <EducationStep key="education" errors={validationErrors.education || []} />,
    <CertificationsStep key="certifications" errors={validationErrors.certifications || []} />,
    <LanguagesStep key="languages" />,
  ];

  const completedCount = steps.filter((s) => s.count > 0).length;
  const completion = Math.round((completedCount / steps.length) * 100);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-card border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{loadError}</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Back to dashboard</button>
      </div>
    );
  }

  return (
    <div className="no-print flex h-full min-h-[calc(100vh-4rem)] flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 -mx-4 -mt-6 mb-5 border-b border-surface-200 dark:border-surface-800 bg-white/90 dark:bg-surface-900/90 px-4 py-3 backdrop-blur-sm sm:px-6 lg:-mx-8 lg:px-8 transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="btn-ghost !p-2" title="Back to Resumes" aria-label="Back to Resumes">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <input
              value={resume.title}
              onChange={(e) => setResume((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full max-w-[240px] rounded-button border border-transparent bg-transparent px-2 py-1.5 text-lg font-semibold text-surface-900 dark:text-surface-100 transition-all hover:border-surface-200 hover:bg-surface-50 dark:hover:border-surface-700 dark:hover:bg-surface-800 focus:border-brand-500 focus:bg-white dark:focus:bg-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
              placeholder="Untitled Resume"
              aria-label="Resume title"
            />
            {/* Save status */}
            <span
              aria-live="polite"
              className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${
                savedState === 'saved'
                  ? 'text-emerald-600 animate-fade-in'
                  : savedState === 'saving'
                  ? 'text-surface-500'
                  : 'hidden'
              }`}
            >
              <SaveIndicator state={savedState} />
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileView('preview')}
              className="btn-ghost lg:hidden"
              aria-label="Preview"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button onClick={save} disabled={saving} className="btn-secondary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
              </svg>
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Mobile edit/preview toggle */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-button border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-1 lg:hidden">
        <button
          onClick={() => setMobileView('edit')}
          className={`rounded-button py-2 text-sm font-medium transition-colors ${mobileView === 'edit' ? 'bg-brand-600 text-white' : 'text-surface-500 dark:text-surface-400'}`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`rounded-button py-2 text-sm font-medium transition-colors ${mobileView === 'preview' ? 'bg-brand-600 text-white' : 'text-surface-500 dark:text-surface-400'}`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`rounded-button py-2 text-sm font-medium transition-colors ${mobileView === 'preview' ? 'bg-brand-600 text-white' : 'text-surface-500'}`}
        >
          Preview
        </button>
      </div>

      {/* 3-column layout */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_520px]">
        {/* Step sidebar */}
        <aside className={`${mobileView === 'preview' ? 'hidden' : 'block'} lg:block`}>
          <div className="card sticky top-20 p-4 space-y-4">
            <StepNav
              steps={steps}
              current={currentStep}
              onSelect={setCurrentStep}
              completion={completion}
            />


          </div>
          <div className="card mt-4 p-4 xl:hidden">
            <h3 className="section-title mb-3">ATS Font</h3>
            <TemplateSwitcher compact />
          </div>
        </aside>

        {/* Form editor */}
        <div className={`${mobileView === 'preview' ? 'hidden' : 'block'} lg:block`}>
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="badge badge-gray mb-2">Step {currentStep + 1} of {steps.length}</span>
                <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">{steps[currentStep].label}</h2>
                <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
                  {currentStep === 0
                    ? 'Tell employers how to reach you.'
                    : `Complete your ${steps[currentStep].label.toLowerCase()} section.`}
                </p>
              </div>
            </div>

            <div className="card p-5">
              {stepComponents[currentStep]}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="btn-secondary disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back
              </button>
              <button
                onClick={() => {
                  const errors = validateSection(resume, steps[currentStep].key);
                  if (Object.keys(errors).length > 0) {
                    setValidationErrors(errors);
                    return;
                  }
                  setValidationErrors({});
                  setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
                }}
                disabled={currentStep === steps.length - 1 || !isSectionValid(resume, steps[currentStep].key)}
                className="btn-primary disabled:opacity-40"
              >
                Next
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className={`${mobileView === 'edit' ? 'hidden' : 'block'} xl:block`}>
          <Preview
            onExport={handleExport}
            onExportDocx={async () => {
              setExporting(true);
              try {
                let resumeId = resume._id;
                if (!resumeId) {
                  const res = await save();
                  if (!res.success) return { success: false, message: res.message };
                  resumeId = res.id;
                }
                const blob = await api.exportDocx(resumeId);
                const base =
                  (resume.title || 'resume')
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .slice(0, 60) || 'resume';
                downloadBlob(blob, `${base}.docx`);
                return { success: true };
              } catch (err) {
                return { success: false, message: err.message || 'DOCX export failed.' };
              } finally {
                setExporting(false);
              }
            }}
            exporting={exporting}
            onToast={notify}
          />
        </div>
      </div>

      {/* Mobile bottom action bar */}
      <div className="no-print lg:hidden sticky bottom-0 -mx-4 mt-6 flex items-center gap-2 border-t border-surface-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <button onClick={() => setMobileView('edit')} className={`btn-ghost ${mobileView === 'edit' ? 'text-brand-600' : ''}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 12.75v4.875a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V5.25a2.25 2.25 0 012.25-2.25h7.5" />
          </svg>
          Edit
        </button>
        <button onClick={() => setMobileView('preview')} className={`btn-ghost ${mobileView === 'preview' ? 'text-brand-600' : ''}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Preview
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={save} disabled={saving} className="btn-secondary" title="Save">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
            </svg>
            Save
          </button>
        </div>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}

function SaveIndicator({ state }) {
  if (state === 'saving') {
    return (
      <>
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Saving...
      </>
    );
  }
  if (state === 'saved') {
    return (
      <>
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
        Saved
      </>
    );
  }
  return null;
}
