import { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { uid } from '../../../lib/utils';

const COMMON_PROFICIENCIES = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];

export default function LanguagesStep() {
  const { resume, setSection } = useResume();
  const languages = resume.languages || [];

  const [languageName, setLanguageName] = useState('');
  const [proficiency, setProficiency] = useState('Professional');

  const setLanguages = (next) => setSection('languages', next);

  function handleAdd() {
    const trimmedLang = languageName.trim();
    if (!trimmedLang) return;

    const newEntry = {
      _key: uid(),
      language: trimmedLang,
      proficiency: proficiency.trim(),
    };

    setLanguages([...languages, newEntry]);
    setLanguageName('');
  }

  function handleRemove(index) {
    setLanguages(languages.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="mb-4 text-sm text-surface-500">
        Add languages you speak and your level of proficiency (e.g., &quot;English — Professional&quot;, &quot;Malayalam — Native&quot;).
      </p>

      {/* Input row */}
      <div className="rounded-input border border-surface-200 bg-surface-50/70 p-3.5 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <label className="label-text">Language</label>
            <input
              type="text"
              value={languageName}
              onChange={(e) => setLanguageName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.stopPropagation();
                }
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="e.g. English, Malayalam, Spanish..."
              className="input-field"
              aria-label="Language name"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="label-text">Proficiency</label>
            <div className="relative">
              <select
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
                className="select-field"
                aria-label="Language proficiency"
              >
                {COMMON_PROFICIENCIES.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!languageName.trim()}
              className="btn-primary w-full"
            >
              Add
            </button>
          </div>
        </div>

        {/* Quick proficiency chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-surface-500">
          <span className="text-[11px] font-medium text-surface-400">Quick levels:</span>
          {COMMON_PROFICIENCIES.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setProficiency(lvl)}
              className={`rounded-button px-2 py-0.5 text-xs transition-colors ${
                proficiency === lvl
                  ? 'bg-brand-100 font-semibold text-brand-700 ring-1 ring-brand-300'
                  : 'bg-white text-surface-600 hover:bg-surface-200/60'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Languages list */}
      {languages.length > 0 && (
        <div className="mt-5 space-y-2">
          <h3 className="section-title text-[11px]">Added Languages ({languages.length})</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((item, i) => {
              const langName = typeof item === 'string' ? item : item.language;
              const profLvl = typeof item === 'string' ? '' : item.proficiency;
              const display = profLvl ? `${langName} — ${profLvl}` : langName;

              return (
                <span
                  key={item._key || item._id || `${langName}-${i}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-3.5 py-1.5 text-sm font-medium text-surface-800 shadow-card transition-all hover:border-brand-300 hover:shadow-card-hover"
                >
                  <span className="font-semibold text-surface-900">{langName}</span>
                  {profLvl && (
                    <>
                      <span className="text-surface-300">—</span>
                      <span className="text-surface-600 text-xs">{profLvl}</span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="ml-1 text-surface-300 transition-colors hover:text-red-500"
                    title={`Remove ${display}`}
                    aria-label={`Remove ${display}`}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {languages.length === 0 && (
        <p className="mt-5 rounded-input border border-dashed border-surface-200 px-4 py-8 text-center text-sm text-surface-400">
          No languages added yet. Enter a language name above and click Add.
        </p>
      )}
    </div>
  );
}
