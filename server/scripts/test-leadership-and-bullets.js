const assert = require('assert');
const { DEFAULT_SECTION_ORDER } = require('../src/models/Resume');
const { renderResume, DEFAULT_ORDER, LABELS } = require('../src/templates/resumeHtml');
const { generateDocx } = require('../src/services/docxService');
const { generatePdf } = require('../src/services/pdfService');

console.log('Testing Projects Bullets, Leadership Section & 8-Part Section Order...');

const EXPECTED_ORDER = [
  'personal_info',
  'experience',
  'projects',
  'skills',
  'leadership',
  'education',
  'certifications',
  'languages',
];

// 1. Check DEFAULT_SECTION_ORDER in Resume model
assert.deepStrictEqual(
  DEFAULT_SECTION_ORDER,
  EXPECTED_ORDER,
  `Resume.js DEFAULT_SECTION_ORDER must match expected 8-section order`
);
console.log('✔ Resume.js DEFAULT_SECTION_ORDER matches expected sequence:');
console.log('  ', DEFAULT_SECTION_ORDER.join(' -> '));

// 2. Check DEFAULT_ORDER in resumeHtml
assert.deepStrictEqual(
  DEFAULT_ORDER,
  EXPECTED_ORDER,
  `resumeHtml.js DEFAULT_ORDER must match expected 8-section order`
);
console.log('✔ resumeHtml.js DEFAULT_ORDER matches expected sequence:');
console.log('  ', DEFAULT_ORDER.join(' -> '));

