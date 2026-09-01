import { DEFAULT_SECTION_ORDER } from '../../lib/resume';

function orderedKeys(resume) {
  const order = resume.section_order?.length ? resume.section_order : DEFAULT_SECTION_ORDER;
  return [...new Set([...order, ...DEFAULT_SECTION_ORDER])].filter((k) =>
    DEFAULT_SECTION_ORDER.includes(k)
  );
}

const SectionTitle = ({ children }) => (
  <h2 className="mb-2 mt-5 border-b border-surface-400 pb-0.5 font-serif text-[13px] font-bold uppercase tracking-[0.14em] text-surface-900">
    {children}
  </h2>
);

export default function ClassicTemplate({ resume }) {
  const p = resume.personal_info || {};
  const contacts = [...new Set([p.email, p.phone, p.location, ...(p.links || [])].filter(Boolean))];

  function renderSection(key) {
    if (key === 'personal_info') {
      if (!p.name) return null;
      return (
        <header key="personal_info" className="border-b-[2px] border-surface-900 pb-3 text-center">
          <h1 className="font-serif text-[26px] font-bold uppercase tracking-[0.16em] text-surface-900">{p.name}</h1>
          {p.headline && <p className="mt-1 font-serif text-[13px] italic text-surface-600">{p.headline}</p>}
          {contacts.length > 0 && (
            <p className="mt-1.5 font-serif text-[11.5px] text-surface-700">
              {contacts.map((c, i) => (
                <span key={i}>{i > 0 && <span className="mx-1.5 text-surface-300"> | </span>}{c}</span>
              ))}
            </p>
          )}
          {p.summary && <p className="mx-auto mt-2 max-w-[640px] font-serif text-[12.5px] italic leading-relaxed text-surface-800">{p.summary}</p>}
        </header>
      );
    }

    if (key === 'education') {
      return (
        <section key={key}>
          <SectionTitle>Education</SectionTitle>
          {resume.education.map((e, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-[13.5px] font-bold">{e.institution}</span>
                <span className="shrink-0 font-serif text-[11.5px] italic text-surface-600">
                  {[e.start_date, e.end_date].filter(Boolean).join(' – ')}
                </span>
              </div>
              <p className="font-serif text-[12.5px] italic text-surface-700">
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
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-[13.5px] font-bold">{[x.role, x.company].filter(Boolean).join(', ')}</span>
                <span className="shrink-0 font-serif text-[11.5px] italic text-surface-600">
                  {[x.start_date, x.end_date].filter(Boolean).join(' – ')}
                </span>
              </div>
              {x.bullets?.length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-5 font-serif text-[12px] leading-[1.5] text-surface-800 [list-style:disc]">
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
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s, i) => (
              <span key={i} className="border border-surface-400 px-2.5 py-0.5 font-serif text-[12px] text-surface-800">{s}</span>
            ))}
          </div>
        </section>
      );
    }

    if (key === 'projects') {
      return (
        <section key={key}>
          <SectionTitle>Projects</SectionTitle>
          {resume.projects.map((proj, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-serif text-[13.5px] font-bold">{proj.title}</span>
                {proj.link && <span className="font-serif text-[11.5px] italic text-surface-600">{proj.link}</span>}
              </div>
              {proj.description && (
                <p className="font-serif text-[12px] leading-relaxed text-surface-800">{proj.description}</p>
              )}
              {proj.tech?.length > 0 && (
                <p className="mt-0.5 font-serif text-[11.5px] italic text-surface-600">{proj.tech.join(', ')}</p>
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
            <div key={i} className="mb-1.5 last:mb-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-[13.5px] font-bold">{c.name}</span>
                {c.date && <span className="shrink-0 font-serif text-[11.5px] italic text-surface-600">{c.date}</span>}
              </div>
              {c.issuer && <p className="font-serif text-[12px] italic text-surface-700">{c.issuer}</p>}
            </div>
          ))}
        </section>
      );
    }

    return null;
  }

  return <div className="font-serif text-surface-900">{orderedKeys(resume).map(renderSection)}</div>;
}
