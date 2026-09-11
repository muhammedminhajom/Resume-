const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { getSupabase } = require('./config/supabase');
const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const aiRoutes = require('./routes/ai');

const app = express();

app.set('trust proxy', 1);

// Parse and normalize CLIENT_ORIGIN (strip whitespace, surrounding quotes, and trailing slashes)
const rawClientOrigin = process.env.CLIENT_ORIGIN || '';
const allowedOrigins = rawClientOrigin
  .split(',')
  .map((o) => o.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''))
  .filter(Boolean);

console.log('[CORS] Configured CLIENT_ORIGIN (raw):', process.env.CLIENT_ORIGIN);
console.log('[CORS] Normalized allowed origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    const cleanOrigin = origin.trim().replace(/\/+$/, '').toLowerCase();
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed === '*') return true;
      return allowed.toLowerCase() === cleanOrigin;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked request from origin: "${origin}". Allowed origins:`, allowedOrigins);
    return callback(null, false);
  },
  credentials: true,
};

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...allowedOrigins, 'https://*.supabase.co'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/resumes', apiLimiter, resumeRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5001;

function describePortUsage(port) {
  const cmd =
    process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `netstat -tulpn 2>/dev/null | grep :${port}; true`;

  return new Promise((resolve) => {
    exec(cmd, { timeout: 5000 }, (err, stdout) => {
      if (stdout && stdout.trim()) return resolve(stdout);
      if (err && err.message) return resolve(null);
      return resolve(null);
    });
  });
}

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
  });

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[api] ERROR: port ${PORT} is already in use.`);
      console.error('[api] See which process owns the port on Windows:');
      console.error(`    netstat -ano | findstr :${PORT}`);
      console.error(`    Get-NetTCPConnection -LocalPort ${PORT} | Select-Object OwningProcess`);
      const usage = await describePortUsage(PORT);
      if (usage) {
        console.error(`[api] Current sockets on port ${PORT}:`);
        console.error(usage.trim());
      }
      console.error(
        '[api] If the owning PID is an old instance of this app, stop that process ' +
          '(e.g. Stop-Process -Id <PID>) and run `npm run dev` again. ' +
          'Do not kill processes you cannot confirm belong to this app.'
      );
    } else if (err.code === 'EACCES') {
      console.error(`[api] ERROR: permission denied binding to port ${PORT}.`);
    } else {
      console.error('[api] server error:', err);
    }
    process.exit(1);
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

function validateEnv() {
  const required = ['JWT_SECRET', 'CLIENT_ORIGIN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('[api] Missing required environment variables:', missing.join(', '));
    console.error('[api] Set them in .env or your deployment environment.');
    process.exit(1);
  }

  const KNOWN_PLACEHOLDERS = [
    'change-this-development-secret',
    'change_this_in_production',
    'dev_secret',
    'secret',
    'your-secret',
    'your_jwt_secret',
    'replace_me',
  ];

  const secret = (process.env.JWT_SECRET || '').trim();
  if (KNOWN_PLACEHOLDERS.includes(secret.toLowerCase())) {
    console.error('[api] Security Error: JWT_SECRET matches a known insecure placeholder value.');
    console.error('[api] Generate a cryptographically random secret with at least 64 characters.');
    process.exit(1);
  }

  const minLength = process.env.NODE_ENV === 'production' ? 64 : 32;
  if (secret.length < minLength) {
    console.error(
      `[api] Security Error: JWT_SECRET must be at least ${minLength} characters long (current length: ${secret.length}).`
    );
    process.exit(1);
  }
}

async function start() {
  try {
    validateEnv();
    console.log('[auth] GOOGLE_CLIENT_ID loaded:', process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.slice(0, 16)}...` : 'NOT FOUND');
    const supabase = getSupabase();
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('[db/supabase] Note during initial ping:', error.message);
    } else {
      console.log('[db/supabase] Connected to Supabase Postgres database.');
    }
    startServer();
  } catch (err) {
    console.error('[api] failed to start:', err.message);
    process.exit(1);
  }
}

start();