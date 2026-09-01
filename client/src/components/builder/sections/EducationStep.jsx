import { useResume } from '../../../context/ResumeContext';
import { Input, FieldGrid, EntryCard, AddButton, EmptyHint } from '../fields';
import { uid } from '../../../lib/utils';
import { EntryReorder } from '../EntryReorder';

function emptyEntry() {
  return {
    _key: uid(),
    institution: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: '',
    gpa: '',
  };
}

function renderEducationEntry(e, index) {
  const key = e._id || e._key;
  const entryErrors = errors[index]?.errors || {};
  return (
    <EntryCard key={key} title={e.institution || 'Education entry'} badge={index + 1} onRemove={() => remove(key)}>
      <Input label="Institution" value={e.institution} onChange={(v) => update(key, { institution: v })} placeholder="University of Texas" error={entryErrors.institution} />
      <FieldGrid>
        <Input label="Degree" value={e.degree} onChange={(v) => update(key, { degree: v })} placeholder="B.S." error={entryErrors.degree} />
        <Input label="Field of study" value={e.field} onChange={(v) => update(key, { field: v })} placeholder="Computer Science" error={entryErrors.field} />
      </FieldGrid>
      <FieldGrid>
        <Input label="Start date" value={e.start_date} onChange={(v) => update(key, { start_date: v })} placeholder="2014" />
        <Input label="End date" value={e.end_date} onChange={(v) => update(key, { end_date: v })} placeholder="2018" error={entryErrors.end_date} />
      </FieldGrid>
      <Input label="GPA (optional)" value={e.gpa} onChange={(v) => update(key, { gpa: v })} placeholder="3.8" />
    </EntryCard>
  );
}

export default function EducationStep({ errors = [] }) {
  const { resume, setSection } = useResume();
  const list = resume.education || [];

  const setList = (next) => setSection('education', next);
  const add = () => setList([...list, emptyEntry()]);
  const remove = (key) => setList(list.filter((e) => (e._id || e._key) !== key));
  const update = (key, patch) =>
    setList(list.map((e) => ((e._id || e._key) === key ? { ...e, ...patch } : e)));

  const handleReorder = (newList) => setList(newList);

  if (list.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyHint message="No education added yet. Add your schools, degrees and GPA." />
        <AddButton label="Add education" onClick={add} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EntryReorder
        items={list}
        renderItem={(e, index) => renderEducationEntry(e, index)}
        onChange={handleReorder}
      />
      <AddButton label="Add education" onClick={add} />
    </div>
  );
}
