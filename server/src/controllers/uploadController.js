const multer = require('multer');
const { extractTextFromFile } = require('../services/fileParserService');

// Configure multer for in-memory uploads up to 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const isAllowedExt = /\.(pdf|docx|doc)$/i.test(file.originalname);

    if (allowed.includes(file.mimetype) || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .pdf and .docx documents are accepted.'));
    }
  },
}).single('file');

function parseUpload(req, res, next) {
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