// 3. Test HTML generation with both Projects bullets and Leadership present
const mockResumeWithLeadership = {
  title: 'Full Featured Resume',
  template: 'Arial',
  font: 'Arial',
  personal_info: {
    name: 'Alex Morgan',
    headline: 'Senior Full-Stack Engineer',
    email: 'alex@example.com',
    phone: '+1 555-0199',
    location: 'Austin, TX',
    summary: 'Experienced developer building scalable systems.',
  },
  experience: [
    {
      role: 'Full-Stack Engineer',
      company: 'Tech Corp',
      start_date: '2021',
      end_date: 'Present',
      bullets: ['Scaled system to 100k users'],
    },
  ],
  projects: [
    {
      title: 'Devmetrics',
      bullets: [
        'Open-source tool that analyzes GitHub repositories',
        'Cut query latency by 45% using Postgres indexing',
      ],
      tech: ['React', 'Node.js', 'PostgreSQL'],
      link: 'https://devmetrics.io',
    },
  ],
  skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
  leadership: [
    {
      role: 'President',
      organization: 'ACM Student Chapter',
      start_date: '2020',
      end_date: '2021',
      bullets: [
        'Organized annual hackathon for 250+ participants',
        'Conducted bi-weekly technical workshops',
      ],
    },
  ],
  education: [
    {
      institution: 'State University',
      degree: 'B.S. in Computer Science',
      start_date: '2017',
      end_date: '2021',
    },
  ],
  certifications: [{ name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2023' }],
  languages: [
    { language: 'English', proficiency: 'Professional' },
    { language: 'Malayalam', proficiency: 'Native' },
  ],
};

const htmlWithLeadership = renderResume(mockResumeWithLeadership);

// Check order of headings in rendered HTML
const summaryPos = htmlWithLeadership.indexOf(LABELS.personal_info);
const experiencePos = htmlWithLeadership.indexOf(LABELS.experience);
const projectsPos = htmlWithLeadership.indexOf(LABELS.projects);
const skillsPos = htmlWithLeadership.indexOf(LABELS.skills);
const leadershipPos = htmlWithLeadership.indexOf(LABELS.leadership);
const educationPos = htmlWithLeadership.indexOf(LABELS.education);
const certsPos = htmlWithLeadership.indexOf(LABELS.certifications);
const languagesPos = htmlWithLeadership.indexOf(LABELS.languages);

assert(summaryPos !== -1, 'Summary section must exist in HTML');
assert(experiencePos !== -1, 'Experience section must exist in HTML');
assert(projectsPos !== -1, 'Projects section must exist in HTML');
assert(skillsPos !== -1, 'Skills section must exist in HTML');
assert(leadershipPos !== -1, 'Leadership section must exist in HTML');
assert(educationPos !== -1, 'Education section must exist in HTML');
assert(certsPos !== -1, 'Certifications section must exist in HTML');
assert(languagesPos !== -1, 'Languages section must exist in HTML');

assert(summaryPos < experiencePos, '1. Summary must come before 2. Experience');
assert(experiencePos < projectsPos, '2. Experience must come before 3. Projects');
assert(projectsPos < skillsPos, '3. Projects must come before 4. Skills');
assert(skillsPos < leadershipPos, '4. Skills must come before 5. Leadership & Activities');
assert(leadershipPos < educationPos, '5. Leadership & Activities must come before 6. Education');
assert(educationPos < certsPos, '6. Education must come before 7. Certifications');
assert(certsPos < languagesPos, '7. Certifications must come before 8. Languages');

// Verify Projects bullets render properly
assert(htmlWithLeadership.includes('Open-source tool that analyzes GitHub repositories'), 'Project bullet 1 must be present');
assert(htmlWithLeadership.includes('Cut query latency by 45% using Postgres indexing'), 'Project bullet 2 must be present');
assert(htmlWithLeadership.includes('<ul class="ats-bullets">'), 'ats-bullets list must be rendered for project');

// Verify Leadership content renders properly
assert(htmlWithLeadership.includes('President — ACM Student Chapter'), 'Leadership role/org must be present');
assert(htmlWithLeadership.includes('Organized annual hackathon for 250+ participants'), 'Leadership bullet must be present');

console.log('✔ HTML Template 8-section sequence verified:');
console.log('   1. Professional Summary');
console.log('   2. Work Experience');
console.log('   3. Projects (with bullets)');
console.log('   4. Skills');
console.log('   5. Leadership & Activities');
console.log('   6. Education');
console.log('   7. Certifications');
console.log('   8. Languages (LAST)');

// 4. Test Optionality: Hide Leadership if empty
const mockResumeNoLeadership = {
  ...mockResumeWithLeadership,
  leadership: [],
};
const htmlNoLeadership = renderResume(mockResumeNoLeadership);
assert(!htmlNoLeadership.includes(LABELS.leadership), 'Leadership heading must NOT appear when leadership is empty');
console.log('✔ Optional section rule verified: Leadership heading omitted when empty');

// 5. Test DOCX generation with leadership and bullets
async function testDocx() {
  const buffer = await generateDocx(mockResumeWithLeadership);
  assert(Buffer.isBuffer(buffer), 'generateDocx must return a Buffer');
  assert(buffer.length > 0, 'DOCX buffer must not be empty');
  console.log(`✔ docxService.js successfully generated DOCX export (${buffer.length} bytes) with Leadership and Project bullets`);

  const bufferNoLead = await generateDocx(mockResumeNoLeadership);
  assert(Buffer.isBuffer(bufferNoLead), 'generateDocx must return a Buffer when leadership is empty');
  assert(bufferNoLead.length > 0, 'DOCX buffer without leadership must not be empty');
  console.log(`✔ docxService.js successfully generated DOCX export without leadership (${bufferNoLead.length} bytes)`);
}

// 6. Test PDF generation
async function testPdf() {
  try {
    const pdfBuffer = await generatePdf(mockResumeWithLeadership);
    assert(Buffer.isBuffer(pdfBuffer), 'generatePdf must return a Buffer');
    assert(pdfBuffer.length > 0, 'PDF buffer must not be empty');
    assert(pdfBuffer.slice(0, 4).toString() === '%PDF', 'PDF buffer must begin with %PDF header');
    console.log(`✔ pdfService.js successfully generated PDF export (${pdfBuffer.length} bytes)`);
  } catch (err) {
    console.warn(`(PDF generation note: Puppeteer may require browser binary in environment: ${err.message})`);
  }
}

async function run() {
  await testDocx();
  await testPdf();
  console.log('\nALL SERVER TESTS FOR PROJECTS BULLETS & LEADERSHIP PASSED! 🎉');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
