const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { suggestBullet } = require('../controllers/aiController');

router.use(authenticate);
router.post('/suggest-bullet', suggestBullet);

module.exports = router;