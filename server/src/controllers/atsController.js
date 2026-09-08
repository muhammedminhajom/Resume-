const { getResumeById } = require('../services/dbService');
const { analyzeResume, parseRawResumeText } = require('../services/atsService');
const { compareJobMatchAI } = require('../services/geminiService');

async function calculateAtsScore(req, res, next) {
  try {
    const resume = await getResumeById(req.params.id, req.user.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    const { jobDescription } = req.body || {};
    const result = analyzeResume(resume, jobDescription);

    return res.json(result);
  } catch (err) {
    console.error('[ats-scoring] error:', err.message);
    return next(err);
  }
}

async function calculateRawAtsScore(req, res, next) {
  try {
    const { resumeText, jobDescription } = req.body || {};
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ message: 'Please provide resume text to analyze.' });
    }

    const parsedResume = parseRawResumeText(resumeText);
    const result = analyzeResume(parsedResume, jobDescription);

    return res.json(result);
  } catch (err) {
    console.error('[raw-ats-scoring] error:', err.message);
    return next(err);
  }
}

async function compareJobMatch(req, res, next) {
  try {
    const { resumeId, resumeText, jobDescription } = req.body || {};
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ message: 'Job description is required for matching.' });
    }

    let candidateText = resumeText || '';
    let skillsList = [];

    if (resumeId) {
      const resume = await getResumeById(resumeId, req.user.id);
      if (resume) {
        skillsList = resume.skills || [];
        const expText = (resume.experience || [])
          .map(
            (e) =>
              `${e.role || 'Role'} at ${e.company || 'Company'} (${e.start_date || ''} - ${e.end_date || ''}):\n${(e.bullets || []).map((b) => `- ${b}`).join('\n')}`
          )
          .join('\n\n');

        const projText = (resume.projects || [])
          .map(
            (p) =>
              `${p.title || 'Project'} (Technologies: ${(p.tech || []).join(', ')}):\n${p.description || ''}${(p.bullets || []).length ? '\n' + p.bullets.map((b) => `- ${b}`).join('\n') : ''}`
          )
          .join('\n\n');

        const certsText = (resume.certifications || [])
          .map((c) => `${c.name || ''} ${c.issuer ? `(${c.issuer})` : ''}`)
          .join(', ');

        const eduText = (resume.education || [])
          .map((ed) => `${ed.degree || ''} in ${ed.field || ''} from ${ed.institution || ed.school || ''}`)
          .join('; ');

        candidateText = [
          `Candidate Name: ${resume.personal_info?.name || ''}`,
          resume.personal_info?.headline ? `Headline: ${resume.personal_info.headline}` : '',
          resume.personal_info?.summary ? `Professional Summary: ${resume.personal_info.summary}` : '',
          skillsList.length ? `Skills: ${skillsList.join(', ')}` : '',
          expText ? `Work Experience:\n${expText}` : '',
          projText ? `Projects:\n${projText}` : '',
          certsText ? `Certifications: ${certsText}` : '',
          eduText ? `Education: ${eduText}` : '',
        ]
          .filter(Boolean)
          .join('\n\n');
      }
    }

    if (!candidateText.trim() && skillsList.length === 0) {
      return res.status(400).json({ message: 'No resume content provided to compare.' });
    }

    // Attempt intelligent AI matching with Gemini first
    const aiResult = await compareJobMatchAI({
      resumeText: candidateText,
      skills: skillsList,
      jobDescription,
    });

    if (aiResult && aiResult.success) {
      return res.json(aiResult);
    }

    // Deterministic fallback matching if AI is unavailable
    const parsed = parseRawResumeText(candidateText);
    if (skillsList.length > 0) {
      parsed.skills = Array.from(new Set([...(parsed.skills || []), ...skillsList]));
    }
    const fallback = analyzeResume(parsed, jobDescription);

    return res.json({
      success: true,
      matchPercentage: fallback.jobMatch?.matchScore || 50,
      summary: 'Deterministic keyword comparison against job description.',
      matchedKeywords: fallback.jobMatch?.matchedKeywords || [],
      missingKeywords: fallback.jobMatch?.missingKeywords || [],
      suggestions: fallback.checks
        .filter((c) => !c.passed && c.suggestion)
        .map((c) => c.suggestion),
      source: 'deterministic-engine',
    });
  } catch (err) {
    console.error('[job-match] error:', err.message);
    return next(err);
  }
}

module.exports = {
  calculateAtsScore,
  calculateRawAtsScore,
  compareJobMatch,
};
