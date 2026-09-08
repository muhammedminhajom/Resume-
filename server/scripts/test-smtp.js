const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { verifySMTP, sendEmail, sendSignupConfirmationEmail, sendResetEmail } = require('../src/services/emailService');

async function main() {
  console.log('=== SMTP Configuration Check ===');
  console.log('SMTP_HOST:', process.env.SMTP_HOST ? `"${process.env.SMTP_HOST.trim()}"` : 'MISSING');
  console.log('SMTP_PORT:', process.env.SMTP_PORT ? `"${process.env.SMTP_PORT.trim()}"` : 'MISSING (default 587)');
  console.log('SMTP_USER:', process.env.SMTP_USER ? `"${process.env.SMTP_USER.trim()}"` : 'MISSING');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? `[SET, length: ${process.env.SMTP_PASS.trim().length}]` : 'MISSING');
  console.log('SMTP_FROM:', process.env.SMTP_FROM ? `"${process.env.SMTP_FROM.trim()}"` : (process.env.EMAIL_FROM || 'MISSING'));
  console.log('================================\n');

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('ERROR: Missing required SMTP env variables in server/.env (SMTP_HOST, SMTP_USER, or SMTP_PASS).');
    console.error('Please save your changes to server/.env and re-run.');
    process.exit(1);
  }

  console.log('1. Verifying SMTP connection...');
  try {
    await verifySMTP();
    console.log('✔ SMTP connection verified successfully!');
  } catch (err) {
    console.error('✖ SMTP connection verification failed:');
    console.error(err.message);
    process.exit(1);
  }

  const recipient = process.argv[2] || process.env.SMTP_USER.trim();
  console.log(`\n2. Sending test signup confirmation email to ${recipient}...`);
  try {
    await sendSignupConfirmationEmail(recipient, 'Test User');
    console.log(`✔ Test email dispatched successfully to ${recipient}!`);
  } catch (err) {
    console.error('✖ Test email send failed:');
    console.error(err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
