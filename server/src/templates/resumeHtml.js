const escapeHtml = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function contactItems(personalInfo) {
  const items = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    ...(Array.isArray(personalInfo.links) ? personalInfo.links : []),
  ].filter(Boolean);
  return [...new Set(items)].map((item) => escapeHtml(item));
}

function hasData(section) {
  if (Array.isArray(section)) return section.length > 0;
  if (!section) return false;
  if (typeof section === 'object') {
    return Object.values(section).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      return v;
    });
  }
  return section;
}

const DEFAULT_ORDER = [
  'personal_info',
  'education',
  'experience',
  'skills',
  'projects',
  'certifications',
];

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

const STYLES = {
  modern: {
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    headerClass: 'modern-header',
    nameClass: 'modern-name',
    headlineClass: 'modern-headline',
    contactClass: 'modern-contact',
    summaryClass: 'modern-summary',
    contactSep: ' &nbsp;•&nbsp; ',
    sectionTitleClass: 'modern-section-title',
    styles: `
      .modern-page { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #1e293b; }
      .modern-header { border-bottom: 3px solid #1e3a8a; padding-bottom: 14px; }
      .modern-name { font-size: 28px; font-weight: 700; color: #1e3a8a; margin: 0 0 2px 0; letter-spacing: -0.5px; }
      .modern-headline { font-size: 15px; color: #475569; margin: 0 0 8px 0; font-weight: 600; }
      .modern-contact { font-size: 11.5px; color: #475569; margin: 4px 0; }
      .modern-summary { font-size: 12.5px; color: #334155; margin: 8px 0 0 0; line-height: 1.5; }
      .modern-section-title {
        font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;
        color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 16px 0 8px 0;
      }
      .modern-row { display: flex; justify-content: space-between; align-items: baseline; }
      .modern-company { font-weight: 600; font-size: 12.5px; color: #0f172a; }
      .modern-date { font-size: 11px; color: #64748b; white-space: nowrap; }
      .modern-sub { font-size: 12px; color: #475569; margin: 1px 0 6px 0; }
      .modern-bullets { margin: 0; padding-left: 18px; }
      .modern-bullets li { font-size: 12px; line-height: 1.5; color: #334155; margin-bottom: 3px; }
      .modern-skills span {
        display: inline-block; font-size: 11.5px; background: #eef2ff; color: #1e3a8a;
        border-radius: 999px; padding: 4px 10px; margin: 0 6px 6px 0; font-weight: 500;
      }
      .modern-text { font-size: 12px; line-height: 1.5; color: #334155; margin: 2px 0; }
      .modern-tech { font-size: 11px; color: #64748b; margin-top: 3px; }
      .modern-item { margin-bottom: 12px; }
    `,
  },
  classic: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    headerClass: 'classic-header',
    nameClass: 'classic-name',
    headlineClass: 'classic-headline',
    contactClass: 'classic-contact',
    summaryClass: 'classic-summary',
    contactSep: ' &nbsp;|&nbsp; ',
    sectionTitleClass: 'classic-section-title',
    styles: `
      .classic-page { font-family: Georgia, 'Times New Roman', serif; color: #111827; }
      .classic-header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 12px; }
      .classic-name { font-size: 30px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 6px 0; color: #111827; }
      .classic-headline { font-size: 14px; font-style: italic; color: #374151; margin: 0 0 8px 0; }
      .classic-contact { font-size: 12px; color: #374151; margin: 2px 0; }
      .classic-summary { font-size: 13px; color: #111827; margin: 10px 0 0 0; line-height: 1.6; font-style: italic; }
      .classic-section-title {
        font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
        color: #111827; border-bottom: 1px solid #9ca3af; padding-bottom: 3px; margin: 16px 0 8px 0;
      }
      .classic-row { display: flex; justify-content: space-between; align-items: baseline; }
      .classic-company { font-weight: 700; font-size: 13px; }
      .classic-date { font-size: 12px; font-style: italic; color: #374151; white-space: nowrap; }
      .classic-sub { font-size: 13px; font-style: italic; color: #374151; margin: 1px 0 6px 0; }
      .classic-bullets { margin: 0; padding-left: 18px; }
      .classic-bullets li { font-size: 12.5px; line-height: 1.55; margin-bottom: 3px; }
      .classic-skills span {
        display: inline-block; font-size: 12px; border: 1px solid #9ca3af; padding: 3px 9px;
        margin: 0 5px 5px 0; }
      .classic-text { font-size: 12.5px; line-height: 1.55; margin: 2px 0; }
      .classic-tech { font-size: 12px; font-style: italic; color: #374151; margin-top: 3px; }
      .classic-item { margin-bottom: 12px; }
    `,
  },
  minimal: {
    fontFamily: "'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
    headerClass: 'minimal-header',
    nameClass: 'minimal-name',
    headlineClass: 'minimal-headline',
    contactClass: 'minimal-contact',
    summaryClass: 'minimal-summary',
    contactSep: ' &nbsp;·&nbsp; ',
    sectionTitleClass: 'minimal-section-title',
    styles: `
      .minimal-page { font-family: 'Helvetica Neue', 'Segoe UI', Arial, sans-serif; color: #111827; }
      .minimal-header { padding-bottom: 12px; margin-bottom: 4px; }
      .minimal-name { font-size: 26px; font-weight: 300; letter-spacing: 1px; color: #111827; margin: 0 0 2px 0; }
      .minimal-headline { font-size: 13px; letter-spacing: 0.6px; text-transform: uppercase; color: #6b7280; margin: 0 0 8px 0; }
      .minimal-contact { font-size: 11.5px; color: #6b7280; margin: 2px 0; }
      .minimal-summary { font-size: 12.5px; color: #111827; margin: 8px 0 0 0; line-height: 1.6; }
      .minimal-section-title {
        font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2.5px;
        color: #6b7280; margin: 20px 0 8px 0;
      }
      .minimal-row { display: flex; justify-content: space-between; align-items: baseline; }
      .minimal-company { font-weight: 600; font-size: 12.5px; }
      .minimal-date { font-size: 11px; color: #9ca3af; white-space: nowrap; }
      .minimal-sub { font-size: 12px; color: #374151; margin: 1px 0 6px 0; }
      .minimal-bullets { margin: 0; padding-left: 16px; }
      .minimal-bullets li { font-size: 12px; line-height: 1.55; margin-bottom: 3px; color: #374151; }
      .minimal-skills span {
        display: inline-block; font-size: 11.5px; color: #374151; padding: 3px 0; margin: 0 14px 3px 0;
      }
      .minimal-text { font-size: 12px; line-height: 1.55; color: #374151; margin: 2px 0; }
      .minimal-tech { font-size: 11px; color: #9ca3af; margin-top: 3px; }
      .minimal-item { margin-bottom: 12px; }
    `,
  },
};

