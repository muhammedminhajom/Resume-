const {
  listResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
} = require('../services/dbService');
const { sanitizeResumeInput } = require('../lib/sanitize');

function sanitizeBody(body) {
  const allowed = [
    'title',
    'template',
    'font',
    'personal_info',
    'education',
    'experience',
    'skills',
    'projects',
    'leadership',
    'certifications',
    'languages',
    'section_order',
  ];
  const clean = {};
  for (const key of allowed) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return sanitizeResumeInput(clean);
}

async function list(req, res, next) {
  try {
    const resumes = await listResumes(req.user.id);
    return res.json({ resumes });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = sanitizeBody(req.body);
    const resume = await createResume(req.user.id, data);
    return res.status(201).json({ resume });
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const resume = await getResumeById(req.params.id, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }
    return res.json({ resume });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = sanitizeBody(req.body);
    const resume = await updateResume(req.params.id, req.user.id, data);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }
    return res.json({ resume });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await deleteResume(req.params.id, req.user.id);
    if (!result) {
      return res.status(404).json({ message: 'Resume not found.' });
    }
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, getOne, update, remove };