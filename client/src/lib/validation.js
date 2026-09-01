export function validateEmail(email) {
  if (!email) return true; // optional field
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  if (!phone) return true; // optional field
  const re = /^[\d\s\-\(\)\+]{10,}$/;
  return re.test(phone);
}

export function validateDateOrder(start, end) {
  if (!start || !end) return true;
  if (end.toLowerCase() === 'present') return true;
  const startYear = parseInt(start, 10);
  const endYear = parseInt(end, 10);
  if (isNaN(startYear) || isNaN(endYear)) return true;
  return startYear <= endYear;
}

export function validatePersonalInfo(personalInfo) {
  const errors = {};
  if (!personalInfo?.name?.trim()) {
    errors.name = 'Full name is required.';
  }
  if (!personalInfo?.email?.trim()) {
    errors.email = 'Email is required.';
  } else if (!validateEmail(personalInfo.email)) {
    errors.email = 'Invalid email format.';
  }
  if (personalInfo?.phone && !validatePhone(personalInfo.phone)) {
    errors.phone = 'Invalid phone number format.';
  }
  return errors;
}

export function validateEducation(education) {
  if (!education?.length) return [];
  return education.map((e, i) => {
    const errors = {};
    if (!e.institution?.trim()) {
      errors.institution = 'Institution is required.';
    }
    if (!e.degree?.trim()) {
      errors.degree = 'Degree is required.';
    }
    if (!e.field?.trim()) {
      errors.field = 'Field of study is required.';
    }
    if (!validateDateOrder(e.start_date, e.end_date)) {
      errors.end_date = 'End date must be after start date.';
    }
    return { index: i, errors: Object.keys(errors).length ? errors : null };
  }).filter((r) => r.errors);
}

export function validateExperience(experience) {
  if (!experience?.length) return [];
  return experience.map((e, i) => {
    const errors = {};
    if (!e.role?.trim()) {
      errors.role = 'Job title is required.';
    }
    if (!e.company?.trim()) {
      errors.company = 'Company is required.';
    }
    if (!e.bullets?.some((b) => b?.trim())) {
      errors.bullets = 'At least one bullet point is required.';
    }
    if (!validateDateOrder(e.start_date, e.end_date)) {
      errors.end_date = 'End date must be after start date.';
    }
    return { index: i, errors: Object.keys(errors).length ? errors : null };
  }).filter((r) => r.errors);
}

export function validateProjects(projects) {
  if (!projects?.length) return [];
  return projects.map((p, i) => {
    const errors = {};
    if (!p.title?.trim()) {
      errors.title = 'Project title is required.';
    }
    if (!p.description?.trim()) {
      errors.description = 'Description is required.';
    }
    return { index: i, errors: Object.keys(errors).length ? errors : null };
  }).filter((r) => r.errors);
}

export function validateCertifications(certifications) {
  if (!certifications?.length) return [];
  return certifications.map((c, i) => {
    const errors = {};
    if (!c.name?.trim()) {
      errors.name = 'Certification name is required.';
    }
    if (!c.issuer?.trim()) {
      errors.issuer = 'Issuer is required.';
    }
    return { index: i, errors: Object.keys(errors).length ? errors : null };
  }).filter((r) => r.errors);
}

export function validateSection(resume, sectionKey) {
  switch (sectionKey) {
    case 'personal_info':
      return validatePersonalInfo(resume.personal_info);
    case 'education':
      return validateEducation(resume.education);
    case 'experience':
      return validateExperience(resume.experience);
    case 'skills':
      return {};
    case 'projects':
      return validateProjects(resume.projects);
    case 'certifications':
      return validateCertifications(resume.certifications);
    default:
      return {};
  }
}

export function isSectionValid(resume, sectionKey) {
  const errors = validateSection(resume, sectionKey);
  return Object.keys(errors).length === 0;
}