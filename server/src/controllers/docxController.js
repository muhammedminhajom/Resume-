const { getResumeById } = require('../services/dbService');
const { generateDocx } = require('../services/docxService');

async function exportDocx(req, res, next) {
  try {
    const resume = await getResumeById(req.params.id, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    const docx = await generateDocx(resume);

    const baseName = (resume.title || 'resume')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'resume';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}.docx"`);
    res.setHeader('Content-Length', docx.length);
    return res.send(docx);
  } catch (err) {
    console.error('[docx-export] failed:', err.message);
    return next(err);
  }
}

module.exports = { exportDocx };