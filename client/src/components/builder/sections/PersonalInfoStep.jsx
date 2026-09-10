import { useResume } from '../../../context/ResumeContext';
import { Input, Textarea, FieldGrid, TagInput, EmptyHint, AddButton } from '../fields';

export default function PersonalInfoStep({ errors = {} }) {
  const { resume, setSection } = useResume();
  const p = resume.personal_info || {};
  const set = (key, value) => setSection('personal_info', { ...p, [key]: value });

  const setLink = (index, value) => {
    const links = [...(p.links || [])];
    links[index] = value;
    set('links', links);
  };
  const addLink = () => set('links', [...(p.links || []), '']);
  const removeLink = (index) => set('links', (p.links || []).filter((_, i) => i !== index));

  return (
    <div className="space-y-5">
      <Textarea
        label="Professional summary"
        value={p.summary}
        onChange={(v) => set('summary', v)}
        placeholder="A short 2–3 sentence summary highlighting your strengths and career focus."
        rows={3}
      />

      <FieldGrid>
        <Input label="Full name" value={p.name} onChange={(v) => set('name', v)} placeholder="Jane Doe" helper="Shown at the top of your resume." error={errors.name} />
        <Input label="Professional title" value={p.headline} onChange={(v) => set('headline', v)} placeholder="e.g. Software Engineer" helper="Your current or target role." />
      </FieldGrid>

      <FieldGrid>
        <Input label="Email" value={p.email} onChange={(v) => set('email', v)} type="email" placeholder="you@email.com" error={errors.email} />
        <Input label="Phone" value={p.phone} onChange={(v) => set('phone', v)} placeholder="(555) 123-4567" error={errors.phone} />
      </FieldGrid>

      <FieldGrid>
        <Input label="Location" value={p.location} onChange={(v) => set('location', v)} placeholder="City, Country (e.g. Austin, TX)" helper="City, Country or City, State" />
      </FieldGrid>

      <TagInput
        label="Links (GitHub, LinkedIn, Portfolio…)"
        value={p.links || []}
        onChange={(v) => set('links', v)}
        placeholder="github.com/username"
      />
    </div>
  );
}