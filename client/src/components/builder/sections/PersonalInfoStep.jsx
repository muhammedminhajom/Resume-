import { useResume } from '../../../context/ResumeContext';
import { Input, Textarea, FieldGrid, TagInput } from '../fields';

export default function PersonalInfoStep({ errors = {} }) {
  const { resume, setSection } = useResume();
  const p = resume.personal_info || {};
  const set = (key, value) => setSection('personal_info', { ...p, [key]: value });

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
        <Input
          label="Full name"
          value={p.name}
          onChange={(v) => set('name', v)}
          placeholder="Jane Doe"
          error={errors.name}
        />
        <Input
          label="Professional title"
          value={p.headline}
          onChange={(v) => set('headline', v)}
          placeholder="e.g. Software Engineer"
        />
      </FieldGrid>

      <FieldGrid>
        <Input
          label="Email"
          value={p.email}
          onChange={(v) => set('email', v)}
          type="email"
          placeholder="you@email.com"
          error={errors.email}
        />
        <Input
          label="Phone"
          value={p.phone}
          onChange={(v) => set('phone', v)}
          placeholder="(555) 123-4567"
          error={errors.phone}
        />
      </FieldGrid>

      <Input
        label="Location"
        value={p.location}
        onChange={(v) => set('location', v)}
        placeholder="City, Country (e.g. Austin, TX)"
      />

      <TagInput
        label="Links (GitHub, LinkedIn, Portfolio…)"
        value={p.links || []}
        onChange={(v) => set('links', v)}
        placeholder="github.com/username"
      />
    </div>
  );
}