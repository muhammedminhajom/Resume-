/**
 * Email service — uses Resend if RESEND_API_KEY is set, otherwise falls back to SMTP/nodemailer.
 *
 * Resend setup (recommended):
 *   1. Sign up at https://resend.com and verify your domain (or use onboarding@resend.dev for testing)
 *   2. Create an API key and add RESEND_API_KEY to .env
 *   3. Set EMAIL_FROM to a verified sender address (e.g. noreply@yourdomain.com)
 *
 * SMTP fallback (nodemailer):
 *   Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in .env
 */

const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------------
// Resend sender
// ---------------------------------------------------------------------------
async function sendViaResend(to, subject, html) {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const from = process.env.EMAIL_FROM || 'Resume Builder <onboarding@resend.dev>';

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

// ---------------------------------------------------------------------------
// SMTP fallback (nodemailer)
// ---------------------------------------------------------------------------
function buildSMTPTransporter() {
  const host = process.env.SMTP_HOST?.trim() || 'smtp.example.com';
  const port = Number(process.env.SMTP_PORT?.trim()) || 587;
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  let pass = process.env.SMTP_PASS?.trim();
  if (host.includes('gmail') && pass && pass.replace(/\s+/g, '').length === 16) {
    pass = pass.replace(/\s+/g, '');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });
}

function classifySMTPError(err) {
  if (err.code === 'EAUTH' || err.responseCode === 535) {
    return 'AUTH_FAILURE: Authentication failed. Verify SMTP_USER and SMTP_PASS (for Gmail, ensure a 16-character App Password is used without extra spaces)';
  }
  if (err.code === 'ECONNREFUSED') {
    return `CONNECTION_REFUSED: Connection refused by ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Check host and port.`;
  }
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT' || err.command === 'CONN') {
    return `CONNECTION_TIMEOUT: Connection timed out reaching ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Likely blocked by firewall or ISP port blocking.`;
  }
  return `SMTP_ERROR: ${err.message || err.code || 'Unknown SMTP error'}`;
}

async function sendViaSMTP(to, subject, html) {
  const transporter = buildSMTPTransporter();
  try {
    const from = (process.env.SMTP_FROM || process.env.EMAIL_FROM || 'Resume Builder <noreply@resumebuilder.app>').trim();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`[email] SMTP send succeeded: messageId=${info.messageId}`);
    return info;
  } catch (err) {
    const diagnosis = classifySMTPError(err);
    console.error(`[email] SMTP send failed: ${diagnosis}`, {
      code: err.code,
      responseCode: err.responseCode,
      response: err.response,
      command: err.command,
    });
    throw new Error(`${diagnosis} (raw: ${err.message})`, { cause: err });
  }
}

// ---------------------------------------------------------------------------
// Unified send
// ---------------------------------------------------------------------------
async function sendEmail(to, subject, html) {
  if (process.env.RESEND_API_KEY?.trim()) {
    console.log(`[email] sending via Resend to ${to}`);
    await sendViaResend(to, subject, html);
  } else if (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim()) {
    console.log(`[email] sending via SMTP to ${to}`);
    await sendViaSMTP(to, subject, html);
  } else {
    console.warn('[email] No email provider configured (RESEND_API_KEY or SMTP_HOST+SMTP_USER). Skipping send.');
    console.log(`[email] Would have sent "${subject}" to ${to}`);
  }
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------
function resetEmailHtml(resetUrl) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Reset Your Password</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1e293b;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#f8fafc;border-radius:12px;padding:32px;">
    <h1 style="color:#4338ca;font-size:24px;margin:0 0 16px;">Reset Your Password</h1>
    <p style="margin:0 0 16px;">You requested a password reset for your Resume Builder account.</p>
    <p style="margin:0 0 24px;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#64748b;">If the button doesn't work, copy this link:</p>
    <p style="margin:0 0 24px;font-size:14px;color:#4f46e5;word-break:break-all;">${resetUrl}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="margin:0;font-size:12px;color:#94a3b8;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body>
</html>`;
}

function signupConfirmationHtml(name) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Welcome to Resume Builder</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1e293b;max-width:600px;margin:0 auto;padding:24px;">
  <div style="background:#f8fafc;border-radius:12px;padding:32px;">
    <h1 style="color:#4338ca;font-size:24px;margin:0 0 16px;">Welcome, ${name || 'there'}! 🎉</h1>
    <p style="margin:0 0 16px;">Your Resume Builder account has been created successfully.</p>
    <p style="margin:0 0 24px;">Start building your ATS-optimized resume in minutes:</p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#475569;">
      <li>Fill in your personal info and work experience</li>
      <li>Choose from ATS-safe fonts (Arial, Calibri, Times New Roman, Georgia)</li>
      <li>Export as PDF or DOCX</li>
      <li>Check your ATS score against any job description</li>
    </ul>
    <p style="text-align:center;margin:32px 0;">
      <a href="${process.env.CLIENT_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:5173'}" style="display:inline-block;background:#4f46e5;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Start Building</a>
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="margin:0;font-size:12px;color:#94a3b8;">Resume Builder — create standout, ATS-ready resumes.</p>
  </div>
</body>
</html>`;
}

async function sendResetEmail(to, resetUrl) {
  return sendEmail(to, 'Reset Your Password — Resume Builder', resetEmailHtml(resetUrl));
}

async function sendSignupConfirmationEmail(to, name) {
  return sendEmail(to, 'Welcome to Resume Builder! 🎉', signupConfirmationHtml(name));
}

async function verifySMTP() {
  const transporter = buildSMTPTransporter();
  return transporter.verify();
}

module.exports = {
  sendResetEmail,
  sendSignupConfirmationEmail,
  sendEmail,
  verifySMTP,
  buildSMTPTransporter,
};