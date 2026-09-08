import { DEFAULT_SECTION_ORDER } from '../../lib/resume';

function orderedKeys(resume) {
  const order = resume.section_order?.length ? resume.section_order : DEFAULT_SECTION_ORDER;
  return [...new Set([...order, ...DEFAULT_SECTION_ORDER])].filter((k) =>
    DEFAULT_SECTION_ORDER.includes(k)
  );
}

const SectionTitle = ({ children }) => (
  <h2 className="mb-2 mt-5 border-b-[1.5px] border-surface-300 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-surface-800">
    {children}
  </h2>
);

const Row = ({ left, right }) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="text-[13.5px] font-semibold text-surface-900">{left}</span>
    {right && <span className="shrink-0 text-[11px] text-surface-500">{right}</span>}
  </div>
);

export default function ModernTemplate({ resume }) {
  const p = resume.personal_info || {};
  const contacts = [...new Set([p.email, p.phone, p.location, ...(p.links || [])].filter(Boolean))];

  function renderSection(key) {
    if (key === 'personal_info') {
      if (!p.name) return null;
      return (
        <header key="personal_info" className="border-b-[3px] border-brand-600 pb-3">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-surface-900">{p.name}</h1>
          {p.headline && <p className="mt-0.5 font-medium text-brand-600">{p.headline}</p>}
          {contacts.length > 0 && (
            <p className="mt-1.5 text-[11.5px] text-surface-600">
              {contacts.map((c, i) => (
                <span key={i}>{i > 0 && <span className="mx-1 text-surface-300">•</span>}{c}</span>
              ))}
            </p>
          )}
          {p.summary && <p className="mt-2.5 text-[12.5px] leading-relaxed text-surface-700">{p.summary}</p>}
        </header>
      );
    }

    if (key === 'education') {
      return (
        <section key={key}>
          <SectionTitle>Education</SectionTitle>
          {resume.education.map((e, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <Row left={e.institution} right={[e.start_date, e.end_date].filter(Boolean).join(' – ')} />
              <p className="text-[11.5px] text-surface-500">
                {[e.degree, e.field].filter(Boolean).join(', ')}
                {e.gpa && ` • GPA: ${e.gpa}`}
              </p>
            </div>
          ))}
        </section>
      );
    }

    if (key === 'experience') {
      return (
        <section key={key}>
          <SectionTitle>Experience</SectionTitle>
          {resume.experience.map((x, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <Row left={[x.role, x.company].filter(Boolean).join(' — ')} right={[x.start_date, x.end_date].filter(Boolean).join(' – ')} />
              {x.bullets?.length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-4 text-[12px] leading-[1.5] text-surface-700">
                  {x.bullets.filter(Boolean).map((b, j) => (
                    <li key={j} className="relative list-none pl-2">
                      <span className="absolute left-[-9px] text-brand-500">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      );
    }

    if (key === 'skills') {
      return (
        <section key={key}>
          <SectionTitle>Skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s, i) => (
              <span key={i} className="rounded-full border border-surface-200 bg-surface-50 px-2.5 py-1 text-[11.5px] font-medium text-surface-700">
                {s}
              </span>
            ))}
          </div>
        </section>
      );
    }

    if (key === 'leadership') {
      const entries = (resume.leadership || []).filter(
        (l) => l.role?.trim() || l.organization?.trim() || l.bullets?.some((b) => b?.trim())
      );
      if (!entries.length) return null;
      return (
        <section key={key}>
          <SectionTitle>Leadership & Activities</SectionTitle>
          {entries.map((item, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <Row
                left={[item.role, item.organization].filter(Boolean).join(' — ')}
                right={[item.start_date, item.end_date].filter(Boolean).join(' – ')}
              />
              {item.bullets?.length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-4 text-[12px] leading-[1.5] text-surface-700">
                  {item.bullets.filter(Boolean).map((b, j) => (
                    <li key={j} className="relative list-none pl-2">
                      <span className="absolute left-[-9px] text-brand-500">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      );
    }

    if (key === 'projects') {
      return (
        <section key={key}>
          <SectionTitle>Projects</SectionTitle>
          {resume.projects.map((proj, i) => {
            const hasBullets = proj.bullets && proj.bullets.length > 0 && proj.bullets.some((b) => b?.trim());
            return (
              <div key={i} className="mb-2 last:mb-0">
                <Row left={proj.title} right={proj.link} />
                {hasBullets ? (
                  <ul className="mt-1 space-y-0.5 pl-4 text-[12px] leading-[1.5] text-surface-700">
                    {proj.bullets.filter(Boolean).map((b, j) => (
                      <li key={j} className="relative list-none pl-2">
                        <span className="absolute left-[-9px] text-brand-500">•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : proj.description ? (
                  <p className="text-[12px] leading-relaxed text-surface-700">{proj.description}</p>
                ) : null}
                {proj.tech?.length > 0 && (
                  <p className="mt-0.5 text-[11px] text-surface-500">{proj.tech.join(', ')}</p>
                )}
              </div>
            );
          })}
        </section>
      );
    }

    if (key === 'certifications') {
      return (
        <section key={key}>
          <SectionTitle>Certifications</SectionTitle>
          {resume.certifications.map((c, i) => (
            <div key={i} className="mb-1.5 last:mb-0">
              <Row left={c.name} right={c.date} />
              {c.issuer && <p className="text-[11.5px] text-surface-500">{c.issuer}</p>}
            </div>
          ))}
        </section>
      );
    }

    if (key === 'languages') {
      if (!resume.languages?.length) return null;
      return (
        <section key={key}>
          <SectionTitle>Languages</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {resume.languages.map((l, i) => {
              const lang = typeof l === 'string' ? l : l.language;
              const prof = typeof l === 'string' ? '' : l.proficiency;
              return (
                <span
                  key={i}
                  className="rounded-full border border-surface-200 bg-surface-50 px-2.5 py-1 text-[11.5px] font-medium text-surface-700"
                >
                  <span className="font-semibold">{lang}</span>
                  {prof && <span className="text-surface-500 font-normal"> — {prof}</span>}
                </span>
              );
            })}
          </div>
        </section>
      );
    }

    return null;
  }

  return <div className="text-surface-800">{orderedKeys(resume).map(renderSection)}</div>;
}
