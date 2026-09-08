const router = require('express').Router();
const {
  signup,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
} = require('../controllers/authController');
const authenticate = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;