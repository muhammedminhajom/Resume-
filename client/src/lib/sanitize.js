import DOMPurify from 'dompurify';

export function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeObject(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeHtml(obj) : obj;
  }

  if (seen.has(obj)) return obj;
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, seen));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value, seen);
  }
  return sanitized;
}