const path = require('path');
const multer = require('multer');
const { extractTextFromFile } = require('../services/fileParserService');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc']);

function verifyMagicBytes(buffer, ext) {
  if (!buffer || buffer.length < 4) return false;

  if (ext === '.pdf') {
    // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46 0x2D) anywhere in first 1024 bytes
    const searchLimit = Math.min(buffer.length, 1024);
    const slice = buffer.subarray(0, searchLimit);
    return slice.indexOf(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d])) !== -1;
  }

  if (ext === '.docx') {
    // DOCX is a ZIP archive, starts with PK\x03\x04 (0x50 0x4B 0x03 0x04)
    return buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  if (ext === '.doc') {
    // Legacy Compound File Binary Format: 0xD0 0xCF 0x11 0xE0
    return buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0;
  }

  return false;
}

// Configure multer for in-memory uploads up to 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase().trim();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('Invalid file type. Only .pdf and .docx documents are accepted.'));
    }

    if (!ALLOWED_MIME_TYPES.has(mime)) {
      return cb(new Error('Invalid file MIME type. Only PDF and Word documents are accepted.'));
    }

    return cb(null, true);
  },
}).single('file');

function parseUpload(req, res, _next) {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum allowed size is 5MB.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file was uploaded. Please attach a .pdf or .docx resume.' });
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    if (!verifyMagicBytes(req.file.buffer, ext)) {
      return res.status(400).json({
        message: 'The uploaded file content does not match a valid PDF or Word document signature.',
      });
    }

    try {
      const text = await extractTextFromFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      return res.json({
        success: true,
        text,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (parseErr) {
      return res.status(422).json({ message: parseErr.message });
    }
  });
}

module.exports = { parseUpload };
