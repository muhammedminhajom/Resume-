const Resume = require('../models/Resume');
const { sanitizeResumeInput } = require('../lib/sanitize');

function sanitizeBody(body) {
  const allowed = [
    'title',
    'template',
    'personal_info',
    'education',
    'experience',
    'skills',
    'projects',
    'certifications',
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
    const resumes = await Resume.find({ user_id: req.user.id })
      .sort({ updated_at: -1 })
      .select('title template section_order created_at updated_at');
    return res.json({ resumes });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = sanitizeBody(req.body);
    const resume = await Resume.create({ user_id: req.user.id, ...data });
    return res.status(201).json({ resume });
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user_id: req.user.id });
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
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { $set: data },
      { new: true, runValidators: true }
    );
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
    const result = await Resume.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!result) {
      return res.status(404).json({ message: 'Resume not found.' });
    }
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, getOne, update, remove };