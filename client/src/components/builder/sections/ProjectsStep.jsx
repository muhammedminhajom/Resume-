import { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Input, Textarea, EntryCard, AddButton, EmptyHint } from '../fields';
import { uid } from '../../../lib/utils';
import { EntryReorder } from '../EntryReorder';

function TechPicker({ value, onChange }) {
  const [draft, setDraft] = useState('');
  const tech = value || [];

  function commit() {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...new Set([...tech, ...parts])]);
    setDraft('');
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-surface-700">Technologies</span>
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
        placeholder="React, Node.js…"
        className="input-field"
        aria-label="Add technologies"
      />
      {tech.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tech.map((t, i) => (
            <span key={`${t}-${i}`} className="flex items-center gap-1 rounded-button bg-surface-100 px-2 py-1 text-xs text-surface-700">
              {t}
              <button
                type="button"
                onClick={() => onChange(tech.filter((_, idx) => idx !== i))}
                className="text-surface-300 transition-colors hover:text-red-500"
                aria-label={`Remove ${t}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function emptyEntry() {
  return { _key: uid(), title: '', description: '', tech: [], link: '' };
}

function getEntryKey(entry) {
  return entry._id || entry._key;
}

function renderProjectEntry(proj, index) {
  const key = getEntryKey(proj);
  const entryErrors = errors[index]?.errors || {};
  return (
    <EntryCard key={key} title={proj.title || 'Project'} badge={index + 1} onRemove={() => remove(key)}>
      <Input label="Project title" value={proj.title} onChange={(v) => update(key, { title: v })} placeholder="Devmetrics" error={entryErrors.title} />
      <Textarea label="Description" value={proj.description} onChange={(v) => update(key, { description: v })} placeholder="What it does and why it matters" rows={2} error={entryErrors.description} />
      <TechPicker value={proj.tech} onChange={(v) => update(key, { tech: v })} />
      <Input label="Link (optional)" value={proj.link} onChange={(v) => update(key, { link: v })} placeholder="github.com/you/project" />
    </EntryCard>
  );
}

export default function ProjectsStep({ errors = [] }) {
  const { resume, setSection } = useResume();
  const list = resume.projects || [];

  const setList = (next) => setSection('projects', next);
  const add = () => setList([...list, emptyEntry()]);
  const remove = (key) => setList(list.filter((p) => getEntryKey(p) !== key));
  const update = (key, patch) =>
    setList(list.map((p) => (getEntryKey(p) === key ? { ...p, ...patch } : p)));

  const handleReorder = (newList) => setList(newList);

  if (list.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyHint message="No projects yet. Highlight side projects, open source work or hackathon builds." />
        <AddButton label="Add project" onClick={add} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EntryReorder
        items={list}
        renderItem={(proj, index) => renderProjectEntry(proj, index)}
        onChange={handleReorder}
      />
      <AddButton label="Add project" onClick={add} />
    </div>
  );
}
