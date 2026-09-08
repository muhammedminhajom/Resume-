import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import MiniPreview from '../preview/MiniPreview';
import Modal from '../ui/Modal';

const OPTIONS = [
  { id: 'Arial', label: 'Arial', description: 'Clean universal ATS sans-serif' },
  { id: 'Calibri', label: 'Calibri', description: 'Modern professional ATS sans-serif' },
  { id: 'Times New Roman', label: 'Times New Roman', description: 'Standard formal ATS serif' },
  { id: 'Georgia', label: 'Georgia', description: 'Elegant readable ATS serif' },
];

export default function TemplateSwitcher({ compact = false }) {
  const { resume, setSection } = useResume();
  const [open, setOpen] = useState(false);
  const active = resume.font || resume.template || 'Arial';

  if (compact) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-2.5">
          {OPTIONS.map((opt) => {
            const isActive = active === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setSection('font', opt.id);
                  setSection('template', opt.id);
                }}
                aria-pressed={isActive}
                className={`flex items-center justify-between rounded-button border px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/15'
                    : 'border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                }`}
              >
                {opt.label}
                {isActive && (
                  <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <button onClick={() => setOpen(true)} className="btn-secondary mt-3 w-full text-xs">
          Browse ATS fonts
        </button>
        <TemplateModal
          open={open}
          onClose={() => setOpen(false)}
          active={active}
          onChange={(id) => {
            setSection('font', id);
            setSection('template', id);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary w-full justify-center text-xs"
        aria-haspopup="dialog"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
        ATS Font
      </button>
      <TemplateModal
        open={open}
        onClose={() => setOpen(false)}
        active={active}
        onChange={(id) => {
          setSection('font', id);
          setSection('template', id);
        }}
      />
    </div>
  );
}

function TemplateModal({ open, onClose, active, onChange }) {
  return (
    <Modal open={open} onClose={onClose} title="Choose a template" subtitle="Pick the layout for your resume." maxWidth="max-w-2xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const isActive = active === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                onClose();
              }}
              aria-pressed={isActive}
              className={`group relative flex flex-col overflow-hidden rounded-card border text-left transition-all duration-200 ${
                isActive
                  ? 'border-brand-500 ring-2 ring-brand-500/20'
                  : 'border-surface-200 hover:border-surface-300 hover:shadow-card-hover'
              }`}
            >
              {/* Preview */}
              <div className="relative h-52 overflow-hidden border-b border-surface-100 bg-surface-50">
                <div className="pointer-events-none scale-[0.32] origin-top-left">
                  <MiniPreview resume={{ ...resumeFor(opt.id, active) }} />
                </div>
                {isActive && (
                  <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-card">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <div className="mb-0.5 flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isActive ? 'text-brand-700' : 'text-surface-900'}`}>
                    {opt.label}
                  </span>
                </div>
                <p className="text-xs leading-snug text-surface-500">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

// Build a minimal resume snapshot for the template thumbnail
function resumeFor(id, currentActive) {
  return {
    personal_info: {
      name: 'Alex Morgan',
      headline: 'Senior Full-Stack Engineer',
      email: 'alex@email.com',
      phone: '(555) 123-4567',
      location: 'Austin, TX',
      links: [],
    },
    education: [{ institution: 'University of Texas', degree: 'B.S.', field: 'Computer Science', start_date: '2014', end_date: '2018' }],
    experience: [
      {
        company: 'Acme Corp',
        role: 'Full-Stack Engineer',
        start_date: '2021',
        end_date: 'Present',
        bullets: [
          'Built a customer analytics dashboard used by 40k+ monthly users',
          'Cut API response times by 60% via caching',
        ],
      },
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    projects: [],
    certifications: [],
    section_order: ['personal_info', 'education', 'experience', 'skills'],
    template: id || currentActive,
  };
}
