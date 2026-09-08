const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} = require('docx');
const { sanitizeHtml } = require('../lib/sanitize');

const ATS_FONTS = {
  Arial: 'Arial',
  Calibri: 'Calibri',
  'Times New Roman': 'Times New Roman',
  Georgia: 'Georgia',
};

function parseYear(dateStr) {
  if (!dateStr) return 0;
  const str = String(dateStr).trim().toLowerCase();
  if (str === 'present' || str === 'current' || str === 'now' || str === 'ongoing') {
    return 999999;
  }
  const match = str.match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    const year = parseInt(match[1], 10);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    for (let i = 0; i < months.length; i++) {
      if (str.includes(months[i])) return year * 100 + (i + 1);
    }
    return year * 100;
  }
  return 0;
}

function sortReverseChronological(items) {
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

function createTextRun(text, options = {}, font = 'Arial') {
  return new TextRun({
    text: sanitizeHtml(text),
    font,
    color: '000000',
    ...options,
  });
}

function createParagraph(textRuns, options = {}) {
  return new Paragraph({
    children: textRuns.map((r) => (typeof r === 'string' ? createTextRun(r) : r)),
    ...options,
  });
}

function createSectionHeading(text, font) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 26, // 13pt
        font,
        color: '000000',
      }),
    ],
    border: {
      bottom: {
        color: '000000',
        space: 2,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    spacing: { before: 240, after: 120 },
  });
}

function createBullet(text, font) {
  return new Paragraph({
    children: [
      new TextRun({
        text: sanitizeHtml(text),
        size: 21, // 10.5pt
        font,
        color: '000000',
      }),
    ],
    bullet: { level: 0 },
    indent: { left: 400, hanging: 200 },
    spacing: { before: 40, after: 40 },
  });
}

function createContactLine(contacts, font) {
  return new Paragraph({
    children: contacts.map((contact, i) => [
      new TextRun({
        text: sanitizeHtml(contact),
        size: 20, // 10pt
        font,
        color: '000000',
      }),
      i < contacts.length - 1
        ? new TextRun({
            text: ' • ',
            size: 20,
            bold: true,
            font,
            color: '000000',
          })
        : null,
    ].filter(Boolean)),
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
  });
}

function formatDateRange(start, end) {
  const parts = [start, end].filter(Boolean);
  return parts.length ? parts.join(' – ') : '';
}

