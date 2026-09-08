const router = require('express').Router();
const authenticate = require('../middleware/auth');
const {
  list,
  create,
  getOne,
  update,
  remove,
} = require('../controllers/resumeController');
const { exportPdf } = require('../controllers/pdfController');
const { exportDocx } = require('../controllers/docxController');
const {
  calculateAtsScore,
  calculateRawAtsScore,
  compareJobMatch,
} = require('../controllers/atsController');
const { parseUpload } = require('../controllers/uploadController');

router.use(authenticate);

// Specific POST endpoints (must come before /:id)
router.post('/raw/ats-score', calculateRawAtsScore);
router.post('/job-match', compareJobMatch);
router.post('/parse-upload', parseUpload);

// Core CRUD
router.get('/', list);
router.post('/', create);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/export', exportPdf);
router.post('/:id/export-docx', exportDocx);
router.post('/:id/ats-score', calculateAtsScore);

module.exports = router;