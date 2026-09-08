const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function backupMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';
  console.log('[backup] Connecting to MongoDB:', uri);

  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  const resumes = await db.collection('resumes').find({}).toArray();

  console.log(`[backup] Found ${users.length} users and ${resumes.length} resumes.`);

  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `mongo-backup-${timestamp}.json`);

  const payload = {
    exported_at: new Date().toISOString(),
    source_uri: uri,
    counts: {
      users: users.length,
      resumes: resumes.length,
    },
    users,
    resumes,
  };

  fs.writeFileSync(backupFile, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`[backup] Successfully exported MongoDB data to: ${backupFile}`);

  await mongoose.disconnect();
  return backupFile;
}

if (require.main === module) {
  backupMongo()
    .then((file) => {
      console.log('[backup] Done. Backup saved at:', file);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[backup] Failed:', err);
      process.exit(1);
    });
}

module.exports = { backupMongo };
