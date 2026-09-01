import { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';

export default function SkillsStep() {
  const { resume, setSection } = useResume();
  const skills = resume.skills || [];
  const [draft, setDraft] = useState('');

  const setSkills = (next) => setSection('skills', [...new Set(next.filter(Boolean))]);

  function commit() {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    setSkills([...skills, ...parts]);
    setDraft('');
  }

  return (
    <div>
      <p className="mb-3 text-sm text-surface-500">
        Type a skill and press <kbd className="rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 text-xs font-semibold text-surface-600">Enter</kbd> or use commas to add several at once.
      </p>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder="React, Node.js, Docker…"
        className="input-field"
        aria-label="Add skills"
      />

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="group flex items-center gap-1.5 rounded-full border border-surface-200 bg-white px-3 py-1.5 text-sm font-medium text-surface-700 shadow-card transition-colors hover:border-brand-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                className="text-surface-300 transition-colors hover:text-red-500"
                title={`Remove ${skill}`}
                aria-label={`Remove ${skill}`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {skills.length === 0 && (
        <p className="mt-4 rounded-input border border-dashed border-surface-200 px-4 py-6 text-center text-sm text-surface-400">
          No skills yet. Start typing above.
        </p>
      )}
    </div>
  );
}
