const router = require('express').Router();
const rateLimit = require('express-rate-limit');
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
const {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validate');

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: { message: 'Too many password reset requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;