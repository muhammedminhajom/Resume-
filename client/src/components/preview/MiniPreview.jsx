import { DEFAULT_SECTION_ORDER } from '../../lib/resume';
import { sanitizeObject } from '../../lib/sanitize';

function orderedKeys(resume) {
  const order = resume.section_order?.length ? resume.section_order : DEFAULT_SECTION_ORDER;
  return [...new Set([...order, ...DEFAULT_SECTION_ORDER])].filter((k) =>
    DEFAULT_SECTION_ORDER.includes(k)
  );
}

export default function MiniPreview({ resume }) {
  const safeResume = sanitizeObject(resume);
  const p = safeResume?.personal_info || {};
  const contacts = [...new Set([p.email, p.phone, p.location, ...(p.links || [])].filter(Boolean))];

  function renderSection(key) {
    if (key === 'personal_info') {
      if (!p.name) return null;
      return (
        <div key="pi" className="border-b-2 border-surface-900 pb-2">
          <div className="text-xl font-bold leading-tight text-surface-900">{p.name}</div>
          {p.headline && <div className="text-[11px] font-medium text-surface-500">{p.headline}</div>}
          {contacts.length > 0 && (
            <div className="mt-1 text-[8px] text-surface-600">{contacts.slice(0, 3).join(' · ')}</div>
          )}
        </div>
      );
    }

    const data = safeResume?.[key];
    if (!data || (Array.isArray(data) && data.length === 0)) return null;
    if (!Array.isArray(data)) return null;

    const title = { education: 'Education', experience: 'Experience', skills: 'Skills', projects: 'Projects', certifications: 'Certifications' }[key];

    if (key === 'skills') {
      return (
        <div key={key} className="mt-3">
          <div className="section-title mb-1.5">Skills</div>
          <div className="flex flex-wrap gap-1">
            {data.slice(0, 5).map((s, i) => (
              <span key={i} className="rounded-full bg-surface-100 px-1.5 py-0.5 text-[7px] text-surface-700">{s}</span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="mt-3">
        <div className="section-title mb-1.5">{title}</div>
        <div className="space-y-1.5">
          {data.slice(0, 2).map((item, i) => {
            const left =
              key === 'education' ? item.institution :
              key === 'experience' ? [item.role, item.company].filter(Boolean).join(' — ') :
              key === 'projects' ? item.title :
              item.name;
            return (
              <div key={i}>
                <div className="text-[8px] font-semibold text-surface-900">{left || 'Untitled'}</div>
                {key === 'experience' && item.bullets?.length > 0 && (
                  <div className="mt-0.5 space-y-0.5">
                    {item.bullets.filter(Boolean).slice(0, 2).map((b, j) => (
                      <div key={j} className="flex gap-1 text-[7px] text-surface-500">
                        <span>•</span>
                        <span className="truncate">{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[820px] bg-white p-10 text-surface-800">
      {orderedKeys(safeResume).map(renderSection)}
    </div>
  );
}
