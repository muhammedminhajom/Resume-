const { sanitizeHtml } = require('../lib/sanitize');

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert resume writer. Rewrite the user's rough bullet point for a resume so it is:
- action-oriented and starts with a strong verb
- quantified where plausible
- concise (under 25 words)
- professional and ATS-friendly
Return ONLY the rewritten bullet point, with no quotes or extra text.`;

function buildPrompt(jobTitle, bullet) {
  return `Job title: ${jobTitle || 'N/A'}
Rough bullet: ${bullet || 'N/A'}

Rewrite the rough bullet into a polished resume bullet point.`;
}

async function callGemini(prompt) {
  const url = `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 128 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error (${res.status})`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return text.trim();
}

async function callOpenAI(prompt) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 128,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error (${res.status})`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned an empty response.');
  return text.trim();
}

async function suggestBullet(req, res, next) {
  try {
    const { jobTitle, bullet } = req.body;
    if (!bullet || typeof bullet !== 'string') {
      return res.status(400).json({ message: 'A bullet point is required.' });
    }

    const cleanJobTitle = sanitizeHtml(jobTitle || '');
    const cleanBullet = sanitizeHtml(bullet);

    const prompt = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(cleanJobTitle, cleanBullet) },
    ]
      .map((m) => m.content)
      .join('\n\n');

    let suggestion;
    if (process.env.GEMINI_API_KEY) {
      suggestion = await callGemini(prompt);
    } else if (process.env.OPENAI_API_KEY) {
      suggestion = await callOpenAI(prompt);
    } else {
      return res.status(503).json({
        message: 'AI suggestions are not configured. Set GEMINI_API_KEY or OPENAI_API_KEY on the server.',
      });
    }

    return res.json({ suggestion });
  } catch (err) {
    console.error('[ai] failed:', err.message);
    return next(err);
  }
}

module.exports = { suggestBullet };