const LABELS = {
  education: 'Education',
  experience: 'Experience',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
};

const ROW_CLASS = 'row';
const COMPANY_CLASS = 'company';
const DATE_CLASS = 'date';
const SUB_CLASS = 'sub';
const BULLETS_CLASS = 'bullets';
const TEXT_CLASS = 'text';
const TECH_CLASS = 'tech';
const ITEM_CLASS = 'item';

function cls(prefix, suffix) {
  return `${prefix}-${suffix}`;
}

function renderHeader(resume, style, prefix) {
  const p = resume.personal_info;
  if (!p || !p.name) return '';
  const contacts = contactItems(p);
  return `
    <header class="${style.headerClass}">
      <h1 class="${style.nameClass}">${escapeHtml(p.name)}</h1>
      ${p.headline ? `<p class="${style.headlineClass}">${escapeHtml(p.headline)}</p>` : ''}
      ${contacts.length ? `<p class="${style.contactClass}">${contacts.join(style.contactSep)}</p>` : ''}
      ${p.summary ? `<p class="${style.summaryClass}">${escapeHtml(p.summary)}</p>` : ''}
    </header>`;
}

function renderSections(resume) {
  const template = resume.template || 'modern';
  const prefix = template;
  const parts = [];
  const keys = orderedSections(resume);

  for (const key of keys) {
    if (key === 'personal_info') {
      const header = renderHeader(resume, STYLES[template], template);
      if (header) parts.push(header);
      continue;
    }

    const data = resume[key];
    if (!hasData(data)) continue;

    if (key === 'skills') {
      parts.push(
        `<h2 class="${STYLES[template].sectionTitleClass}">${LABELS.skills}</h2>`,
        `<div class="${cls(prefix, 'skills')}">${data
          .map((s) => `<span>${escapeHtml(s)}</span>`)
          .join('')}</div>`
      );
      continue;
    }

    let blocks = [];
    if (key === 'education') {
      blocks = data.map((e) => {
        const dates = [e.start_date, e.end_date].filter(Boolean).join(' – ');
        const line = [e.degree, e.field].filter(Boolean).join(', ');
        return `
        <div class="${cls(prefix, ITEM_CLASS)}">
          <div class="${cls(prefix, ROW_CLASS)}">
            <strong class="${cls(prefix, COMPANY_CLASS)}">${escapeHtml(e.institution)}</strong>
            ${dates ? `<span class="${cls(prefix, DATE_CLASS)}">${escapeHtml(dates)}</span>` : ''}
          </div>
          ${line || e.gpa ? `<p class="${cls(prefix, SUB_CLASS)}">${escapeHtml(line)}${e.gpa ? ` &nbsp;•&nbsp; GPA: ${escapeHtml(e.gpa)}` : ''}</p>` : ''}
        </div>`;
      });
    } else if (key === 'experience') {
      blocks = data.map((x) => {
        const dates = [x.start_date, x.end_date].filter(Boolean).join(' – ');
        const title = [x.role, x.company].filter(Boolean).join(' — ');
        return `
        <div class="${cls(prefix, ITEM_CLASS)}">
          <div class="${cls(prefix, ROW_CLASS)}">
            <strong class="${cls(prefix, COMPANY_CLASS)}">${escapeHtml(title)}</strong>
            ${dates ? `<span class="${cls(prefix, DATE_CLASS)}">${escapeHtml(dates)}</span>` : ''}
          </div>
          ${x.bullets && x.bullets.length ? `<ul class="${cls(prefix, BULLETS_CLASS)}">${x.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
        </div>`;
      });
    } else if (key === 'projects') {
      blocks = data.map((p) => `
        <div class="${cls(prefix, ITEM_CLASS)}">
          <div class="${cls(prefix, ROW_CLASS)}">
            <strong class="${cls(prefix, COMPANY_CLASS)}">${escapeHtml(p.title)}</strong>
            ${p.link ? `<a class="${cls(prefix, TECH_CLASS)}" href="${escapeHtml(p.link)}">${escapeHtml(p.link)}</a>` : ''}
          </div>
          ${p.description ? `<p class="${cls(prefix, TEXT_CLASS)}">${escapeHtml(p.description)}</p>` : ''}
          ${p.tech && p.tech.length ? `<p class="${cls(prefix, TECH_CLASS)}">${escapeHtml(p.tech.join(', '))}</p>` : ''}
        </div>`);
    } else if (key === 'certifications') {
      blocks = data.map((c) => `
        <div class="${cls(prefix, ITEM_CLASS)}">
          <div class="${cls(prefix, ROW_CLASS)}">
            <strong class="${cls(prefix, COMPANY_CLASS)}">${escapeHtml(c.name)}</strong>
            ${c.date ? `<span class="${cls(prefix, DATE_CLASS)}">${escapeHtml(c.date)}</span>` : ''}
          </div>
          ${c.issuer ? `<p class="${cls(prefix, SUB_CLASS)}">${escapeHtml(c.issuer)}</p>` : ''}
        </div>`);
    }

    if (blocks.length) {
      parts.push(`<h2 class="${STYLES[template].sectionTitleClass}">${LABELS[key]}</h2>`, ...blocks);
    }
  }

  return parts.join('\n');
}

function renderResume(resume) {
  const plain = resume.toObject ? resume.toObject() : resume;
  const template = plain.template || 'modern';
  const style = STYLES[template] || STYLES.modern;
  const sectionHtml = renderSections(plain);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Resume</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; font-family: ${style.fontFamily}; }
  a { text-decoration: none; color: inherit; }
  ${style.styles}
</style>
</head>
<body>
  <main class="${template}-page">
    ${sectionHtml}
  </main>
</body>
</html>`;
}

module.exports = { renderResume };