import { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Input, FieldGrid, EntryCard, AddButton, EmptyHint } from '../fields';
import { uid } from '../../../lib/utils';
import { api } from '../../../api/client';
import { EntryReorder } from '../EntryReorder';
import { sortReverseChronological } from '../../../lib/resume';

function emptyEntry() {
  return { _key: uid(), company: '', role: '', start_date: '', end_date: '', bullets: [''] };
}

function getEntryKey(entry) {
  return entry._id || entry._key;
}

function SuggestButton({ bullet, onSuggest, busy }) {
  const disabled = !bullet?.trim();
  return (
    <button
      type="button"
      title="Improve bullet with AI"
      disabled={disabled || busy}
      onClick={() => onSuggest()}
      className="shrink-0 rounded-button bg-brand-50 px-2.5 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {busy ? (
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <span className="inline-flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.902 5.098L19 9l-5.098 1.902L12 16l-1.902-5.098L5 9l5.098-1.902L12 2z" />
            <path d="M19 14l.951 2.549L22.5 17.5l-2.549.951L19 21l-.951-2.549h0L15.5 17.5l2.549-.951L19 14z" />
          </svg>
          AI
        </span>
      )}
    </button>
  );
}

export default function ExperienceStep({ errors = [] }) {
  const { resume, setSection } = useResume();
  const list = resume.experience || [];
  const [busyBullet, setBusyBullet] = useState(null);
  const [aiError, setAiError] = useState('');

  const setList = (next) => setSection('experience', next);
  const add = () => setList([...list, emptyEntry()]);
  const remove = (key) => setList(list.filter((e) => getEntryKey(e) !== key));
  const update = (key, patch) =>
    setList(list.map((e) => (getEntryKey(e) === key ? { ...e, ...patch } : e)));

  const handleReorder = (newList) => setList(newList);

  const setBullet = (key, bIndex, value) => {
    const entry = list.find((e) => getEntryKey(e) === key);
    const bullets = [...(entry?.bullets || [])];
    bullets[bIndex] = value;
    update(key, { bullets });
  };

  const addBullet = (key) => {
    const entry = list.find((e) => getEntryKey(e) === key);
    update(key, { bullets: [...(entry?.bullets || []), ''] });
  };

  const removeBullet = (key, bIndex) => {
    const entry = list.find((e) => getEntryKey(e) === key);
    update(key, { bullets: (entry?.bullets || []).filter((_, i) => i !== bIndex) });
  };

  async function suggest(key, bIndex, bullet) {
    const entry = list.find((e) => getEntryKey(e) === key);
    setAiError('');
    setBusyBullet(`${key}:${bIndex}`);
    try {
      const data = await api.post('/ai/suggest-bullet', { jobTitle: entry?.role || '', bullet });
      setBullet(key, bIndex, data.suggestion);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setBusyBullet(null);
    }
  }

  function renderExperienceEntry(entry, index) {
    const key = getEntryKey(entry);
    const bullets = entry.bullets || [];
    const entryErrors = errors[index]?.errors || {};
    return (
      <EntryCard
        key={key}
        title={entry.role || entry.company || 'Experience entry'}
        badge={index + 1}
        onRemove={() => remove(key)}
      >
        <FieldGrid>
          <Input label="Job title" value={entry.role} onChange={(v) => update(key, { role: v })} placeholder="Full-Stack Engineer" error={entryErrors.role} />
          <Input label="Company" value={entry.company} onChange={(v) => update(key, { company: v })} placeholder="Acme Corp" error={entryErrors.company} />
        </FieldGrid>
        <FieldGrid>
          <Input label="Start date" value={entry.start_date} onChange={(v) => update(key, { start_date: v })} placeholder="2021" />
          <Input label="End date" value={entry.end_date} onChange={(v) => update(key, { end_date: v })} placeholder="Present" error={entryErrors.end_date} />
        </FieldGrid>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-surface-700">Bullet points</span>
          <div className="space-y-2">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={b}
                  onChange={(e) => setBullet(key, i, e.target.value)}
                  placeholder="Built an analytics dashboard used by 40k+ users"
                  className="input-field"
                  aria-label={`Bullet ${i + 1}`}
                />
                <SuggestButton
                  bullet={b}
                  busy={busyBullet === `${key}:${i}`}
                  onSuggest={() => suggest(key, i, b)}
                />
                <button
                  type="button"
                  onClick={() => removeBullet(key, i)}
                  className="btn-ghost shrink-0 text-surface-400 hover:text-red-600"
                  aria-label="Remove bullet"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {entryErrors.bullets && (
            <p className="mt-1 text-xs text-red-600">{entryErrors.bullets}</p>
          )}
          <button
            type="button"
            onClick={() => addBullet(key)}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add bullet
          </button>
        </div>
      </EntryCard>
    );
  }

  if (list.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyHint message="No work experience yet. Add jobs, roles and accomplishments." />
        <AddButton label="Add experience" onClick={add} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {aiError && (
        <div className="flex items-start gap-2.5 rounded-input border border-amber-200 bg-amber-50 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-amber-700">{aiError}</p>
        </div>
      )}
      <EntryReorder
        items={list}
        renderItem={(entry, index) => renderExperienceEntry(entry, index)}
        onChange={handleReorder}
      />
      <div className="flex items-center justify-between gap-3">
        <AddButton label="Add experience" onClick={add} />
        {list.length > 1 && (
          <button
            type="button"
            onClick={() => setList(sortReverseChronological(list))}
            className="btn-secondary !py-2 !px-3 text-xs"
            title="Sort experiences from newest to oldest"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
            </svg>
            Auto-sort (Newest first)
          </button>
        )}
      </div>
    </div>
  );
}
