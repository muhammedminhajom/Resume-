const Resume = require('../models/Resume');
const { generatePdf } = require('../services/pdfService');

async function exportPdf(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

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