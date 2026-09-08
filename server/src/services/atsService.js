// ATS Scoring Service - Deterministic Rule-Based Evaluation Engine

const ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'acquired', 'adapted', 'administered', 'advised',
  'analyzed', 'architected', 'assessed', 'authored', 'automated', 'built',
  'calculated', 'centralized', 'championed', 'clarified', 'coached', 'collaborated',
  'collected', 'compiled', 'completed', 'conceived', 'conducted', 'configured',
  'constructed', 'consolidated', 'converted', 'coordinated', 'crafted', 'created',
  'customized', 'debugged', 'decreased', 'defined', 'delivered', 'deployed',
  'designed', 'developed', 'devised', 'directed', 'discovered', 'documented',
  'drafted', 'drove', 'eliminated', 'engineered', 'enhanced', 'established',
  'evaluated', 'executed', 'expanded', 'expedited', 'facilitated', 'formulated',
  'generated', 'guided', 'handled', 'headed', 'identified', 'implemented',
  'improved', 'increased', 'initiated', 'innovated', 'inspected', 'installed',
  'integrated', 'introduced', 'investigated', 'launched', 'led', 'maintained',
  'managed', 'mapped', 'mastered', 'maximized', 'mediated', 'mentored',
  'migrated', 'minimized', 'modernized', 'monitored', 'negotiated', 'operated',
  'optimized', 'orchestrated', 'organized', 'overhauled', 'oversaw', 'performed',
  'pioneered', 'planned', 'prepared', 'produced', 'programmed', 'promoted',
  'published', 'purchased', 'quantified', 'rebuilt', 'redesigned', 'reduced',
  'refactored', 'regulated', 'remodeled', 'reorganized', 'researched', 'resolved',
  'restructured', 'revamped', 'reviewed', 'revised', 'scaled', 'scheduled',
  'secured', 'selected', 'simplified', 'solved', 'spearheaded', 'standardized',
  'streamlined', 'strengthened', 'structured', 'supervised', 'supported', 'surpassed',
  'systematized', 'targeted', 'trained', 'transformed', 'unified', 'updated',
  'upgraded', 'validated', 'verified'
]);

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let\'s', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'looking', 'seeking', 'role',
  'candidate', 'team', 'experience', 'work', 'working', 'ability', 'must', 'plus',
  'preferred', 'required', 'responsibilities', 'qualifications', 'requirements',
  'skills', 'years', 'opportunity', 'strong', 'ideal', 'include', 'includes'
]);

const METRIC_REGEX = /(?:\b\d+(?:[\.,]\d+)?\s*(?:%|percent|k|m|b|x|users|clients|customers|ms|sec|hours|days|weeks|months|years|pts|points|usd|eur|gbp)\b|\$[\d,]+|\b\d+\b)/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractFirstWord(sentence) {
  const match = String(sentence || '').trim().match(/^([a-zA-Z]+)/);
  return match ? match[1].toLowerCase() : '';
}

