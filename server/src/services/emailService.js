const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetEmail(email, resetUrl) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #f8fafc; border-radius: 12px; padding: 32px;">
        <h1 style="color: #1e3a8a; font-size: 24px; margin: 0 0 16px;">Reset Your Password</h1>
        <p style="margin: 0 0 16px;">You requested a password reset for your Resume Builder account.</p>
        <p style="margin: 0 0 24px;">Click the button below to set a new password. This link expires in 1 hour.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </p>
        <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">If the button doesn't work, copy this link:</p>
        <p style="margin: 0 0 24px; font-size: 14px; color: #4f46e5; word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Resume Builder <noreply@resumebuilder.app>',
    to: email,
    subject: 'Reset Your Resume Builder Password',
    html,
  });
}

module.exports = { sendResetEmail };