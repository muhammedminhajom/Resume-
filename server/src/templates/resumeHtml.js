const escapeHtml = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const FONT_MAP = {
  Arial: 'Arial, Helvetica, sans-serif',
  Calibri: 'Calibri, Candara, "Segoe UI", Arial, sans-serif',
  'Times New Roman': '"Times New Roman", Times, Georgia, serif',
  Georgia: 'Georgia, serif',
  // fallbacks for legacy values
  modern: 'Arial, Helvetica, sans-serif',
  classic: 'Georgia, serif',
  minimal: 'Calibri, Candara, "Segoe UI", Arial, sans-serif',
};

const DEFAULT_ORDER = [
  'personal_info',
  'experience',
  'projects',
  'skills',
  'leadership',
  'education',
  'certifications',
  'languages',
];

const LABELS = {
  personal_info: 'Professional Summary',
  experience: 'Work Experience',
  projects: 'Projects',
  skills: 'Skills',
  leadership: 'Leadership & Activities',
  education: 'Education',
  certifications: 'Certifications',
  languages: 'Languages',
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

function contactItems(personalInfo) {
  const items = [
    personalInfo.phone,
    personalInfo.email,
    personalInfo.location,
    ...(Array.isArray(personalInfo.links) ? personalInfo.links : []),
  ].filter(Boolean);
  return [...new Set(items)].map((item) => escapeHtml(item));
}

function orderedSections(resume) {
  const order =
    Array.isArray(resume.section_order) && resume.section_order.length
      ? resume.section_order
      : DEFAULT_ORDER;
  const present = order.filter((key) => DEFAULT_ORDER.includes(key));
  for (const key of DEFAULT_ORDER) {
    if (!present.includes(key)) present.push(key);
  }
  return present;
}

function renderHeader(p) {
  if (!p || !p.name) return '';
  const contacts = contactItems(p);
  return `
    <header class="ats-header">
      <h1 class="ats-name">${escapeHtml(p.name)}</h1>
      ${p.headline ? `<div class="ats-headline">${escapeHtml(p.headline)}</div>` : ''}
      ${contacts.length ? `<div class="ats-contact">${contacts.join(' &nbsp;•&nbsp; ')}</div>` : ''}
    </header>`;
}

function renderSections(resume) {
  const parts = [];
  const keys = orderedSections(resume);
  const p = resume.personal_info || {};

  for (const key of keys) {
    if (key === 'personal_info') {
      const header = renderHeader(p);
      if (header) parts.push(header);
      if (p.summary) {
        parts.push(`
          <section class="ats-section">
            <h2 class="ats-section-title">${LABELS.personal_info}</h2>
            <p class="ats-summary-text">${escapeHtml(p.summary)}</p>
          </section>
        `);
      }
      continue;
    }

    if (key === 'experience') {
      const items = sortReverseChronological(resume.experience || []);
      if (!items.length) continue;
      const blocks = items.map((x) => {
        const dates = [x.start_date, x.end_date].filter(Boolean).join(' – ');
        const title = [x.role, x.company].filter(Boolean).join(' — ');
        return `
          <div class="ats-entry">
            <div class="ats-row">
              <span class="ats-entry-title">${escapeHtml(title)}</span>
              ${dates ? `<span class="ats-date">${escapeHtml(dates)}</span>` : ''}
            </div>
            ${x.bullets && x.bullets.length ? `<ul class="ats-bullets">${x.bullets.filter(Boolean).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
          </div>`;
      });
      parts.push(`
        <section class="ats-section">
          <h2 class="ats-section-title">${LABELS.experience}</h2>
          ${blocks.join('')}
        </section>
      `);
      continue;
    }

    if (key === 'skills') {
      const skills = resume.skills || [];
      if (!skills.length) continue;
      parts.push(`
        <section class="ats-section">
          <h2 class="ats-section-title">${LABELS.skills}</h2>
          <p class="ats-skills-line">${skills.map(escapeHtml).join(' &nbsp;•&nbsp; ')}</p>
        </section>
      `);
      continue;
    }

    if (key === 'education') {
      const items = sortReverseChronological(resume.education || []);
      if (!items.length) continue;
      const blocks = items.map((e) => {
        const dates = [e.start_date, e.end_date].filter(Boolean).join(' – ');
        const line = [e.degree, e.field].filter(Boolean).join(', ');
        return `
          <div class="ats-entry">
            <div class="ats-row">
              <span class="ats-entry-title">${escapeHtml(e.institution)}</span>
              ${dates ? `<span class="ats-date">${escapeHtml(dates)}</span>` : ''}
            </div>
            ${line || e.gpa ? `<div class="ats-sub">${escapeHtml(line)}${e.gpa ? ` &nbsp;•&nbsp; GPA: ${escapeHtml(e.gpa)}` : ''}</div>` : ''}
          </div>`;
      });
      parts.push(`
        <section class="ats-section">
          <h2 class="ats-section-title">${LABELS.education}</h2>
          ${blocks.join('')}
        </section>
      `);
      continue;
    }

    if (key === 'certifications') {
      const items = resume.certifications || [];
      if (!items.length) continue;
      const blocks = items.map((c) => `
        <div class="ats-entry">
          <div class="ats-row">
            <div>
              <span class="ats-entry-title">${escapeHtml(c.name)}</span>
              ${c.issuer ? `<span class="ats-sub"> — ${escapeHtml(c.issuer)}</span>` : ''}
            </div>
            ${c.date ? `<span class="ats-date">${escapeHtml(c.date)}</span>` : ''}
          </div>
        </div>`);
      parts.push(`
        <section class="ats-section">
          <h2 class="ats-section-title">${LABELS.certifications}</h2>
          ${blocks.join('')}
        </section>
      `);
      continue;
    }

    if (key === 'projects') {
      const items = resume.projects || [];
      if (!items.length) continue;
      const blocks = items.map((p) => {
        const hasBullets = p.bullets && p.bullets.length > 0 && p.bullets.some((b) => b && b.trim());
        const bulletHtml = hasBullets
          ? `<ul class="ats-bullets">${p.bullets.filter(Boolean).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
          : p.description
          ? `<div class="ats-text">${escapeHtml(p.description)}</div>`
          : '';
        return `
          <div class="ats-entry">
            <div class="ats-row">
              <span class="ats-entry-title">${escapeHtml(p.title)}</span>
              ${p.link ? `<a class="ats-link" href="${escapeHtml(p.link)}">${escapeHtml(p.link)}</a>` : ''}
            </div>
            ${bulletHtml}
            ${p.tech && p.tech.length ? `<div class="ats-tech">Technologies: ${escapeHtml(p.tech.join(', '))}</div>` : ''}
          </div>`;
      });
      parts.push(`
        <section class="ats-section">
          <h2 class="ats-section-title">${LABELS.projects}</h2>
          ${blocks.join('')}
        </section>
      `);
      continue;
    }

    if (key === 'leadership') {
      const items = resume.leadership || [];
      if (!items.length) continue;
      const validItems = items.filter(
        (l) => l.role?.trim() || l.organization?.trim() || (l.bullets && l.bullets.some((b) => b && b.trim()))
      );
      if (!validItems.length) continue;
      const blocks = validItems.map((l) => {
        const dates = [l.start_date, l.end_date].filter(Boolean).join(' – ');
        const title = [l.role, l.organization].filter(Boolean).join(' — ');
        return `
          <div class="ats-entry">
            <div class="ats-row">
              <span class="ats-entry-title">${escapeHtml(title)}</span>
              ${dates ? `<span class="ats-date">${escapeHtml(dates)}</span>` : ''}
            </div>
            ${l.bullets && l.bullets.length ? `<ul class="ats-bullets">${l.bullets.filter(Boolean).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
          </div>`;
      });
      parts.push(`
        <section class="ats-section">
          <h2 class="ats-section-title">${LABELS.leadership}</h2>
          ${blocks.join('')}
        </section>
      `);
      continue;
    }

    if (key === 'languages') {
      const items = resume.languages || [];
      if (!items.length) continue;
      const formatted = items
        .map((l) => {
          if (typeof l === 'string') return l.trim();
          const name = (l.language || '').trim();
          const prof = (l.proficiency || '').trim();
          return prof ? `${name} — ${prof}` : name;
        })
        .filter(Boolean);
      if (!formatted.length) continue;
      parts.push(`
        <section class="ats-section">
          <h2 class="ats-section-title">${LABELS.languages}</h2>
          <p class="ats-skills-line">${formatted.map(escapeHtml).join(' &nbsp;•&nbsp; ')}</p>
        </section>
      `);
      continue;
    }
  }

  return parts.join('\n');
}

function renderResume(resume) {
  const plain = resume.toObject ? resume.toObject() : resume;
  const fontKey = plain.font || plain.template || 'Arial';
  const fontFamily = FONT_MAP[fontKey] || FONT_MAP.Arial;
  const bodyHtml = renderSections(plain);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(plain.title || 'Resume')}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ${fontFamily};
    color: #000000;
    background: #ffffff;
    font-size: 10.5pt;
    line-height: 1.45;
  }
  .ats-document {
    padding: 0;
    width: 100%;
  }
  .ats-header {
    text-align: center;
    margin-bottom: 8px;
    padding-bottom: 4px;
  }
  .ats-name {
    font-size: 20pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #000000;
    margin-bottom: 2px;
  }
  .ats-headline {
    font-size: 10.5pt;
    font-weight: bold;
    color: #000000;
    margin-bottom: 3px;
  }
  .ats-contact {
    font-size: 10pt;
    color: #000000;
  }
  .ats-section {
    margin-top: 14px;
    margin-bottom: 4px;
  }
  .ats-section-title {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #000000;
    border-bottom: 1px solid #000000;
    padding-bottom: 2px;
    margin-bottom: 6px;
  }
  .ats-entry {
    margin-bottom: 8px;
  }
  .ats-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .ats-entry-title {
    font-size: 10.5pt;
    font-weight: bold;
    color: #000000;
  }
  .ats-date {
    font-size: 10pt;
    color: #000000;
    white-space: nowrap;
    text-align: right;
  }
  .ats-sub {
    font-size: 10.5pt;
    color: #000000;
  }
  .ats-summary-text {
    font-size: 10.5pt;
    line-height: 1.45;
    color: #000000;
  }
  .ats-skills-line {
    font-size: 10.5pt;
    line-height: 1.5;
    color: #000000;
  }
  .ats-bullets {
    margin-top: 3px;
    padding-left: 20px;
    list-style-type: disc;
  }
  .ats-bullets li {
    font-size: 10.5pt;
    line-height: 1.45;
    color: #000000;
    margin-bottom: 2px;
  }
  .ats-text {
    font-size: 10.5pt;
    margin-top: 2px;
  }
  .ats-tech {
    font-size: 10pt;
    margin-top: 2px;
  }
  .ats-link {
    font-size: 10pt;
    color: #000000;
    text-decoration: underline;
  }
</style>
</head>
<body>
  <main class="ats-document">
    ${bodyHtml}
  </main>
</body>
</html>`;
}

module.exports = { renderResume, LABELS, DEFAULT_ORDER };