async function generateDocx(resume) {
  const plain = resume.toObject ? resume.toObject() : resume;
  const fontKey = plain.font || plain.template || 'Arial';
  const font = ATS_FONTS[fontKey] || ATS_FONTS.Arial;

  const p = plain.personal_info || {};
  const contacts = [p.phone, p.email, p.location, ...(p.links || [])].filter(Boolean);

  const docChildren = [];

  // Top In-Body Contact Header
  if (p.name) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sanitizeHtml(p.name).toUpperCase(),
            bold: true,
            size: 40, // 20pt
            font,
            color: '000000',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
      })
    );
  }

  if (p.headline) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sanitizeHtml(p.headline),
            bold: true,
            size: 22, // 11pt
            font,
            color: '000000',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
      })
    );
  }

  if (contacts.length) {
    docChildren.push(createContactLine(contacts, font));
  }

  const DEFAULT_DOCX_ORDER = [
    'personal_info',
    'experience',
    'projects',
    'skills',
    'leadership',
    'education',
    'certifications',
    'languages',
  ];

  const rawOrder = Array.isArray(plain.section_order) && plain.section_order.length
    ? plain.section_order
    : DEFAULT_DOCX_ORDER;
  const sectionOrder = rawOrder.filter((key) => DEFAULT_DOCX_ORDER.includes(key));
  for (const key of DEFAULT_DOCX_ORDER) {
    if (!sectionOrder.includes(key)) sectionOrder.push(key);
  }

  for (const key of sectionOrder) {
    if (key === 'personal_info') {
      if (p.summary) {
        docChildren.push(createSectionHeading('Professional Summary', font));
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sanitizeHtml(p.summary),
                size: 21,
                font,
                color: '000000',
              }),
            ],
            spacing: { before: 60, after: 120 },
          })
        );
      }
      continue;
    }

    if (key === 'experience') {
      const items = sortReverseChronological(plain.experience || []);
      if (!items.length) continue;

      docChildren.push(createSectionHeading('Work Experience', font));

      items.forEach((entry) => {
        const titleParts = [entry.role, entry.company].filter(Boolean);
        const title = titleParts.join(' — ');
        const dates = formatDateRange(entry.start_date, entry.end_date);

        if (title || dates) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeHtml(title),
                  bold: true,
                  size: 21,
                  font,
                  color: '000000',
                }),
                dates
                  ? new TextRun({
                      text: `    ${sanitizeHtml(dates)}`,
                      size: 20,
                      font,
                      color: '000000',
                    })
                  : null,
              ].filter(Boolean),
              spacing: { before: 100, after: 40 },
            })
          );
        }

        if (entry.bullets?.length) {
          entry.bullets.filter(Boolean).forEach((bullet) => {
            docChildren.push(createBullet(bullet, font));
          });
        }
      });
      continue;
    }

    if (key === 'skills') {
      const skills = plain.skills || [];
      if (!skills.length) continue;

      docChildren.push(createSectionHeading('Skills', font));
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: skills.map(sanitizeHtml).join('  •  '),
              size: 21,
              font,
              color: '000000',
            }),
          ],
          spacing: { before: 60, after: 120 },
        })
      );
      continue;
    }

    if (key === 'education') {
      const items = sortReverseChronological(plain.education || []);
      if (!items.length) continue;

      docChildren.push(createSectionHeading('Education', font));

      items.forEach((entry) => {
        const dates = formatDateRange(entry.start_date, entry.end_date);
        if (entry.institution || dates) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeHtml(entry.institution),
                  bold: true,
                  size: 21,
                  font,
                  color: '000000',
                }),
                dates
                  ? new TextRun({
                      text: `    ${sanitizeHtml(dates)}`,
                      size: 20,
                      font,
                      color: '000000',
                    })
                  : null,
              ].filter(Boolean),
              spacing: { before: 80, after: 30 },
            })
          );
        }

        const subParts = [entry.degree, entry.field].filter(Boolean);
        if (entry.gpa) subParts.push(`GPA: ${entry.gpa}`);
        if (subParts.length) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeHtml(subParts.join(', ')),
                  size: 21,
                  font,
                  color: '000000',
                }),
              ],
              spacing: { before: 20, after: 80 },
            })
          );
        }
      });
      continue;
    }

    if (key === 'certifications') {
      const items = plain.certifications || [];
      if (!items.length) continue;

      docChildren.push(createSectionHeading('Certifications', font));

      items.forEach((entry) => {
        const parts = [
          entry.name ? sanitizeHtml(entry.name) : null,
          entry.issuer ? sanitizeHtml(entry.issuer) : null,
        ].filter(Boolean);

        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: parts.join(' — '),
                bold: Boolean(entry.name),
                size: 21,
                font,
                color: '000000',
              }),
              entry.date
                ? new TextRun({
                    text: `    ${sanitizeHtml(entry.date)}`,
                    size: 20,
                    font,
                    color: '000000',
                  })
                : null,
            ].filter(Boolean),
            spacing: { before: 60, after: 60 },
          })
        );
      });
      continue;
    }

    if (key === 'projects') {
      const items = plain.projects || [];
      if (!items.length) continue;

      docChildren.push(createSectionHeading('Projects', font));

      items.forEach((entry) => {
        if (entry.title) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeHtml(entry.title),
                  bold: true,
                  size: 21,
                  font,
                  color: '000000',
                }),
                entry.link
                  ? new TextRun({
                      text: `    (${sanitizeHtml(entry.link)})`,
                      size: 20,
                      font,
                      color: '000000',
                    })
                  : null,
              ].filter(Boolean),
              spacing: { before: 80, after: 30 },
            })
          );
        }

        if (entry.bullets?.length && entry.bullets.some((b) => b && b.trim())) {
          entry.bullets.filter(Boolean).forEach((bullet) => {
            docChildren.push(createBullet(bullet, font));
          });
        } else if (entry.description) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeHtml(entry.description),
                  size: 21,
                  font,
                  color: '000000',
                }),
              ],
              spacing: { before: 20, after: 40 },
            })
          );
        }

        if (entry.tech?.length) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Technologies: ${sanitizeHtml(entry.tech.join(', '))}`,
                  size: 20,
                  font,
                  color: '000000',
                }),
              ],
              spacing: { before: 20, after: 80 },
            })
          );
        }
      });
      continue;
    }

    if (key === 'leadership') {
      const items = plain.leadership || [];
      if (!items.length) continue;

      const validItems = items.filter(
        (l) => l.role?.trim() || l.organization?.trim() || (l.bullets && l.bullets.some((b) => b && b.trim()))
      );
      if (!validItems.length) continue;

      docChildren.push(createSectionHeading('Leadership & Activities', font));

      validItems.forEach((entry) => {
        const titleParts = [entry.role, entry.organization].filter(Boolean);
        const title = titleParts.join(' — ');
        const dates = formatDateRange(entry.start_date, entry.end_date);

        if (title || dates) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeHtml(title),
                  bold: true,
                  size: 21,
                  font,
                  color: '000000',
                }),
                dates
                  ? new TextRun({
                      text: `    ${sanitizeHtml(dates)}`,
                      size: 20,
                      font,
                      color: '000000',
                    })
                  : null,
              ].filter(Boolean),
              spacing: { before: 100, after: 40 },
            })
          );
        }

        if (entry.bullets?.length) {
          entry.bullets.filter(Boolean).forEach((bullet) => {
            docChildren.push(createBullet(bullet, font));
          });
        }
      });
      continue;
    }

    if (key === 'languages') {
      const items = plain.languages || [];
      if (!items.length) continue;

      const langStrings = items
        .map((l) => {
          if (typeof l === 'string') return l.trim();
          const name = (l.language || '').trim();
          const prof = (l.proficiency || '').trim();
          return prof ? `${name} — ${prof}` : name;
        })
        .filter(Boolean);

      if (!langStrings.length) continue;

      docChildren.push(createSectionHeading('Languages', font));
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: langStrings.map(sanitizeHtml).join('  •  '),
              size: 21,
              font,
              color: '000000',
            }),
          ],
          spacing: { before: 60, after: 120 },
        })
      );
      continue;
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateDocx };