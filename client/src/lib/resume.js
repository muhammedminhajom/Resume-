export const SECTION_META = [
  { key: 'personal_info', label: 'Personal Info', short: 'Personal' },
  { key: 'education', label: 'Education', short: 'Education' },
  { key: 'experience', label: 'Experience', short: 'Experience' },
  { key: 'skills', label: 'Skills', short: 'Skills' },
  { key: 'projects', label: 'Projects', short: 'Projects' },
  { key: 'certifications', label: 'Certifications', short: 'Certifications' },
];

export const DEFAULT_SECTION_ORDER = SECTION_META.map((s) => s.key);

export function makeEmptyResume() {
  return {
    title: 'Untitled Resume',
    template: 'modern',
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
    certifications: [],
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
  r.skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'];
  r.projects = [
    {
      title: 'Devmetrics',
      description:
        'Open-source tool that analyzes GitHub repositories and surfaces engineering productivity insights.',
      tech: ['React', 'Node.js', 'PostgreSQL'],
      link: 'github.com/alexmorgan/devmetrics',
    },
  ];
  r.certifications = [
    { name: 'AWS Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2023' },
    { name: 'Professional Scrum Master I', issuer: 'Scrum.org', date: '2022' },
  ];
  return r;
}

export function sectionLabel(key) {
  const meta = SECTION_META.find((s) => s.key === key);
  return meta ? meta.label : key.charAt(0).toUpperCase() + key.slice(1);
}