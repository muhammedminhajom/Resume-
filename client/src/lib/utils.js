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
    projects: ensureListIds(resume.projects).map((p) => {
      let bullets = p.bullets;
      if (!bullets || !bullets.length) {
        bullets = p.description ? [p.description] : [''];
      }
      return { ...p, bullets };
    }),
    leadership: ensureListIds(resume.leadership).map((l) => ({
      ...l,
      bullets: l.bullets && l.bullets.length ? l.bullets : [''],
    })),
    certifications: ensureListIds(resume.certifications),
    languages: ensureListIds(resume.languages),
  };
}

export function itemKey(item, index) {
  return item._id || item._key || item.id || index;
}