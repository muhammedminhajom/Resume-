export const ATS_FONTS = [
  { id: 'Arial', name: 'Arial', family: 'Arial, sans-serif' },
  { id: 'Calibri', name: 'Calibri', family: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif' },
  { id: 'Times New Roman', name: 'Times New Roman', family: '"Times New Roman", Times, Georgia, serif' },
  { id: 'Georgia', name: 'Georgia', family: 'Georgia, serif' },
];

export const SECTION_META = [
  { key: 'personal_info', label: 'Professional Summary', short: 'Summary' },
  { key: 'experience', label: 'Work Experience', short: 'Experience' },
  { key: 'projects', label: 'Projects', short: 'Projects' },
  { key: 'skills', label: 'Skills', short: 'Skills' },
  { key: 'leadership', label: 'Leadership & Activities', short: 'Leadership' },
  { key: 'education', label: 'Education', short: 'Education' },
  { key: 'certifications', label: 'Certifications', short: 'Certifications' },
  { key: 'languages', label: 'Languages', short: 'Languages' },
];

export const DEFAULT_SECTION_ORDER = SECTION_META.map((s) => s.key);

export function parseYear(dateStr) {
  if (!dateStr) return 0;
  const str = String(dateStr).trim().toLowerCase();
  if (str === 'present' || str === 'current' || str === 'now' || str === 'ongoing') {
    return 999999;
  }
  const match = str.match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    const year = parseInt(match[1], 10);
    // check for month
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    for (let i = 0; i < months.length; i++) {
      if (str.includes(months[i])) {
        return year * 100 + (i + 1);
      }
    }
    return year * 100;
  }
  return 0;
}

export function sortReverseChronological(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const endA = parseYear(a.end_date);
    const endB = parseYear(b.end_date);
    if (endB !== endA) return endB - endA;
    const startA = parseYear(a.start_date || a.date);
    const startB = parseYear(b.start_date || b.date);
    return startB - startA;
  });
}

export function makeEmptyResume() {
  return {
    title: 'Untitled Resume',
    template: 'Arial',
    font: 'Arial',
    personal_info: {
      name: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      links: [],
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    leadership: [],
    education: [],
    certifications: [],
    languages: [],
    section_order: [...DEFAULT_SECTION_ORDER],
  };
}

export function makeSampleResume() {
  const r = makeEmptyResume();
  r.title = 'My Resume';
  r.personal_info = {
    name: 'Alex Morgan',
    headline: 'Senior Full-Stack Engineer',
    email: 'alex.morgan@email.com',
    phone: '(555) 123-4567',
    location: 'Austin, TX',
    summary:
      'Full-stack engineer with 6+ years of experience building scalable web applications. Passionate about clean architecture, great UX, and shipping fast.',
    links: ['github.com/alexmorgan', 'linkedin.com/in/alexmorgan'],
  };
  r.experience = [
    {
      company: 'Acme Corp',
      role: 'Full-Stack Engineer',
      start_date: '2021',
      end_date: 'Present',
      bullets: [
        'Built a customer analytics dashboard used by 40k+ monthly users',
        'Cut API response times by 60% via Redis caching and query optimization',
        'Led migration of a legacy monolith to microservices over Node.js and AWS',
      ],
    },
    {
      company: 'Initech',
      role: 'Frontend Developer',
      start_date: '2019',
      end_date: '2021',
      bullets: [
        'Developed a component library in React adopted by 5 product teams',
        'Improved Lighthouse performance scores from 55 to 95 across core pages',
      ],
    },
  ];
  r.projects = [
    {
      title: 'Devmetrics',
      description: '',
      bullets: [
        'Open-source tool that analyzes GitHub repositories and surfaces engineering productivity insights',
        'Cut query latency by 45% using Postgres indexing and optimized React virtual list rendering',
      ],
      tech: ['React', 'Node.js', 'PostgreSQL'],
      link: 'github.com/alexmorgan/devmetrics',
    },
  ];
  r.skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'];
  r.leadership = [
    {
      role: 'President',
      organization: 'ACM Student Chapter',
      start_date: '2020',
      end_date: '2021',
      bullets: [
        'Organized annual 48-hour hackathon for 250+ collegiate participants and secured $10k in industry sponsorships',
        'Conducted bi-weekly technical workshops on full-stack web development and cloud architecture',
      ],
    },
  ];
  r.education = [
    {
      institution: 'University of Texas',
      degree: 'B.S.',
      field: 'Computer Science',
      start_date: '2014',
      end_date: '2018',
      gpa: '3.8',
    },
    {
      institution: 'MIT',
      degree: 'M.S.',
      field: 'Software Engineering',
      start_date: '2019',
      end_date: '2021',
      gpa: '4.0',
    },
  ];
  r.certifications = [
    { name: 'AWS Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2023' },
    { name: 'Professional Scrum Master I', issuer: 'Scrum.org', date: '2022' },
  ];
  r.languages = [
    { language: 'English', proficiency: 'Professional' },
    { language: 'Malayalam', proficiency: 'Native' },
  ];
  return r;
}

export function sectionLabel(key) {
  const meta = SECTION_META.find((s) => s.key === key);
  return meta ? meta.label : key.charAt(0).toUpperCase() + key.slice(1);
}