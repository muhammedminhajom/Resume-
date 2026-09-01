export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function ensureListIds(list) {
  return (list || []).map((item) => {
    if (item._id) return item;
    if (item._key) return { ...item, _id: item._key };
    return { _key: uid(), ...item };
  });
}

export function normalizeResume(resume) {
  return {
    ...resume,
    education: ensureListIds(resume.education),
    experience: ensureListIds(resume.experience),
    projects: ensureListIds(resume.projects),
    certifications: ensureListIds(resume.certifications),
  };
}

export function itemKey(item, index) {
  return item._id || item._key || item.id || index;
}