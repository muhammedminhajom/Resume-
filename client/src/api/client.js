const BASE = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('resume_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('resume_token', token);
  else localStorage.removeItem('resume_token');
}

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function handleJson(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function request(method, path, body) {
  const options = {
    method,
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
  };
  if (body !== undefined) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, options);
  return handleJson(res);
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
  getAtsScore: (id, jobDescription) => request('POST', `/resumes/${id}/ats-score`, { jobDescription }),
  getRawAtsScore: (resumeText, jobDescription) => request('POST', '/resumes/raw/ats-score', { resumeText, jobDescription }),
  compareJobMatch: (payload) => request('POST', '/resumes/job-match', payload),

  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/resumes/parse-upload`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: formData,
    });
    return handleJson(res);
  },

  async exportPdf(id) {
    const res = await fetch(`${BASE}/resumes/${id}/export`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'PDF export failed.');
    }
    return res.blob();
  },

  async exportDocx(id) {
    const res = await fetch(`${BASE}/resumes/${id}/export-docx`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'DOCX export failed.');
    }
    return res.blob();
  },
};

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}