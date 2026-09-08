const crypto = require('crypto');
const { getSupabase } = require('../config/supabase');
const { fromRelational, DEFAULT_SECTION_ORDER } = require('../lib/resumeAdapter');

// ── User Data Access ──────────────────────────────────────────────

async function getUserByEmail(email) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', String(email).toLowerCase().trim())
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getUserById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getUserByResetToken(tokenHash) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('reset_token_hash', tokenHash)
    .gt('reset_token_expiry', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createUser({ email, name, full_name, password_hash, google_id, is_google_linked }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: String(email).toLowerCase().trim(),
      full_name: full_name || name || email.split('@')[0],
      password_hash: password_hash || null,
      google_id: google_id || null,
      is_google_linked: Boolean(is_google_linked || google_id),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateUser(id, fields) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

function userToSafeJSON(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    is_google_linked: Boolean(user.google_id || user.is_google_linked),
    created_at: user.created_at,
  };
}

// ── Resume Data Access ────────────────────────────────────────────

async function listResumes(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('resumes')
    .select('id, title, template, section_order, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Add _id for frontend backwards-compatibility
  return (data || []).map((r) => ({
    _id: r.id,
    ...r,
  }));
}

async function getResumeById(id, userId) {
  const supabase = getSupabase();

  // 1. Fetch parent resume
  let query = supabase.from('resumes').select('*').eq('id', id);
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { data: resume, error: resumeErr } = await query.maybeSingle();

  if (resumeErr) throw resumeErr;
  if (!resume) return null;

  // 2. Fetch all child relations in parallel
  const [
    { data: personal_info },
    { data: professional_summary },
    { data: work_experience },
    { data: projects },
    { data: skills },
    { data: leadership_activities },
    { data: education },
    { data: certifications },
    { data: languages },
  ] = await Promise.all([
    supabase.from('personal_info').select('*').eq('resume_id', id).maybeSingle(),
    supabase.from('professional_summary').select('*').eq('resume_id', id).maybeSingle(),
    supabase.from('work_experience').select('*').eq('resume_id', id).order('sort_order', { ascending: true }),
    supabase.from('projects').select('*').eq('resume_id', id).order('sort_order', { ascending: true }),
    supabase.from('skills').select('*').eq('resume_id', id).maybeSingle(),
    supabase.from('leadership_activities').select('*').eq('resume_id', id).order('sort_order', { ascending: true }),
    supabase.from('education').select('*').eq('resume_id', id).order('sort_order', { ascending: true }),
    supabase.from('certifications').select('*').eq('resume_id', id).order('sort_order', { ascending: true }),
    supabase.from('languages').select('*').eq('resume_id', id).order('sort_order', { ascending: true }),
  ]);

  return fromRelational(resume, {
    personal_info,
    professional_summary,
    work_experience,
    projects,
    skills,
    leadership_activities,
    education,
    certifications,
    languages,
  });
}

async function createResume(userId, data) {
  const supabase = getSupabase();
  const resumeId = crypto.randomUUID();

  // 1. Insert parent resume
  const { error: resumeErr } = await supabase
    .from('resumes')
    .insert({
      id: resumeId,
      user_id: userId,
      title: data.title || 'Untitled Resume',
      template: data.template || 'arial',
      font: data.font || 'Arial',
      section_order: data.section_order || DEFAULT_SECTION_ORDER,
    })
    .select()
    .single();

  if (resumeErr) throw resumeErr;

  // 2. Insert child records
  await saveChildRecords(supabase, resumeId, data);

  return getResumeById(resumeId, userId);
}

async function updateResume(id, userId, data) {
  const supabase = getSupabase();

  // 1. Update parent resume
  const resumeUpdate = {};
  if (data.title !== undefined) resumeUpdate.title = data.title;
  if (data.template !== undefined) resumeUpdate.template = data.template;
  if (data.font !== undefined) resumeUpdate.font = data.font;
  if (data.section_order !== undefined) resumeUpdate.section_order = data.section_order;

  if (Object.keys(resumeUpdate).length > 0) {
    const { error: updateErr } = await supabase
      .from('resumes')
      .update(resumeUpdate)
      .eq('id', id)
      .eq('user_id', userId);

    if (updateErr) throw updateErr;
  }

  // 2. Update child records if provided
  await saveChildRecords(supabase, id, data);

  return getResumeById(id, userId);
}

async function saveChildRecords(supabase, resumeId, data) {
  const ops = [];

  // Personal Info & Summary
  if (data.personal_info) {
    const pi = data.personal_info;
    ops.push(
      supabase
        .from('personal_info')
        .upsert(
          {
            resume_id: resumeId,
            full_name: pi.name || '',
            title: pi.headline || '',
            email: pi.email || '',
            phone: pi.phone || '',
            location: pi.location || '',
            links: pi.links || [],
          },
          { onConflict: 'resume_id' }
        )
    );

    ops.push(
      supabase
        .from('professional_summary')
        .upsert(
          {
            resume_id: resumeId,
            content: pi.summary || '',
          },
          { onConflict: 'resume_id' }
        )
    );
  }

  // Skills
  if (data.skills !== undefined) {
    ops.push(
      supabase
        .from('skills')
        .upsert(
          {
            resume_id: resumeId,
            skill_list: data.skills || [],
          },
          { onConflict: 'resume_id' }
        )
    );
  }

  await Promise.all(ops);

  // Collections (Work experience, projects, leadership, education, certs, languages):
  // When an array is provided, replace collection records with new sort_order
  if (Array.isArray(data.experience)) {
    await supabase.from('work_experience').delete().eq('resume_id', resumeId);
    if (data.experience.length > 0) {
      const rows = data.experience.map((exp, idx) => ({
        resume_id: resumeId,
        title: exp.role || exp.title || '',
        company: exp.company || '',
        start_date: exp.start_date || '',
        end_date: exp.end_date || '',
        bullets: exp.bullets || [],
        sort_order: idx,
      }));
      await supabase.from('work_experience').insert(rows);
    }
  }

  if (Array.isArray(data.projects)) {
    await supabase.from('projects').delete().eq('resume_id', resumeId);
    if (data.projects.length > 0) {
      const rows = data.projects.map((p, idx) => ({
        resume_id: resumeId,
        title: p.title || '',
        description: p.description || '',
        technologies: p.tech || p.technologies || [],
        link: p.link || '',
        bullets: p.bullets || [],
        sort_order: idx,
      }));
      await supabase.from('projects').insert(rows);
    }
  }

  if (Array.isArray(data.leadership)) {
    await supabase.from('leadership_activities').delete().eq('resume_id', resumeId);
    if (data.leadership.length > 0) {
      const rows = data.leadership.map((l, idx) => ({
        resume_id: resumeId,
        title: l.role || l.title || '',
        organization: l.organization || '',
        start_date: l.start_date || '',
        end_date: l.end_date || '',
        dates: l.dates || [l.start_date, l.end_date].filter(Boolean).join(' - '),
        bullets: l.bullets || [],
        sort_order: idx,
      }));
      await supabase.from('leadership_activities').insert(rows);
    }
  }

  if (Array.isArray(data.education)) {
    await supabase.from('education').delete().eq('resume_id', resumeId);
    if (data.education.length > 0) {
      const rows = data.education.map((ed, idx) => ({
        resume_id: resumeId,
        school: ed.institution || ed.school || '',
        degree: ed.degree || '',
        field: ed.field || '',
        gpa: ed.gpa || '',
        start_date: ed.start_date || '',
        end_date: ed.end_date || '',
        sort_order: idx,
      }));
      await supabase.from('education').insert(rows);
    }
  }

  if (Array.isArray(data.certifications)) {
    await supabase.from('certifications').delete().eq('resume_id', resumeId);
    if (data.certifications.length > 0) {
      const rows = data.certifications.map((c, idx) => ({
        resume_id: resumeId,
        name: c.name || '',
        issuer: c.issuer || '',
        date: c.date || '',
        sort_order: idx,
      }));
      await supabase.from('certifications').insert(rows);
    }
  }

  if (Array.isArray(data.languages)) {
    await supabase.from('languages').delete().eq('resume_id', resumeId);
    if (data.languages.length > 0) {
      const rows = data.languages.map((lang, idx) => ({
        resume_id: resumeId,
        language: lang.language || '',
        proficiency: lang.proficiency || '',
        sort_order: idx,
      }));
      await supabase.from('languages').insert(rows);
    }
  }
}

async function deleteResume(id, userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  return data;
}

module.exports = {
  getUserByEmail,
  getUserById,
  getUserByResetToken,
  createUser,
  updateUser,
  userToSafeJSON,
  listResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
};
