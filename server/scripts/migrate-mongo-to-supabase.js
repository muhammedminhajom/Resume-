const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const isDryRun = process.argv.includes('--dry-run');

async function getMongoData() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    const resumes = await db.collection('resumes').find({}).toArray();
    await mongoose.disconnect();
    return { users, resumes };
  } catch (err) {
    const backupDir = path.resolve(__dirname, '../backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter((f) => f.startsWith('mongo-backup-') && f.endsWith('.json'));
      if (files.length > 0) {
        files.sort().reverse();
        const latest = path.join(backupDir, files[0]);
        console.log(`[migration] Reading from backup file: ${latest}`);
        const parsed = JSON.parse(fs.readFileSync(latest, 'utf-8'));
        return { users: parsed.users || [], resumes: parsed.resumes || [] };
      }
    }
    throw new Error('No MongoDB connection and no backup files found.');
  }
}

async function runMigration() {
  console.log('====================================================');
  console.log(`Starting MongoDB to Supabase Migration ${isDryRun ? '[DRY RUN MODE]' : '[LIVE MODE]'}`);
  console.log('====================================================\n');

  const { users, resumes } = await getMongoData();
  console.log(`Found ${users.length} users and ${resumes.length} resumes to migrate.`);

  // 1. Prepare user mappings: oldMongoId -> newUUID
  const userMap = new Map();
  const transformedUsers = [];

  for (const u of users) {
    const oldId = String(u._id);
    const newId = crypto.randomUUID();
    userMap.set(oldId, newId);

    transformedUsers.push({
      id: newId,
      email: (u.email || '').toLowerCase().trim(),
      full_name: u.name || (u.email ? u.email.split('@')[0] : 'User'),
      password_hash: u.password_hash || null,
      google_id: u.google_id || null,
      is_google_linked: Boolean(u.is_google_linked || u.google_id),
      reset_token_hash: u.reset_token_hash || null,
      reset_token_expiry: u.reset_token_expiry ? new Date(u.reset_token_expiry) : null,
      created_at: u.created_at ? new Date(u.created_at) : new Date(),
      updated_at: u.updated_at ? new Date(u.updated_at) : new Date(),
    });
  }

  // 2. Prepare transformed resumes
  const transformedResumes = [];
  let totalWorkExp = 0;
  let totalProjects = 0;
  let totalLeadership = 0;
  let totalEducation = 0;
  let totalCerts = 0;
  let totalLanguages = 0;

  for (const r of resumes) {
    const oldUserId = String(r.user_id);
    const newUserId = userMap.get(oldUserId);

    if (!newUserId) {
      console.warn(`[migration] Warning: Resume ${r._id} has user_id ${oldUserId} which was not found in users list. Skipping.`);
      continue;
    }

    const newResumeId = crypto.randomUUID();
    const pi = r.personal_info || {};

    const workExpList = (r.experience || []).map((exp, idx) => ({
      id: crypto.randomUUID(),
      resume_id: newResumeId,
      title: exp.role || '',
      company: exp.company || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      bullets: JSON.stringify(exp.bullets || []),
      sort_order: idx,
    }));
    totalWorkExp += workExpList.length;

    const projectList = (r.projects || []).map((p, idx) => ({
      id: crypto.randomUUID(),
      resume_id: newResumeId,
      title: p.title || '',
      description: p.description || '',
      technologies: JSON.stringify(p.tech || []),
      link: p.link || '',
      bullets: JSON.stringify(p.bullets || []),
      sort_order: idx,
    }));
    totalProjects += projectList.length;

    const leadershipList = (r.leadership || []).map((l, idx) => ({
      id: crypto.randomUUID(),
      resume_id: newResumeId,
      title: l.role || '',
      organization: l.organization || '',
      start_date: l.start_date || '',
      end_date: l.end_date || '',
      dates: [l.start_date, l.end_date].filter(Boolean).join(' - '),
      bullets: JSON.stringify(l.bullets || []),
      sort_order: idx,
    }));
    totalLeadership += leadershipList.length;

    const educationList = (r.education || []).map((ed, idx) => ({
      id: crypto.randomUUID(),
      resume_id: newResumeId,
      school: ed.institution || '',
      degree: ed.degree || '',
      field: ed.field || '',
      gpa: ed.gpa || '',
      start_date: ed.start_date || '',
      end_date: ed.end_date || '',
      sort_order: idx,
    }));
    totalEducation += educationList.length;

    const certList = (r.certifications || []).map((c, idx) => ({
      id: crypto.randomUUID(),
      resume_id: newResumeId,
      name: c.name || '',
      issuer: c.issuer || '',
      date: c.date || '',
      sort_order: idx,
    }));
    totalCerts += certList.length;

    const langList = (r.languages || []).map((lang, idx) => ({
      id: crypto.randomUUID(),
      resume_id: newResumeId,
      language: lang.language || '',
      proficiency: lang.proficiency || '',
      sort_order: idx,
    }));
    totalLanguages += langList.length;

    transformedResumes.push({
      resume: {
        id: newResumeId,
        user_id: newUserId,
        title: r.title || 'Untitled Resume',
        template: r.template || 'arial',
        font: r.font || 'Arial',
        section_order: JSON.stringify(
          r.section_order || [
            'personal_info',
            'experience',
            'projects',
            'skills',
            'leadership',
            'education',
            'certifications',
            'languages',
          ]
        ),
        created_at: r.created_at ? new Date(r.created_at) : new Date(),
        updated_at: r.updated_at ? new Date(r.updated_at) : new Date(),
      },
      personal_info: {
        id: crypto.randomUUID(),
        resume_id: newResumeId,
        full_name: pi.name || '',
        title: pi.headline || '',
        email: pi.email || '',
        phone: pi.phone || '',
        location: pi.location || '',
        links: JSON.stringify(pi.links || []),
      },
      professional_summary: {
        id: crypto.randomUUID(),
        resume_id: newResumeId,
        content: pi.summary || '',
      },
      work_experience: workExpList,
      projects: projectList,
      skills: {
        id: crypto.randomUUID(),
        resume_id: newResumeId,
        skill_list: JSON.stringify(r.skills || []),
      },
      leadership_activities: leadershipList,
      education: educationList,
      certifications: certList,
      languages: langList,
    });
  }

  console.log('----------------------------------------------------');
  console.log('TRANSFORMATION SUMMARY:');
  console.log(`- Users to migrate:              ${transformedUsers.length}`);
  console.log(`- Resumes to migrate:            ${transformedResumes.length}`);
  console.log(`- Personal Info records:         ${transformedResumes.length}`);
  console.log(`- Professional Summary records:  ${transformedResumes.length}`);
  console.log(`- Skills records:                ${transformedResumes.length}`);
  console.log(`- Work Experience records:       ${totalWorkExp}`);
  console.log(`- Projects records:              ${totalProjects}`);
  console.log(`- Leadership records:            ${totalLeadership}`);
  console.log(`- Education records:             ${totalEducation}`);
  console.log(`- Certifications records:        ${totalCerts}`);
  console.log(`- Languages records:             ${totalLanguages}`);
  console.log('----------------------------------------------------\n');

  if (isDryRun) {
    console.log('[DRY RUN] First 2 sample transformed users:');
    console.log(JSON.stringify(transformedUsers.slice(0, 2), null, 2));

    if (transformedResumes.length > 0) {
      console.log('\n[DRY RUN] First sample transformed resume structure:');
      const sample = transformedResumes[0];
      console.log({
        resume: sample.resume,
        personal_info: sample.personal_info,
        professional_summary: sample.professional_summary,
        work_experience_count: sample.work_experience.length,
        projects_count: sample.projects.length,
        skills: sample.skills,
        leadership_count: sample.leadership_activities.length,
        education_count: sample.education.length,
        certifications_count: sample.certifications.length,
        languages_count: sample.languages.length,
      });
    }

    console.log('\n[DRY RUN COMPLETE] No data was written to PostgreSQL / Supabase.');
    console.log('To execute the real migration, run: node scripts/migrate-mongo-to-supabase.js');
    return;
  }

  // REAL RUN
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment. Please provide your Supabase connection string.');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    console.log('[migration] Connected to PostgreSQL via DATABASE_URL.');

    // 1. Insert users
    console.log(`[migration] Inserting ${transformedUsers.length} users...`);
    for (const u of transformedUsers) {
      await client.query(
        `INSERT INTO public.users
         (id, email, full_name, password_hash, google_id, is_google_linked, reset_token_hash, reset_token_expiry, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           password_hash = COALESCE(public.users.password_hash, EXCLUDED.password_hash),
           google_id = COALESCE(public.users.google_id, EXCLUDED.google_id),
           is_google_linked = public.users.is_google_linked OR EXCLUDED.is_google_linked`,
        [
          u.id,
          u.email,
          u.full_name,
          u.password_hash,
          u.google_id,
          u.is_google_linked,
          u.reset_token_hash,
          u.reset_token_expiry,
          u.created_at,
          u.updated_at,
        ]
      );
    }
    console.log('[migration] Users inserted successfully.');

    // 2. Insert resumes and child records (each wrapped in a strict transaction)
    console.log(`[migration] Inserting ${transformedResumes.length} resumes with child tables (in individual transactions)...`);
    let migratedCount = 0;

    for (const item of transformedResumes) {
      await client.query('BEGIN');
      try {
        const {
          resume,
          personal_info,
          professional_summary,
          work_experience,
          projects,
          skills,
          leadership_activities,
          education,
          certifications,
          languages,
        } = item;

        // 2a. Insert Resume
        await client.query(
          `INSERT INTO public.resumes
           (id, user_id, title, template, font, section_order, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)`,
          [
            resume.id,
            resume.user_id,
            resume.title,
            resume.template,
            resume.font,
            resume.section_order,
            resume.created_at,
            resume.updated_at,
          ]
        );

        // 2b. Personal Info
        await client.query(
          `INSERT INTO public.personal_info
           (id, resume_id, full_name, title, email, phone, location, links)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
          [
            personal_info.id,
            personal_info.resume_id,
            personal_info.full_name,
            personal_info.title,
            personal_info.email,
            personal_info.phone,
            personal_info.location,
            personal_info.links,
          ]
        );

        // 2c. Professional Summary
        await client.query(
          `INSERT INTO public.professional_summary
           (id, resume_id, content)
           VALUES ($1, $2, $3)`,
          [professional_summary.id, professional_summary.resume_id, professional_summary.content]
        );

        // 2d. Work Experience
        for (const we of work_experience) {
          await client.query(
            `INSERT INTO public.work_experience
             (id, resume_id, title, company, start_date, end_date, bullets, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
            [we.id, we.resume_id, we.title, we.company, we.start_date, we.end_date, we.bullets, we.sort_order]
          );
        }

        // 2e. Projects
        for (const p of projects) {
          await client.query(
            `INSERT INTO public.projects
             (id, resume_id, title, description, technologies, link, bullets, sort_order)
             VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8)`,
            [p.id, p.resume_id, p.title, p.description, p.technologies, p.link, p.bullets, p.sort_order]
          );
        }

        // 2f. Skills
        await client.query(
          `INSERT INTO public.skills
           (id, resume_id, skill_list)
           VALUES ($1, $2, $3::jsonb)`,
          [skills.id, skills.resume_id, skills.skill_list]
        );

        // 2g. Leadership Activities
        for (const la of leadership_activities) {
          await client.query(
            `INSERT INTO public.leadership_activities
             (id, resume_id, title, organization, start_date, end_date, dates, bullets, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
            [la.id, la.resume_id, la.title, la.organization, la.start_date, la.end_date, la.dates, la.bullets, la.sort_order]
          );
        }

        // 2h. Education
        for (const ed of education) {
          await client.query(
            `INSERT INTO public.education
             (id, resume_id, school, degree, field, gpa, start_date, end_date, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [ed.id, ed.resume_id, ed.school, ed.degree, ed.field, ed.gpa, ed.start_date, ed.end_date, ed.sort_order]
          );
        }

        // 2i. Certifications
        for (const cert of certifications) {
          await client.query(
            `INSERT INTO public.certifications
             (id, resume_id, name, issuer, date, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [cert.id, cert.resume_id, cert.name, cert.issuer, cert.date, cert.sort_order]
          );
        }

        // 2j. Languages
        for (const lang of languages) {
          await client.query(
            `INSERT INTO public.languages
             (id, resume_id, language, proficiency, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [lang.id, lang.resume_id, lang.language, lang.proficiency, lang.sort_order]
          );
        }

        await client.query('COMMIT');
        migratedCount++;
        process.stdout.write(`\r[migration] Migrated resume ${migratedCount}/${transformedResumes.length}`);
      } catch (resumeErr) {
        await client.query('ROLLBACK');
        console.error(`\n[migration] ERROR migrating resume ${item.resume.id} (${item.resume.title}):`, resumeErr.message);
        throw resumeErr;
      }
    }

    console.log(`\n\n[migration] SUCCESS! Migrated ${transformedUsers.length} users and ${migratedCount} resumes with full child relations.`);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigration().catch((err) => {
    console.error('\n[migration] FAILED:', err);
    process.exit(1);
  });
}

module.exports = { runMigration };
