const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    field: { type: String, default: '' },
    start_date: { type: String, default: '' },
    end_date: { type: String, default: '' },
    gpa: { type: String, default: '' },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    start_date: { type: String, default: '' },
    end_date: { type: String, default: '' },
    bullets: { type: [String], default: [] },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    tech: { type: [String], default: [] },
    link: { type: String, default: '' },
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
  },
  { _id: true }
);

const DEFAULT_SECTION_ORDER = [
  'personal_info',
  'education',
  'experience',
  'skills',
  'projects',
  'certifications',
];

const resumeSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled Resume' },
    template: { type: String, enum: ['modern', 'classic', 'minimal'], default: 'modern' },
    personal_info: {
      name: { type: String, default: '' },
      headline: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      summary: { type: String, default: '' },
      links: { type: [String], default: [] },
    },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    skills: { type: [String], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    section_order: { type: [String], default: DEFAULT_SECTION_ORDER },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Resume', resumeSchema);
module.exports.DEFAULT_SECTION_ORDER = DEFAULT_SECTION_ORDER;