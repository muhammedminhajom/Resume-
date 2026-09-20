const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const HEX_TOKEN_REGEX = /^[0-9a-fA-F]{64}$/;

function validateSignup(req, res, next) {
  let { name, email, password } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'A valid full name is required.' });
  }

  name = name.trim();
  if (name.length > 100) {
    return res.status(400).json({ message: 'Name must not exceed 100 characters.' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one letter and one number.' });
  }

  req.body.name = name;
  req.body.email = email.trim().toLowerCase();
  return next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required.' });
  }

  req.body.email = email.trim().toLowerCase();
  return next();
}

function validateForgotPassword(req, res, next) {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  req.body.email = email.trim().toLowerCase();
  return next();
}

function validateResetPassword(req, res, next) {
  const { token, password } = req.body || {};

  if (!token || typeof token !== 'string' || !HEX_TOKEN_REGEX.test(token.trim())) {
    return res.status(400).json({ message: 'Invalid or malformed reset token.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'New password is required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one letter and one number.' });
  }

  req.body.token = token.trim();
  return next();
}

function validateUuidParam(paramName = 'id') {
  return (req, res, next) => {
    const val = req.params[paramName];
    if (!val || typeof val !== 'string' || !UUID_REGEX.test(val)) {
      return res.status(400).json({ message: `Invalid identifier format: '${paramName}' must be a valid UUID.` });
    }
    return next();
  };
}

function validateResumeBody(req, res, next) {
  const body = req.body || {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      return res.status(400).json({ message: 'Resume title cannot be empty.' });
    }
    if (body.title.trim().length > 150) {
      return res.status(400).json({ message: 'Resume title must not exceed 150 characters.' });
    }
  }

  const arrayFields = ['skills', 'education', 'experience', 'projects', 'leadership', 'certifications', 'languages', 'section_order'];
  for (const field of arrayFields) {
    if (body[field] !== undefined && !Array.isArray(body[field])) {
      return res.status(400).json({ message: `Field '${field}' must be an array.` });
    }
  }

  if (body.personal_info !== undefined && (typeof body.personal_info !== 'object' || body.personal_info === null || Array.isArray(body.personal_info))) {
    return res.status(400).json({ message: "Field 'personal_info' must be an object." });
  }

  return next();
}

module.exports = {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUuidParam,
  validateResumeBody,
};
