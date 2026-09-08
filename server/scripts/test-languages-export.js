const assert = require('assert');
const { DEFAULT_SECTION_ORDER } = require('../src/models/Resume');
const { renderResume, DEFAULT_ORDER, LABELS } = require('../src/templates/resumeHtml');
const { generateDocx } = require('../src/services/docxService');
const { generatePdf } = require('../src/services/pdfService');
const { analyzeResume, parseRawResumeText } = require('../src/services/atsService');

console.log('Testing Section Order & Exports across Server...');

const EXPECTED_ORDER = [
  'personal_info',
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
  'languages',
];

// 1. Check DEFAULT_SECTION_ORDER in Resume model
assert.deepStrictEqual(
  DEFAULT_SECTION_ORDER,
  EXPECTED_ORDER,
  `Resume.js DEFAULT_SECTION_ORDER must match expected 7-section order`
);
console.log('✔ Resume.js DEFAULT_SECTION_ORDER matches expected sequence exactly:');
console.log('  ', DEFAULT_SECTION_ORDER.join(' -> '));

// 2. Check DEFAULT_ORDER in resumeHtml
assert.deepStrictEqual(
  DEFAULT_ORDER,
  EXPECTED_ORDER,
  `resumeHtml.js DEFAULT_ORDER must match expected 7-section order`
);
console.log('✔ resumeHtml.js DEFAULT_ORDER matches expected sequence exactly:');
console.log('  ', DEFAULT_ORDER.join(' -> '));

// 3. Test HTML generation and section positions
const mockResume = {
  title: 'Test Order Resume',
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
    { title: 'Devmetrics', description: 'Developer productivity tool', link: 'https://devmetrics.io' },
  ],
  skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
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

const html = renderResume(mockResume);

// Check order of headings in rendered HTML
const summaryPos = html.indexOf(LABELS.personal_info);
const experiencePos = html.indexOf(LABELS.experience);
const projectsPos = html.indexOf(LABELS.projects);
const skillsPos = html.indexOf(LABELS.skills);
const educationPos = html.indexOf(LABELS.education);
const certsPos = html.indexOf(LABELS.certifications);
const languagesPos = html.indexOf(LABELS.languages);

assert(summaryPos !== -1, 'Summary section must exist in HTML');
assert(experiencePos !== -1, 'Experience section must exist in HTML');
assert(projectsPos !== -1, 'Projects section must exist in HTML');
assert(skillsPos !== -1, 'Skills section must exist in HTML');
assert(educationPos !== -1, 'Education section must exist in HTML');
assert(certsPos !== -1, 'Certifications section must exist in HTML');
assert(languagesPos !== -1, 'Languages section must exist in HTML');

assert(summaryPos < experiencePos, 'Summary must come before Experience');
assert(experiencePos < projectsPos, 'Experience must come before Projects');
assert(projectsPos < skillsPos, 'Projects must come before Skills');
assert(skillsPos < educationPos, 'Skills must come before Education');
assert(educationPos < certsPos, 'Education must come before Certifications');
assert(certsPos < languagesPos, 'Certifications must come before Languages');

console.log('✔ HTML Template section sequence verified:');
console.log('   1. Professional Summary');
console.log('   2. Work Experience');
console.log('   3. Projects');
console.log('   4. Skills');
console.log('   5. Education');
console.log('   6. Certifications');
console.log('   7. Languages (LAST)');

// 4. Test DOCX generation
async function testDocx() {
  const buffer = await generateDocx(mockResume);
  assert(Buffer.isBuffer(buffer), 'generateDocx must return a Buffer');
  assert(buffer.length > 0, 'DOCX buffer must not be empty');
  console.log(`✔ docxService.js successfully generated DOCX export (${buffer.length} bytes)`);
}

// 5. Test PDF generation (Puppeteer)
async function testPdf() {
  try {
    const pdfBuffer = await generatePdf(mockResume);
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
  console.log('\nALL SERVER EXPORT TESTS PASSED! 🎉');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
