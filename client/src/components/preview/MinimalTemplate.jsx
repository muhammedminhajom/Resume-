import { DEFAULT_SECTION_ORDER } from '../../lib/resume';

function orderedKeys(resume) {
  const order = resume.section_order?.length ? resume.section_order : DEFAULT_SECTION_ORDER;
  return [...new Set([...order, ...DEFAULT_SECTION_ORDER])].filter((k) =>
    DEFAULT_SECTION_ORDER.includes(k)
  );
}

const SectionTitle = ({ children }) => (
  <div className="mt-5">
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-surface-400">{children}</h2>
    <div className="mt-1.5 border-t border-surface-200" />
  </div>
);

export default function MinimalTemplate({ resume }) {
  const p = resume.personal_info || {};
  const contacts = [...new Set([p.email, p.phone, p.location, ...(p.links || [])].filter(Boolean))];

  function renderSection(key) {
    if (key === 'personal_info') {
      if (!p.name) return null;
      return (
        <header key="personal_info" className="pb-2">
          <h1 className="text-[26px] font-light tracking-wide text-surface-900">{p.name}</h1>
          {p.headline && (
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-surface-400">{p.headline}</p>
          )}
          {contacts.length > 0 && (
            <p className="mt-1.5 text-[11px] text-surface-500">
              {contacts.map((c, i) => (
                <span key={i}>{i > 0 && <span className="mx-1 text-surface-300">·</span>}{c}</span>
              ))}
            </p>
          )}
          {p.summary && <p className="mt-2 text-[12.5px] leading-relaxed text-surface-700">{p.summary}</p>}
        </header>
      );
    }

    if (key === 'education') {
      return (
        <section key={key}>
          <SectionTitle>Education</SectionTitle>
          {resume.education.map((e, i) => (
            <div key={i} className="mt-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-semibold text-surface-900">{e.institution}</span>
                <span className="shrink-0 text-[10.5px] text-surface-400">
                  {[e.start_date, e.end_date].filter(Boolean).join(' – ')}
                </span>
              </div>
              <p className="text-[11.5px] text-surface-500">
                {[e.degree, e.field].filter(Boolean).join(', ')}
                {e.gpa && ` · GPA ${e.gpa}`}
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
            <div key={i} className="mt-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-semibold text-surface-900">
                  {[x.role, x.company].filter(Boolean).join(', ')}
                </span>
                <span className="shrink-0 text-[10.5px] text-surface-400">
                  {[x.start_date, x.end_date].filter(Boolean).join(' – ')}
                </span>
              </div>
              {x.bullets?.length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-4 text-[11.5px] leading-relaxed text-surface-600 [list-style:disc]">
                  {x.bullets.filter(Boolean).map((b, j) => (
                    <li key={j}>{b}</li>
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
          <p className="mt-2 text-[11.5px] leading-relaxed text-surface-600">{resume.skills.join('  ·  ')}</p>
        </section>
      );
    }

    if (key === 'projects') {
      return (
        <section key={key}>
          <SectionTitle>Projects</SectionTitle>
          {resume.projects.map((proj, i) => (
            <div key={i} className="mt-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold text-surface-900">{proj.title}</span>
                {proj.link && <span className="text-[10.5px] text-surface-400">{proj.link}</span>}
              </div>
              {proj.description && (
                <p className="text-[11.5px] leading-relaxed text-surface-600">{proj.description}</p>
              )}
              {proj.tech?.length > 0 && (
                <p className="mt-0.5 text-[10.5px] text-surface-400">{proj.tech.join(', ')}</p>
              )}
            </div>
          ))}
        </section>
      );
    }

    if (key === 'certifications') {
      return (
        <section key={key}>
          <SectionTitle>Certifications</SectionTitle>
          {resume.certifications.map((c, i) => (
            <div key={i} className="mt-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12.5px] font-medium text-surface-900">{c.name}</span>
                {c.date && <span className="shrink-0 text-[10.5px] text-surface-400">{c.date}</span>}
              </div>
              {c.issuer && <p className="text-[11px] text-surface-500">{c.issuer}</p>}
            </div>
          ))}
        </section>
      );
    }

    return null;
  }

  return <div className="text-surface-800">{orderedKeys(resume).map(renderSection)}</div>;
}
