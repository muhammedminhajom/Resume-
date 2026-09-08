const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const {
  getUserByEmail,
  getUserById,
  getUserByResetToken,
  createUser,
  updateUser,
  userToSafeJSON,
} = require('../services/dbService');
const { JWT_SECRET } = require('../config/auth');
const { sendResetEmail, sendSignupConfirmationEmail } = require('../services/emailService');

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

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getOAuth2Client() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID?.trim(),
    process.env.GOOGLE_CLIENT_SECRET?.trim(),
    process.env.GOOGLE_CALLBACK_URL?.trim() || 'http://localhost:5001/api/auth/google/callback'
  );
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

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const user = await createUser({ full_name: name, email, password_hash });

    const token = signToken(user.id);
    setTokenCookie(res, token);

    sendSignupConfirmationEmail(user.email, user.full_name).catch((err) =>
      console.warn('[email] signup confirmation failed:', err.message)
    );

    return res.status(201).json({ user: userToSafeJSON(user), token });
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

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ message: 'Please sign in with Google for this account.' });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user.id);
    setTokenCookie(res, token);
    return res.json({ user: userToSafeJSON(user), token });
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
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user: userToSafeJSON(user) });
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

    const user = await getUserByEmail(email);
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await updateUser(user.id, {
      reset_token_hash: hashResetToken(resetToken),
      reset_token_expiry: resetTokenExpiry,
    });

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

    const tokenHash = hashResetToken(token);
    const user = await getUserByResetToken(tokenHash);

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const password_hash = await bcrypt.hash(String(password), SALT_ROUNDS);
    await updateUser(user.id, {
      password_hash,
      reset_token_hash: null,
      reset_token_expiry: null,
    });

    clearTokenCookie(res);
    return res.json({ message: 'Password has been reset. You can now sign in.' });
  } catch (err) {
    return next(err);
  }
}

async function googleAuth(req, res, next) {
  try {
    const clientOrigin = process.env.CLIENT_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:5173';
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      console.warn('[auth/google] Missing OAuth credentials:', {
        hasClientId: Boolean(clientId),
        hasClientSecret: Boolean(clientSecret),
      });
      return res.redirect(`${clientOrigin}/login?error=${encodeURIComponent('Google OAuth is not configured on the server.')}`);
    }

    const client = getOAuth2Client();
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'profile', 'email'],
      prompt: 'select_account',
    });

    return res.redirect(authorizeUrl);
  } catch (err) {
    return next(err);
  }
}

async function googleCallback(req, res) {
  const clientOrigin = process.env.CLIENT_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:5173';
  const { code, error } = req.query;

  if (error) {
    const errorMsg = error === 'access_denied'
      ? 'Google sign-in was cancelled.'
      : `Google authentication failed (${error}).`;
    return res.redirect(`${clientOrigin}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code) {
    return res.redirect(`${clientOrigin}/login?error=${encodeURIComponent('No authorization code received from Google.')}`);
  }

  try {
    const client = getOAuth2Client();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect(`${clientOrigin}/login?error=${encodeURIComponent('Google account did not provide an email address.')}`);
    }

    const { sub: googleId, email, name } = payload;
    const normalizedEmail = String(email).toLowerCase();

    let user = await getUserByEmail(normalizedEmail);
    if (user) {
      if (!user.google_id || !user.is_google_linked) {
        user = await updateUser(user.id, {
          google_id: googleId,
          is_google_linked: true,
        });
      }
    } else {
      user = await createUser({
        full_name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        google_id: googleId,
        is_google_linked: true,
      });

      sendSignupConfirmationEmail(user.email, user.full_name).catch((err) =>
        console.warn('[email] signup confirmation failed for google user:', err.message)
      );
    }

    const token = signToken(user.id);
    setTokenCookie(res, token);

    return res.redirect(`${clientOrigin}/login?token=${token}`);
  } catch (err) {
    console.error('[auth/google] callback error:', err);
    return res.redirect(`${clientOrigin}/login?error=${encodeURIComponent('Failed to authenticate with Google. Please try again.')}`);
  }
}

module.exports = { signup, login, logout, me, forgotPassword, resetPassword, googleAuth, googleCallback };