const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } = require('docx');
const { sanitizeHtml } = require('../lib/sanitize');

function createTextRun(text, options = {}) {
  return new TextRun({
    text: sanitizeHtml(text),
    ...options,
  });
}

function createParagraph(textRuns, options = {}) {
  return new Paragraph({
    children: textRuns.map((r) => (typeof r === 'string' ? createTextRun(r) : r)),
    ...options,
  });
}

function createHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    children: [createTextRun(text, { bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 28 : 24 })],
    heading: level,
    spacing: { before: 200, after: 100 },
  });
}

function createBullet(text) {
  return new Paragraph({
    children: [createTextRun(text)],
    bullet: { level: 0 },
    indent: { left: 720, hanging: 360 },
    spacing: { after: 60 },
  });
}

function createContactLine(contacts) {
  return new Paragraph({
    children: contacts.map((contact, i) => [
      createTextRun(contact),
      i < contacts.length - 1 ? createTextRun(' • ') : null,
    ].filter(Boolean)),
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
  });
}

function createSectionDivider() {
  return new Paragraph({
    children: [createTextRun('')],
    border: { bottom: { color: 'auto', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { before: 120, after: 120 },
  });
}

function formatDateRange(start, end) {
  const parts = [start, end].filter(Boolean);
  return parts.length ? parts.join(' – ') : '';
}

function createExperienceEntry(entry) {
  const children = [];
  
  const titleParts = [entry.role, entry.company].filter(Boolean);
  if (titleParts.length) {
    children.push(
      createParagraph([
        createTextRun(titleParts.join(' — '), { bold: true, size: 24 }),
        createTextRun(formatDateRange(entry.start_date, entry.end_date), { size: 20, color: '666666' }),
      ], { spacing: { after: 60 } })
    );
  } else if (formatDateRange(entry.start_date, entry.end_date)) {
    children.push(
      createParagraph([
        createTextRun(formatDateRange(entry.start_date, entry.end_date), { size: 20, color: '666666' }),
      ], { spacing: { after: 60 } })
    );
  }

  if (entry.bullets?.length) {
    entry.bullets.filter(Boolean).forEach((bullet) => {
      children.push(createBullet(bullet));
    });
  }

  return children;
}

function createEducationEntry(entry) {
  const children = [];

  if (entry.institution) {
    children.push(
      createParagraph([
        createTextRun(entry.institution, { bold: true, size: 24 }),
        createTextRun(formatDateRange(entry.start_date, entry.end_date), { size: 20, color: '666666' }),
      ], { spacing: { after: 60 } })
    );
  }

  const subParts = [entry.degree, entry.field].filter(Boolean);
  if (entry.gpa) subParts.push(`GPA: ${entry.gpa}`);
  if (subParts.length) {
    children.push(
      createParagraph([createTextRun(subParts.join(', '), { size: 22, color: '444444' })], { spacing: { after: 60 } })
    );
  }

  return children;
}

function createProjectEntry(entry) {
  const children = [];

  if (entry.title) {
    const titleParts = [entry.title];
    if (entry.link) titleParts.push(entry.link);
    children.push(
      createParagraph(titleParts.map((p, i) => [
        createTextRun(p, { bold: i === 0, size: 24 }),
        i < titleParts.length - 1 ? createTextRun(' ') : null,
      ].filter(Boolean)), { spacing: { after: 60 } })
    );
  }

  if (entry.description) {
    children.push(createParagraph([createTextRun(entry.description, { size: 22 })], { spacing: { after: 60 } }));
  }

  if (entry.tech?.length) {
    children.push(createParagraph([createTextRun(entry.tech.join(', '), { size: 20, color: '666666' })], { spacing: { after: 60 } }));
  }

  return children;
}

function createCertificationEntry(entry) {
  const children = [];

  if (entry.name) {
    children.push(
      createParagraph([
        createTextRun(entry.name, { bold: true, size: 24 }),
        entry.date ? createTextRun(entry.date, { size: 20, color: '666666' }) : null,
      ].filter(Boolean), { spacing: { after: 60 } })
    );
  }

  if (entry.issuer) {
    children.push(createParagraph([createTextRun(entry.issuer, { size: 22, color: '444444' })], { spacing: { after: 60 } }));
  }

  return children;
}

function createSkillLine(skills) {
  return new Paragraph({
    children: skills.map((skill, i) => [
      createTextRun(skill, { size: 22 }),
      i < skills.length - 1 ? createTextRun(' · ') : null,
    ].filter(Boolean)),
    spacing: { after: 60 },
  });
}

async function generateDocx(resume) {
  const p = resume.personal_info || {};
  const contacts = [p.email, p.phone, p.location, ...(p.links || [])].filter(Boolean);

  const docChildren = [];

  if (p.name) {
    docChildren.push(
      new Paragraph({
        children: [createTextRun(p.name, { bold: true, size: 40 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      })
    );
  }

  if (p.headline) {
    docChildren.push(
      new Paragraph({
        children: [createTextRun(p.headline, { size: 26, color: '4F46E5' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      })
    );
  }

  if (contacts.length) {
    docChildren.push(createContactLine(contacts));
  }

  if (p.summary) {
    docChildren.push(createParagraph([createTextRun(p.summary, { size: 22 })], { spacing: { after: 200 } }));
  }

  const sectionOrder = resume.section_order || [
    'personal_info',
    'education',
    'experience',
    'skills',
    'projects',
    'certifications',
  ];

  const sectionMap = {
    education: {
      label: 'Education',
      items: resume.education || [],
      render: createEducationEntry,
    },
    experience: {
      label: 'Experience',
      items: resume.experience || [],
      render: createExperienceEntry,
    },
    skills: {
      label: 'Skills',
      items: resume.skills || [],
      render: (skills) => [createSkillLine(skills)],
    },
    projects: {
      label: 'Projects',
      items: resume.projects || [],
      render: createProjectEntry,
    },
    certifications: {
      label: 'Certifications',
      items: resume.certifications || [],
      render: createCertificationEntry,
    },
  };

  for (const key of sectionOrder) {
    if (key === 'personal_info') continue;
    const section = sectionMap[key];
    if (!section || !section.items.length) continue;

    docChildren.push(createHeading(section.label, HeadingLevel.HEADING_2));
    docChildren.push(createSectionDivider());

    if (key === 'skills') {
      docChildren.push(...section.render(section.items));
    } else {
      section.items.forEach((item) => {
        docChildren.push(...section.render(item));
      });
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren,
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateDocx };