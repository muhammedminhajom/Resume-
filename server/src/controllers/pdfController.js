const { getResumeById } = require('../services/dbService');
const { generatePdf } = require('../services/pdfService');
const { sanitizeResumeInput } = require('../lib/sanitize');

async function exportPdf(req, res, next) {
  try {
    const rawResume = await getResumeById(req.params.id, req.user.id);
    if (!rawResume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    const resume = sanitizeResumeInput(rawResume);
    const pdf = await generatePdf(resume);

    const baseName = (resume.title || 'resume')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'resume';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.pdf"`);
    res.setHeader('Content-Length', pdf.length);
    return res.send(pdf);
  } catch (err) {
    console.error('[pdf-export] failed:', err.message);
    return next(err);
  }
}

module.exports = { exportPdf };