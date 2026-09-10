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
const { validateUuidParam, validateResumeBody } = require('../middleware/validate');

router.use(authenticate);

// Specific POST endpoints (must come before /:id)
router.post('/raw/ats-score', calculateRawAtsScore);
router.post('/job-match', compareJobMatch);
router.post('/parse-upload', parseUpload);

// Core CRUD
router.get('/', list);
router.post('/', validateResumeBody, create);
router.get('/:id', validateUuidParam('id'), getOne);
router.put('/:id', validateUuidParam('id'), validateResumeBody, update);
router.delete('/:id', validateUuidParam('id'), remove);
router.post('/:id/export', validateUuidParam('id'), exportPdf);
router.post('/:id/export-docx', validateUuidParam('id'), exportDocx);
router.post('/:id/ats-score', validateUuidParam('id'), calculateAtsScore);

module.exports = router;