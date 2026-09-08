import { useResume } from '../../../context/ResumeContext';
import { Input, FieldGrid, EntryCard, AddButton, EmptyHint } from '../fields';
import { uid } from '../../../lib/utils';
import { EntryReorder } from '../EntryReorder';

function emptyEntry() {
  return { _key: uid(), role: '', organization: '', start_date: '', end_date: '', bullets: [''] };
}

function getEntryKey(entry) {
  return entry._id || entry._key;
}

export default function LeadershipStep({ errors = [] }) {
  const { resume, setSection } = useResume();
  const list = resume.leadership || [];

  const setList = (next) => setSection('leadership', next);
  const add = () => setList([...list, emptyEntry()]);
  const remove = (key) => setList(list.filter((e) => getEntryKey(e) !== key));
  const update = (key, patch) =>
    setList(list.map((e) => (getEntryKey(e) === key ? { ...e, ...patch } : e)));

  const handleReorder = (newList) => setList(newList);

  const setBullet = (key, bIndex, value) => {
    const entry = list.find((e) => getEntryKey(e) === key);
    const bullets = [...(entry?.bullets || [''])];
    bullets[bIndex] = value;
    update(key, { bullets });
  };

  const addBullet = (key) => {
    const entry = list.find((e) => getEntryKey(e) === key);
    const bullets = [...(entry?.bullets || ['']), ''];
    update(key, { bullets });
  };

  const removeBullet = (key, bIndex) => {
    const entry = list.find((e) => getEntryKey(e) === key);
    const bullets = (entry?.bullets || ['']).filter((_, i) => i !== bIndex);
    update(key, { bullets });
  };

  function renderLeadershipEntry(entry, index) {
    const key = getEntryKey(entry);
    const bullets = entry.bullets || [''];
    const entryErrors = errors[index]?.errors || {};

    return (
      <EntryCard
        key={key}
        title={entry.role || entry.organization || 'Leadership & Activity'}
        badge={index + 1}
        onRemove={() => remove(key)}
      >
        <FieldGrid>
          <Input
            label="Role / Title"
            value={entry.role}
            onChange={(v) => update(key, { role: v })}
            placeholder="President / Lead Organizer"
            error={entryErrors.role}
          />
          <Input
            label="Organization"
            value={entry.organization}
            onChange={(v) => update(key, { organization: v })}
            placeholder="ACM Student Chapter / Robotics Club"
            error={entryErrors.organization}
          />
        </FieldGrid>
        <FieldGrid>
          <Input
            label="Start date"
            value={entry.start_date}
            onChange={(v) => update(key, { start_date: v })}
            placeholder="2022"
          />
          <Input
            label="End date"
            value={entry.end_date}
            onChange={(v) => update(key, { end_date: v })}
            placeholder="Present"
            error={entryErrors.end_date}
          />
        </FieldGrid>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-surface-700">Bullet points</span>
          <div className="space-y-2">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={b}
                  onChange={(e) => setBullet(key, i, e.target.value)}
                  placeholder="Led 15+ student volunteers and organized campus hackathon"
                  className="input-field"
                  aria-label={`Bullet ${i + 1}`}
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
            className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            + Add bullet point
          </button>
        </div>
      </EntryCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-surface-200 bg-surface-50 p-3 text-xs text-surface-600">
        <span className="font-semibold text-surface-800">Optional Section:</span> Add extracurricular activities, club leadership, volunteering, or community roles. If left empty, this section will automatically be hidden from your resume.
      </div>

      {list.length === 0 ? (
        <div className="space-y-4">
          <EmptyHint message="No leadership or activity entries yet. This section is optional." />
          <AddButton label="Add leadership & activity" onClick={add} />
        </div>
      ) : (
        <>
          <EntryReorder
            items={list}
            renderItem={renderLeadershipEntry}
            onReorder={handleReorder}
            getItemId={(item) => getEntryKey(item)}
            getItemLabel={(item) => item.role || item.organization || 'Leadership entry'}
          />
          <AddButton label="Add another activity" onClick={add} />
        </>
      )}
    </div>
  );
}
