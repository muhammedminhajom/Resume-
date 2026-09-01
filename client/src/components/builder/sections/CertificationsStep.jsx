import { useResume } from '../../../context/ResumeContext';
import { Input, FieldGrid, EntryCard, AddButton, EmptyHint } from '../fields';
import { uid } from '../../../lib/utils';

function emptyEntry() {
  return { _key: uid(), name: '', issuer: '', date: '' };
}

function getEntryKey(entry) {
  return entry._id || entry._key;
}

export default function CertificationsStep({ errors = [] }) {
  const { resume, setSection } = useResume();
  const list = resume.certifications || [];

  const setList = (next) => setSection('certifications', next);
  const add = () => setList([...list, emptyEntry()]);
  const remove = (key) => setList(list.filter((c) => getEntryKey(c) !== key));
  const update = (key, patch) =>
    setList(list.map((c) => (getEntryKey(c) === key ? { ...c, ...patch } : c)));

  if (list.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyHint message="No certifications yet. Add licenses and certifications you've earned." />
        <AddButton label="Add certification" onClick={add} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((cert, index) => {
        const key = getEntryKey(cert);
        const entryErrors = errors[index]?.errors || {};
        return (
          <EntryCard key={key} title={cert.name || 'Certification'} badge={index + 1} onRemove={() => remove(key)}>
            <Input label="Certification name" value={cert.name} onChange={(v) => update(key, { name: v })} placeholder="AWS Solutions Architect" error={entryErrors.name} />
            <FieldGrid>
              <Input label="Issuer" value={cert.issuer} onChange={(v) => update(key, { issuer: v })} placeholder="Amazon Web Services" error={entryErrors.issuer} />
              <Input label="Date" value={cert.date} onChange={(v) => update(key, { date: v })} placeholder="2023" />
            </FieldGrid>
          </EntryCard>
        );
      })}
      <AddButton label="Add certification" onClick={add} />
    </div>
  );
}
