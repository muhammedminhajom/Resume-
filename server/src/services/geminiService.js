const https = require('https');

// Fallback chain for Google AI Studio models (fastest and most reliable first)
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.6-flash'
];

/**
 * Execute request using IPv4 (family: 4) to prevent Windows DNS/IPv6 hangs
 */
function requestIPv4(urlStr, postData) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      family: 4,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(12000, () => {
      req.destroy(new Error('Gemini API request timed out (12s)'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Call Gemini API with automatic model fallback and optional JSON enforcement
 */
async function callGemini(prompt, systemInstruction = '', options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const generationConfig = {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    };

    if (options.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const res = await requestIPv4(url, JSON.stringify(payload));
      
      if (res.status === 200) {
        const text = res.body?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }

      const errMsg = res.body?.error?.message || `HTTP ${res.status}`;
      lastError = new Error(`Gemini [${model}] error: ${errMsg}`);
      console.warn(`[gemini] model ${model} failed (${res.status}): ${errMsg}. Trying next model...`);
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] network call failed for ${model}:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}

function parseJsonSafely(rawText) {
  if (!rawText) throw new Error('Empty model output');
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // If markdown wrapped
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]);
    }
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first !== -1 && last > first) {
      return JSON.parse(trimmed.slice(first, last + 1));
    }
    throw new Error('Could not parse valid JSON from AI response');
  }
}

/**
 * Intelligent Job Description & Resume Matcher powered by Gemini AI
 * Real extraction & role expansion (even for 2-word JDs like "ai engineer")
 */
async function compareJobMatchAI({ resumeText, skills = [], jobDescription }) {
  const systemInstruction = `You are a Principal ATS Architect and Senior Technical Recruiter.
Your objective is to deliver an in-depth, rigorous, and intelligent semantic comparison between a Candidate's Resume and a Target Job Description.

EVALUATION RULES:
1. EXPAND BRIEF / UNDERSPECIFIED JDs:
- Job descriptions can be minimal (e.g. just a title like "AI engineer", "frontend developer", "data scientist", or a short phrase).
- NEVER perform a shallow literal word match. You MUST NOT simply check if the word "ai" or "engineer" exists in the resume and call it 100%.
- Automatically expand concise titles to the established industry standard requirements, skills, toolchains, frameworks, and engineering competencies for that profession.
- Example: For "AI Engineer", the industry expects competencies across:
  * Core languages & data: Python, SQL, NumPy, Pandas, Data Preprocessing
  * Machine Learning & Deep Learning: ML algorithms, PyTorch, TensorFlow, Scikit-learn
  * GenAI / LLM Engineering: LLMs, Gemini API / OpenAI API, Prompt Engineering, RAG, LangChain/LlamaIndex, Vector Databases (Pinecone, Chroma, FAISS)
  * Computer Vision / NLP: OpenCV, Transformers, Hugging Face
  * Deployment & MLOps: Model serving (FastAPI, Flask), Docker, CI/CD, Cloud (GCP/AWS/Azure), Git, monitoring

2. COMPREHENSIVE SEMANTIC RESUME ANALYSIS:
- Scrutinize the candidate's skills list, professional summary, work experience bullets, projects, and education.
- Credit semantic equivalents: if the resume details building computer vision models or integrating the Gemini API in Python, recognize those as proven competencies in AI engineering.
- "matchedKeywords": List specific, verified technologies, tools, and technical skills that the candidate possesses which align with the target role.
- "missingKeywords": List essential or standard technologies, tools, and frameworks for this role that are MISSING or insufficiently proven in the resume. For brief/underspecified JDs, ALWAYS identify a realistic list of expected industry skills that are absent (e.g., PyTorch, TensorFlow, Deep Learning, MLOps, Docker, etc.). NEVER return an empty or near-zero missing list for an underspecified job title.

3. ACCURATE MATCH SCORING (CALIBRATED & OBJECTIVE):
- "matchPercentage" (0 - 100):
  * 85 - 100%: Rare; candidate demonstrates deep, verified expertise across almost all core and specialized requirements.
  * 60 - 84%: Strong foundational match with notable gaps in specific frameworks, tools, or production scale.
  * 35 - 59%: Emerging match; candidate has basic programming or adjacent skills (e.g. general software engineer with some ML tools), but lacks core production frameworks.
  * 0 - 34%: Weak or unrelated match.
- A candidate who has Python, React, Computer Vision, and Gemini API, but lacks PyTorch, TensorFlow, MLOps, and model deployment should receive a realistic score (e.g., around 55% - 70%), NOT a flat 100%.

4. ACTIONABLE SUGGESTIONS:
- 3 to 5 high-impact, specific recommendations on what skills or projects to add to the resume to maximize ATS match score.

Respond ONLY with valid JSON conforming to:
{
  "matchPercentage": number,
  "summary": string,
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "suggestions": string[]
}`;

  const prompt = `CANDIDATE RESUME:
${resumeText || 'Skills listed: ' + skills.join(', ')}

TARGET JOB DESCRIPTION / ROLE:
${jobDescription}`;

  try {
    const rawOutput = await callGemini(prompt, systemInstruction, {
      jsonMode: true,
      temperature: 0.2,
      maxOutputTokens: 2048,
    });

    const result = parseJsonSafely(rawOutput);

    return {
      success: true,
      matchPercentage: Math.min(100, Math.max(0, Math.round(Number(result.matchPercentage) || 0))),
      summary: result.summary || '',
      matchedKeywords: Array.isArray(result.matchedKeywords) ? result.matchedKeywords : [],
      missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      source: 'gemini-ai'
    };
  } catch (err) {
    console.error('[geminiService] AI job match failed, falling back to deterministic scanner:', err.message);
    return null;
  }
}

module.exports = {
  callGemini,
  compareJobMatchAI
};