function analyzeResume(resume, jobDescription = '') {
  const plain = resume.toObject ? resume.toObject() : resume;
  const p = plain.personal_info || {};
  const exp = plain.experience || [];
  const edu = plain.education || [];
  const skills = plain.skills || [];
  const certs = plain.certifications || [];
  const projects = plain.projects || [];

  const checks = [];

  // 1. Standard Section Headers Present (15 pts)
  const requiredSections = [
    { name: 'Work Experience', present: exp.length > 0 },
    { name: 'Education', present: edu.length > 0 },
    { name: 'Skills', present: skills.length > 0 },
    { name: 'Professional Summary', present: Boolean(p.summary?.trim()) },
  ];
  const missingRequired = requiredSections.filter((s) => !s.present).map((s) => s.name);
  const sectionScore = Math.max(0, 15 - missingRequired.length * 4);
  checks.push({
    id: 'section_headers',
    label: 'Standard Section Headers',
    category: 'Structure',
    passed: missingRequired.length === 0,
    score: sectionScore,
    maxScore: 15,
    details: missingRequired.length === 0
      ? 'All essential ATS sections (Summary, Experience, Skills, Education) are populated with exact standard headers.'
      : `Missing or empty sections: ${missingRequired.join(', ')}.`,
    suggestion: missingRequired.length > 0
      ? `Populate missing sections (${missingRequired.join(', ')}) using exact standard titles for seamless ATS parsing.`
      : null,
  });

  // 2. Complete Contact Information (15 pts)
  const hasName = Boolean(p.name?.trim());
  const hasEmail = Boolean(p.email?.trim() && EMAIL_REGEX.test(p.email.trim()));
  const hasPhone = Boolean(p.phone?.trim());
  const hasLocation = Boolean(p.location?.trim());
  const missingContact = [];
  if (!hasName) missingContact.push('Full Name');
  if (!hasEmail) missingContact.push('Valid Email');
  if (!hasPhone) missingContact.push('Phone Number');
  if (!hasLocation) missingContact.push('Location (City, State)');

  const contactScore = Math.max(0, 15 - missingContact.length * 4);
  checks.push({
    id: 'contact_info',
    label: 'Complete In-Body Contact Information',
    category: 'Contact',
    passed: missingContact.length === 0,
    score: contactScore,
    maxScore: 15,
    details: missingContact.length === 0
      ? 'Contact block contains complete candidate name, email, phone, and location.'
      : `Missing contact details: ${missingContact.join(', ')}.`,
    suggestion: missingContact.length > 0
      ? `Ensure your top in-body block includes ${missingContact.join(', ')}.`
      : null,
  });

  // 3. Bullet Points in Experience (15 pts)
  let allHaveBullets = exp.length > 0;
  let totalBullets = 0;
  const allBulletTexts = [];

  for (const role of exp) {
    const validBullets = (role.bullets || []).filter((b) => String(b).trim().length > 0);
    if (validBullets.length === 0) {
      allHaveBullets = false;
    }
    totalBullets += validBullets.length;
    allBulletTexts.push(...validBullets);
  }

  const bulletScore = exp.length === 0 ? 0 : allHaveBullets ? 15 : 7;
  checks.push({
    id: 'bullet_points',
    label: 'Bullet Points in Experience',
    category: 'Formatting',
    passed: exp.length > 0 && allHaveBullets,
    score: bulletScore,
    maxScore: 15,
    details: exp.length === 0
      ? 'No work experience entries added yet.'
      : allHaveBullets
      ? `All ${exp.length} experience roles use structured bullet points (${totalBullets} bullets total).`
      : 'One or more experience entries have no bullet points.',
    suggestion: (!allHaveBullets || exp.length === 0)
      ? 'Format all work experience roles as concise bullet points rather than paragraph text.'
      : null,
  });

  // 4. Action Verbs in Bullet Points (15 pts)
  let actionVerbCount = 0;
  for (const b of allBulletTexts) {
    const first = extractFirstWord(b);
    if (ACTION_VERBS.has(first)) {
      actionVerbCount++;
    }
  }

  const actionVerbPct = totalBullets > 0 ? (actionVerbCount / totalBullets) : 0;
  let actionVerbScore = 0;
  if (actionVerbPct >= 0.7) actionVerbScore = 15;
  else if (actionVerbPct >= 0.4) actionVerbScore = 10;
  else if (actionVerbPct > 0) actionVerbScore = 5;

  checks.push({
    id: 'action_verbs',
    label: 'Action Verbs in Experience Bullets',
    category: 'Impact',
    passed: actionVerbPct >= 0.6,
    score: actionVerbScore,
    maxScore: 15,
    details: totalBullets === 0
      ? 'No experience bullets to evaluate.'
      : `${actionVerbCount} of ${totalBullets} bullets (${Math.round(actionVerbPct * 100)}%) start with strong action verbs.`,
    suggestion: actionVerbPct < 0.6
      ? 'Begin each bullet with strong action verbs (e.g., "Architected", "Engineered", "Optimized", "Spearheaded", "Reduced").'
      : null,
  });

  // 5. Quantified Achievements (15 pts)
  let quantifiedCount = 0;
  for (const b of allBulletTexts) {
    if (METRIC_REGEX.test(b)) {
      quantifiedCount++;
    }
  }

  const quantifiedPct = totalBullets > 0 ? (quantifiedCount / totalBullets) : 0;
  let quantScore = 0;
  if (quantifiedPct >= 0.5) quantScore = 15;
  else if (quantifiedPct >= 0.25) quantScore = 10;
  else if (quantifiedCount >= 1) quantScore = 6;

  checks.push({
    id: 'quantified_metrics',
    label: 'Quantified Measurable Achievements',
    category: 'Impact',
    passed: quantifiedPct >= 0.4,
    score: quantScore,
    maxScore: 15,
    details: totalBullets === 0
      ? 'No experience bullets to evaluate.'
      : `${quantifiedCount} of ${totalBullets} bullets (${Math.round(quantifiedPct * 100)}%) contain quantified metrics (%, $, numbers, multipliers).`,
    suggestion: quantifiedPct < 0.4
      ? 'Add quantifiable metrics and measurable impact to your bullets (e.g. "increased speed by 40%", "managed 10k+ users", "cut costs by $15k").'
      : null,
  });

  // 6. ATS-Safe Single Column Structure (10 pts)
  // Our generator enforces single column, plain standard fonts, and in-body contact
  checks.push({
    id: 'ats_structure',
    label: 'Single-Column Clean ATS Layout',
    category: 'Structure',
    passed: true,
    score: 10,
    maxScore: 10,
    details: 'Layout is single-column, free of tables, text boxes, floating columns, and decorative graphics.',
    suggestion: null,
  });

  // 7. Skills Keyword Count (10 pts)
  const validSkills = skills.filter((s) => String(s).trim().length > 0);
  let skillScore = 0;
  if (validSkills.length >= 8) skillScore = 10;
  else if (validSkills.length >= 5) skillScore = 8;
  else if (validSkills.length >= 3) skillScore = 5;
  else skillScore = 2;

  checks.push({
    id: 'skills_count',
    label: 'Skills Keyword Density (5+ skills)',
    category: 'Keywords',
    passed: validSkills.length >= 5,
    score: skillScore,
    maxScore: 10,
    details: validSkills.length >= 5
      ? `Skills section contains ${validSkills.length} keywords.`
      : `Skills section only contains ${validSkills.length} keyword(s) (recommended: 5+).`,
    suggestion: validSkills.length < 5
      ? 'Add at least 5-10 core technical and domain skills to match automated ATS job filters.'
      : null,
  });

  // 8. Reasonable Length & Density (5 pts)
  const overloadedRoles = exp.filter((r) => (r.bullets || []).filter(Boolean).length > 6);
  const isOverloaded = overloadedRoles.length > 0;
  const isEmpty = exp.length === 0 && edu.length === 0 && skills.length === 0;

  checks.push({
    id: 'length_and_density',
    label: 'Resume Length & Bullet Balance',
    category: 'Formatting',
    passed: !isOverloaded && !isEmpty,
    score: (!isOverloaded && !isEmpty) ? 5 : (isOverloaded ? 2 : 0),
    maxScore: 5,
    details: isOverloaded
      ? `${overloadedRoles.length} role(s) have more than 6 bullet points, which can lower readability.`
      : isEmpty
      ? 'Resume is currently empty.'
      : 'Bullet distribution per role is well balanced (<= 6 bullets per role).',
    suggestion: isOverloaded
      ? 'Limit each experience entry to 4-6 high-impact bullet points to maintain scannability.'
      : null,
  });

  // Calculate overall score 0-100
  const totalScore = Math.min(
    100,
    Math.round(checks.reduce((acc, c) => acc + c.score, 0))
  );

  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length;

  // Optional: Job Description Comparison
  let jobMatch = null;
  let missingKeywords = [];

  const ROLE_SKILL_EXPANSIONS = {
    'ai': ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'nlp', 'computer vision', 'data preprocessing', 'model deployment', 'docker'],
    'ai engineer': ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'natural language processing', 'computer vision', 'large language models', 'transformers', 'mlops', 'docker', 'model deployment', 'fastapi', 'data pipelines'],
    'artificial intelligence': ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'neural networks', 'nlp', 'computer vision', 'algorithms'],
    'machine learning': ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'model deployment', 'mlops', 'docker'],
    'ml engineer': ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'model deployment', 'mlops', 'docker'],
    'data scientist': ['python', 'r', 'sql', 'statistics', 'machine learning', 'data analysis', 'pandas', 'numpy', 'data visualization', 'scikit-learn'],
    'data engineer': ['python', 'sql', 'etl', 'data pipelines', 'spark', 'hadoop', 'kafka', 'airflow', 'data warehousing', 'cloud databases'],
    'frontend': ['javascript', 'typescript', 'react', 'html', 'css', 'tailwind', 'responsive design', 'next.js', 'rest api', 'testing'],
    'frontend developer': ['javascript', 'typescript', 'react', 'html', 'css', 'tailwind', 'responsive design', 'next.js', 'rest api', 'testing'],
    'backend': ['node.js', 'python', 'java', 'sql', 'nosql', 'rest api', 'microservices', 'docker', 'database design', 'ci/cd'],
    'backend developer': ['node.js', 'python', 'java', 'sql', 'nosql', 'rest api', 'microservices', 'docker', 'database design', 'ci/cd'],
    'full stack': ['javascript', 'typescript', 'react', 'node.js', 'html', 'css', 'sql', 'nosql', 'rest api', 'git', 'docker'],
    'full stack developer': ['javascript', 'typescript', 'react', 'node.js', 'html', 'css', 'sql', 'nosql', 'rest api', 'git', 'docker'],
    'devops': ['linux', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'aws', 'cloud infrastructure', 'monitoring', 'bash', 'git'],
    'devops engineer': ['linux', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'aws', 'cloud infrastructure', 'monitoring', 'bash', 'git'],
    'software engineer': ['python', 'javascript', 'git', 'system design', 'unit testing', 'ci/cd', 'sql', 'data structures', 'algorithms']
  };

  if (jobDescription && typeof jobDescription === 'string' && jobDescription.trim().length >= 2) {
    const rawJd = jobDescription.trim().toLowerCase();
    const jdTokens = rawJd
      .replace(/[^a-z0-9+#.\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !STOPWORDS.has(w));

    // Extract frequency of words
    const freq = {};
    for (const t of jdTokens) {
      freq[t] = (freq[t] || 0) + 1;
    }

    let topJdKeywords = Object.keys(freq)
      .sort((a, b) => freq[b] - freq[a])
      .slice(0, 25);

    // If JD is short or underspecified, enrich with role skill expansions
    const matchedRoleKey = Object.keys(ROLE_SKILL_EXPANSIONS).find(
      (role) => rawJd === role || rawJd.includes(role)
    );
    if (matchedRoleKey || topJdKeywords.length < 5) {
      const expansion = ROLE_SKILL_EXPANSIONS[matchedRoleKey] || (rawJd.includes('ai') || rawJd.includes('ml') ? ROLE_SKILL_EXPANSIONS['ai engineer'] : []);
      if (expansion.length > 0) {
        topJdKeywords = Array.from(new Set([...topJdKeywords, ...expansion]));
      }
    }

    // Build resume text haystack
    const resumeHaystack = [
      p.headline,
      p.summary,
      ...skills,
      ...allBulletTexts,
      ...projects.map((pr) => `${pr.title} ${pr.description || ''} ${(pr.bullets || []).join(' ')} ${(pr.tech || []).join(' ')}`),
      ...(plain.leadership || []).map((l) => `${l.role || ''} ${l.organization || ''} ${(l.bullets || []).join(' ')}`),
      ...certs.map((c) => `${c.name} ${c.issuer}`),
      ...edu.map((e) => `${e.institution} ${e.degree} ${e.field}`),
      ...(plain.languages || []).map((l) =>
        typeof l === 'string' ? l : `${l.language || ''} ${l.proficiency || ''}`
      ),
    ]
      .join(' ')
      .toLowerCase();

    const matchedKeywords = [];
    const missing = [];

    for (const kw of topJdKeywords) {
      if (resumeHaystack.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      } else {
        missing.push(kw);
      }
    }

    const matchScore = topJdKeywords.length > 0
      ? Math.round((matchedKeywords.length / topJdKeywords.length) * 100)
      : 100;

    missingKeywords = missing;
    jobMatch = {
      matchScore,
      matchedKeywords,
      missingKeywords: missing,
      jdAnalyzed: true,
      totalKeywordsChecked: topJdKeywords.length,
    };
  }

  return {
    score: totalScore,
    summary: {
      passedCount,
      totalCount,
      rating: totalScore >= 80 ? 'ATS Ready' : totalScore >= 60 ? 'Needs Improvement' : 'At Risk',
    },
    checks,
    missingKeywords,
    jobMatch,
  };
}

function parseRawResumeText(text = '') {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const result = {
    personal_info: { name: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    skills: [],
    education: [],
    certifications: [],
    projects: [],
    leadership: [],
    languages: [],
  };

  if (lines.length === 0) return result;

  const fullText = String(text);
  const emailMatch = fullText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) result.personal_info.email = emailMatch[1];

  const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) result.personal_info.phone = phoneMatch[0];

  if (lines[0] && lines[0].length < 60 && !lines[0].includes('@')) {
    result.personal_info.name = lines[0];
  }

  let currentSection = 'summary';
  const sectionHeaders = {
    summary: /^(?:professional\s+)?summary|profile|about(?:\s+me)?$/i,
    experience: /^(?:work\s+)?experience|employment|work\s+history$/i,
    skills: /^(?:technical\s+)?skills|technologies|competencies$/i,
    education: /^education|academic(?:\s+background)?$/i,
    certifications: /^certifications?|licenses?$/i,
    projects: /^projects?|personal\s+projects$/i,
    leadership: /^(?:leadership|activities|leadership\s*(?:&|and)\s*activities)$/i,
    languages: /^languages?|languages?\s+spoken$/i,
  };

  let currentExp = null;
  const rawSkills = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let matchedSection = null;

    for (const [sec, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line.replace(/[:\-#*]/g, '').trim())) {
        matchedSection = sec;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      if (currentSection === 'experience' && !currentExp) {
        currentExp = { role: 'Software Engineer', company: 'Company', bullets: [] };
        result.experience.push(currentExp);
      }
      continue;
    }

    if (currentSection === 'summary') {
      if (!result.personal_info.summary) result.personal_info.summary = line;
      else result.personal_info.summary += ' ' + line;
    } else if (currentSection === 'experience') {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        if (!currentExp) {
          currentExp = { role: 'Professional', company: 'Company', bullets: [] };
          result.experience.push(currentExp);
        }
        currentExp.bullets.push(line.replace(/^[•\-*]\s*/, '').trim());
      } else if (currentExp && currentExp.bullets.length > 0 && line.length < 50) {
        currentExp = { role: line, company: 'Company', bullets: [] };
        result.experience.push(currentExp);
      } else {
        if (!currentExp) {
          currentExp = { role: line, company: 'Company', bullets: [] };
          result.experience.push(currentExp);
        } else {
          currentExp.bullets.push(line);
        }
      }
    } else if (currentSection === 'skills') {
      const items = line.split(/[,•|·/]/).map((s) => s.trim()).filter(Boolean);
      rawSkills.push(...items);
    } else if (currentSection === 'education') {
      result.education.push({ institution: line, degree: 'Degree' });
    } else if (currentSection === 'projects') {
      result.projects.push({ title: line, description: '' });
    } else if (currentSection === 'certifications') {
      result.certifications.push({ name: line });
    } else if (currentSection === 'languages') {
      const items = line.split(/[,•|·/]/).map((s) => s.trim()).filter(Boolean);
      for (const it of items) {
        const parts = it.split(/[—–-]/).map((p) => p.trim()).filter(Boolean);
        result.languages.push({
          language: parts[0] || it,
          proficiency: parts[1] || '',
        });
      }
    }
  }

  result.skills = Array.from(new Set(rawSkills.filter((s) => s.length > 1 && s.length < 40)));
  return result;
}

module.exports = { analyzeResume, parseRawResumeText, ACTION_VERBS };
