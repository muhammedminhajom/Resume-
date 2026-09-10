import { useMemo } from 'react';
import { DEFAULT_SECTION_ORDER, sortReverseChronological } from '../../lib/resume';

const FONT_FAMILIES = {
  Arial: 'Arial, sans-serif',
  Calibri: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif',
  'Times New Roman': '"Times New Roman", Times, Georgia, serif',
  Georgia: 'Georgia, serif',
};

const SECTION_TITLES = {
  personal_info: 'Professional Summary',
  experience: 'Work Experience',
  skills: 'Skills',
  leadership: 'Leadership & Activities',
  education: 'Education',
  certifications: 'Certifications',
  projects: 'Projects',
  languages: 'Languages',
};

function SectionHeader({ title }) {
  return (
    <div className="mb-2 mt-4">
      <h2 className="border-b border-black pb-0.5 text-[14px] font-bold uppercase tracking-[0.08em] text-black">
        {title}
      </h2>
    </div>
  );
}

export default function ATSResumeTemplate({ resume }) {
  const p = resume.personal_info || {};
  const fontKey = resume.font || resume.template || 'Arial';
  const fontFamily = FONT_FAMILIES[fontKey] || FONT_FAMILIES.Arial;

  const contacts = useMemo(() => {
    return [p.phone, p.email, p.location, ...(p.links || [])].filter(Boolean);
  }, [p.phone, p.email, p.location, p.links]);

  const experienceSorted = useMemo(() => {
    return sortReverseChronological(resume.experience || []);
  }, [resume.experience]);

  const educationSorted = useMemo(() => {
    return sortReverseChronological(resume.education || []);
  }, [resume.education]);

  const orderedKeys = useMemo(() => {
    const rawOrder = Array.isArray(resume.section_order) && resume.section_order.length
      ? resume.section_order
      : DEFAULT_SECTION_ORDER;
    const unique = [...new Set([...rawOrder, ...DEFAULT_SECTION_ORDER])];
    return unique.filter((k) => DEFAULT_SECTION_ORDER.includes(k));
  }, [resume.section_order]);

  function renderSection(key) {
    if (key === 'personal_info') {
      if (!p.summary) return null;
      return (
        <section key={key} className="ats-section">
          <SectionHeader title={SECTION_TITLES.personal_info} />
          <p className="text-[12.5px] leading-relaxed text-black">
            {p.summary}
          </p>
        </section>
      );
    }

    if (key === 'experience') {
      if (!experienceSorted.length) return null;
      return (
        <section key={key} className="ats-section">
          <SectionHeader title={SECTION_TITLES.experience} />
          <div className="space-y-3">
            {experienceSorted.map((x, i) => {
              const dates = [x.start_date, x.end_date].filter(Boolean).join(' – ');
              return (
                <div key={x._id || x._key || i} className="ats-entry">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-bold text-black">
                      {x.role}{x.role && x.company ? ' — ' : ''}{x.company}
                    </span>
                    {dates && (
                      <span className="shrink-0 text-[12.5px] font-normal text-black">
                        {dates}
                      </span>
                    )}
                  </div>
                  {x.bullets?.length > 0 && (
                    <ul className="mt-1 space-y-0.5 pl-5 text-[12.5px] leading-relaxed text-black list-disc">
                      {x.bullets.filter(Boolean).map((b, j) => (
                        <li key={j} className="pl-0.5">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === 'skills') {
      if (!resume.skills?.length) return null;
      return (
        <section key={key} className="ats-section">
          <SectionHeader title={SECTION_TITLES.skills} />
          <p className="text-[12.5px] leading-relaxed text-black">
            {resume.skills.join('  •  ')}
          </p>
        </section>
      );
    }

    if (key === 'education') {
      if (!educationSorted.length) return null;
      return (
        <section key={key} className="ats-section">
          <SectionHeader title={SECTION_TITLES.education} />
          <div className="space-y-2">
            {educationSorted.map((e, i) => {
              const dates = [e.start_date, e.end_date].filter(Boolean).join(' – ');
              const degreeLine = [e.degree, e.field].filter(Boolean).join(', ');
              return (
                <div key={e._id || e._key || i} className="ats-entry">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-bold text-black">
                      {e.institution}
                    </span>
                    {dates && (
                      <span className="shrink-0 text-[12.5px] font-normal text-black">
                        {dates}
                      </span>
                    )}
                  </div>
                  {(degreeLine || e.gpa) && (
                    <p className="text-[12.5px] text-black">
                      {degreeLine}{e.gpa ? ` • GPA: ${e.gpa}` : ''}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === 'certifications') {
      if (!resume.certifications?.length) return null;
      return (
        <section key={key} className="ats-section">
          <SectionHeader title={SECTION_TITLES.certifications} />
          <div className="space-y-1.5">
            {resume.certifications.map((c, i) => (
              <div key={c._id || c._key || i} className="flex items-baseline justify-between gap-2 text-[12.5px] text-black">
                <div>
                  <span className="font-bold">{c.name}</span>
                  {c.issuer && <span> — {c.issuer}</span>}
                </div>
                {c.date && <span className="shrink-0">{c.date}</span>}
              </div>
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
        <section key={key} className="ats-section">
          <SectionHeader title={SECTION_TITLES.leadership} />
          <div className="space-y-3">
            {entries.map((item, i) => {
              const dates = [item.start_date, item.end_date].filter(Boolean).join(' – ');
              return (
                <div key={item._id || item._key || i} className="ats-entry">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-bold text-black">
                      {item.role}{item.role && item.organization ? ' — ' : ''}{item.organization}
                    </span>
                    {dates && (
                      <span className="shrink-0 text-[12.5px] font-normal text-black">
                        {dates}
                      </span>
                    )}
                  </div>
                  {item.bullets?.length > 0 && (
                    <ul className="mt-1 space-y-0.5 pl-5 text-[12.5px] leading-relaxed text-black list-disc">
                      {item.bullets.filter(Boolean).map((b, j) => (
                        <li key={j} className="pl-0.5">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === 'projects') {
      if (!resume.projects?.length) return null;
      return (
        <section key={key} className="ats-section">
          <SectionHeader title={SECTION_TITLES.projects} />
          <div className="space-y-2.5">
            {resume.projects.map((proj, i) => {
              const hasBullets = proj.bullets && proj.bullets.length > 0 && proj.bullets.some((b) => b?.trim());
              return (
                <div key={proj._id || proj._key || i} className="ats-entry">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[13px] font-bold text-black">
                      {proj.title}
                    </span>
                    {proj.link && (
                      <span className="text-[12px] text-black underline">
                        {proj.link}
                      </span>
                    )}
                  </div>
                  {hasBullets ? (
                    <ul className="mt-1 space-y-0.5 pl-5 text-[12.5px] leading-relaxed text-black list-disc">
                      {proj.bullets.filter(Boolean).map((b, j) => (
                        <li key={j} className="pl-0.5">
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : proj.description ? (
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-black">
                      {proj.description}
                    </p>
                  ) : null}
                  {proj.tech?.length > 0 && (
                    <p className="mt-0.5 text-[12px] text-black">
                      Technologies: {proj.tech.join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === 'languages') {
      if (!resume.languages?.length) return null;
      const formatted = resume.languages
        .map((l) => {
          if (typeof l === 'string') return l.trim();
          const name = (l.language || '').trim();
          const prof = (l.proficiency || '').trim();
          return prof ? `${name} — ${prof}` : name;
        })
        .filter(Boolean);
      if (!formatted.length) return null;
      return (
        <section key={key} className="ats-section">
          <SectionHeader title={SECTION_TITLES.languages} />
          <p className="text-[12.5px] leading-relaxed text-black">
            {formatted.join('  •  ')}
          </p>
        </section>
      );
    }

    return null;
  }

  return (
    <div
      className="ats-resume-document text-black"
      style={{
        fontFamily,
        lineHeight: 1.45,
        color: '#000000',
        backgroundColor: '#ffffff',
      }}
    >
      {/* IN-BODY TOP CONTACT BLOCK */}
      {(p.name || p.headline || contacts.length > 0) && (
        <header className="ats-header text-center pb-2">
          {p.name && (
            <h1 className="text-[22px] font-bold tracking-tight uppercase text-black">
              {p.name}
            </h1>
          )}
          {p.headline && (
            <p className="mt-0.5 text-[13px] font-semibold text-black">
              {p.headline}
            </p>
          )}
          {contacts.length > 0 && (
            <p className="mt-1 text-[12px] text-black">
              {contacts.map((c, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-2 font-bold">•</span>}
                  {c}
                </span>
              ))}
            </p>
          )}
        </header>
      )}

      {/* RENDER SECTIONS IN ORDER */}
      <main className="ats-body">
        {orderedKeys.map(renderSection)}
      </main>
    </div>
  );
}
