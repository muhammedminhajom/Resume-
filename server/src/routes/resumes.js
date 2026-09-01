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

router.use(authenticate);

router.get('/', list);
router.post('/', create);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/export', exportPdf);
router.post('/:id/export-docx', exportDocx);

module.exports = router;