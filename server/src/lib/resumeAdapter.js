const DEFAULT_SECTION_ORDER = [
  'personal_info',
  'experience',
  'projects',
  'skills',
  'leadership',
  'education',
  'certifications',
  'languages',
];

function fromRelational(resume, related = {}) {
  if (!resume) return null;

  const {
    personal_info = {},
    professional_summary = {},
    work_experience = [],
    projects = [],
    skills = {},
    leadership_activities = [],
    education = [],
    certifications = [],
    languages = [],
  } = related;

  return {
    _id: resume.id,
    id: resume.id,
    user_id: resume.user_id,
    title: resume.title || 'Untitled Resume',
    template: resume.template || 'arial',
    font: resume.font || 'Arial',
    section_order: Array.isArray(resume.section_order)
      ? resume.section_order
      : (typeof resume.section_order === 'string'
          ? JSON.parse(resume.section_order)
          : DEFAULT_SECTION_ORDER),
    personal_info: {
      name: personal_info?.full_name || '',
      headline: personal_info?.title || '',
      email: personal_info?.email || '',
      phone: personal_info?.phone || '',
      location: personal_info?.location || '',
      links: Array.isArray(personal_info?.links)
        ? personal_info.links
        : (typeof personal_info?.links === 'string'
            ? JSON.parse(personal_info.links || '[]')
            : []),
      summary: professional_summary?.content || '',
    },
    experience: (work_experience || []).map((exp) => ({
      _id: exp.id,
      id: exp.id,
      role: exp.title || '',
      company: exp.company || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      bullets: Array.isArray(exp.bullets)
        ? exp.bullets
        : (typeof exp.bullets === 'string'
            ? JSON.parse(exp.bullets || '[]')
            : []),
    })),
    projects: (projects || []).map((p) => ({
      _id: p.id,
      id: p.id,
      title: p.title || '',
      description: p.description || '',
      tech: Array.isArray(p.technologies)
        ? p.technologies
        : (typeof p.technologies === 'string'
            ? JSON.parse(p.technologies || '[]')
            : []),
      bullets: Array.isArray(p.bullets)
        ? p.bullets
        : (typeof p.bullets === 'string'
            ? JSON.parse(p.bullets || '[]')
            : []),
      link: p.link || '',
    })),
    skills: Array.isArray(skills?.skill_list)
      ? skills.skill_list
      : (typeof skills?.skill_list === 'string'
          ? JSON.parse(skills.skill_list || '[]')
          : []),
    leadership: (leadership_activities || []).map((la) => ({
      _id: la.id,
      id: la.id,
      role: la.title || '',
      organization: la.organization || '',
      start_date: la.start_date || '',
      end_date: la.end_date || '',
      dates: la.dates || [la.start_date, la.end_date].filter(Boolean).join(' - '),
      bullets: Array.isArray(la.bullets)
        ? la.bullets
        : (typeof la.bullets === 'string'
            ? JSON.parse(la.bullets || '[]')
            : []),
    })),
    education: (education || []).map((ed) => ({
      _id: ed.id,
      id: ed.id,
      institution: ed.school || '',
      school: ed.school || '',
      degree: ed.degree || '',
      field: ed.field || '',
      gpa: ed.gpa || '',
      start_date: ed.start_date || '',
      end_date: ed.end_date || '',
    })),
    certifications: (certifications || []).map((c) => ({
      _id: c.id,
      id: c.id,
      name: c.name || '',
      issuer: c.issuer || '',
      date: c.date || '',
    })),
    languages: (languages || []).map((lang) => ({
      _id: lang.id,
      id: lang.id,
      language: lang.language || '',
      proficiency: lang.proficiency || '',
    })),
    created_at: resume.created_at,
    updated_at: resume.updated_at,
  };
}

module.exports = {
  DEFAULT_SECTION_ORDER,
  fromRelational,
};
