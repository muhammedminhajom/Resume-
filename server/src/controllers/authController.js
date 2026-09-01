const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/auth');
const { sendResetEmail } = require('../services/emailService');

const SALT_ROUNDS = 10;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: '7d' });
}

function setTokenCookie(res, token) {
  res.cookie('token', token, COOKIE_OPTIONS);
}

function clearTokenCookie(res) {
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setTokenCookie(res, token) {
  res.cookie('token', token, COOKIE_OPTIONS);
}

function clearTokenCookie(res) {
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const user = await User.create({ name, email, password_hash });

    const token = signToken(user._id);
    setTokenCookie(res, token);
    return res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user._id);
    setTokenCookie(res, token);
    return res.json({ user: user.toSafeJSON() });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    clearTokenCookie(res);
    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user: user.toSafeJSON() });
  } catch (err) {
    return next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.reset_token = resetToken;
    user.reset_token_expiry = resetTokenExpiry;
    await user.save();

    const resetUrl = `${process.env.CLIENT_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendResetEmail(user.email, resetUrl);

    return res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      reset_token: token,
      reset_token_expiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password_hash = await bcrypt.hash(String(password), SALT_ROUNDS);
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    clearTokenCookie(res);
    return res.json({ message: 'Password has been reset. You can now sign in.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { signup, login, logout, me, forgotPassword, resetPassword };