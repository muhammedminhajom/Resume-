require('dotenv').config();
const mongoose = require('mongoose');
const Resume = require('../src/models/Resume');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('[migrate] Connected to MongoDB');

  const resumes = await Resume.find({});
  console.log(`[migrate] Found ${resumes.length} resumes to migrate`);

  let updated = 0;

  for (const resume of resumes) {
    let modified = false;

    const sections = [
      { key: 'education', fields: ['institution', 'degree', 'field', 'start_date', 'end_date', 'gpa'] },
      { key: 'experience', fields: ['company', 'role', 'start_date', 'end_date', 'bullets'] },
      { key: 'projects', fields: ['title', 'description', 'tech', 'link'] },
      { key: 'certifications', fields: ['name', 'issuer', 'date'] },
    ];

    for (const { key } of sections) {
      const items = resume[key] || [];
      for (const item of items) {
        if (!item._id) {
          item._id = new mongoose.Types.ObjectId();
          modified = true;
        }
      }
    }

    if (modified) {
      await resume.save();
      updated++;
    }
  }

  console.log(`[migrate] Updated ${updated} resumes with subdocument _ids`);
  await mongoose.disconnect();
  console.log('[migrate] Done');
}

migrate().catch((err) => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});