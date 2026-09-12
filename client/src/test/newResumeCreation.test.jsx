import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { makeEmptyResume, makeSampleResume, isResumeEmpty } from '../lib/resume';
import Preview from '../components/builder/Preview';
import ATSResumeTemplate from '../components/preview/ATSResumeTemplate';
import StepNav from '../components/builder/StepNav';
import { ResumeProvider } from '../context/ResumeContext';

describe('New Resume Creation & Blank State', () => {
  it('makeEmptyResume initializes all fields completely blank', () => {
    const resume = makeEmptyResume();

    expect(resume.title).toBe('Untitled Resume');
    expect(resume.personal_info.name).toBe('');
    expect(resume.personal_info.headline).toBe('');
    expect(resume.personal_info.email).toBe('');
    expect(resume.personal_info.phone).toBe('');
    expect(resume.personal_info.location).toBe('');
    expect(resume.personal_info.summary).toBe('');
    expect(resume.personal_info.links).toEqual([]);

    expect(resume.experience).toEqual([]);
    expect(resume.projects).toEqual([]);
    expect(resume.skills).toEqual([]);
    expect(resume.leadership).toEqual([]);
    expect(resume.education).toEqual([]);
    expect(resume.certifications).toEqual([]);
    expect(resume.languages).toEqual([]);
  });

  it('isResumeEmpty correctly identifies empty resumes vs filled resumes', () => {
    expect(isResumeEmpty(null)).toBe(true);
    expect(isResumeEmpty({})).toBe(true);
    expect(isResumeEmpty(makeEmptyResume())).toBe(true);

    // Adding name makes it not empty
    const withName = makeEmptyResume();
    withName.personal_info.name = 'Jane Doe';
    expect(isResumeEmpty(withName)).toBe(false);

    // Adding experience makes it not empty
    const withExp = makeEmptyResume();
    withExp.experience = [{ company: 'Acme', role: 'Dev' }];
    expect(isResumeEmpty(withExp)).toBe(false);

    // Adding skills makes it not empty
    const withSkills = makeEmptyResume();
    withSkills.skills = ['JavaScript'];
    expect(isResumeEmpty(withSkills)).toBe(false);

    // Adding education makes it not empty
    const withEdu = makeEmptyResume();
    withEdu.education = [{ institution: 'MIT' }];
    expect(isResumeEmpty(withEdu)).toBe(false);

    // makeSampleResume is not empty
    expect(isResumeEmpty(makeSampleResume())).toBe(false);
  });

  it('StepNav displays 0% completion when resume is empty', () => {
    const emptyResume = makeEmptyResume();
    const steps = [
      { key: 'personal_info', label: 'Professional Summary', short: 'Summary', count: emptyResume.personal_info?.name ? 1 : 0 },
      { key: 'experience', label: 'Work Experience', short: 'Experience', count: emptyResume.experience?.length || 0 },
      { key: 'projects', label: 'Projects', short: 'Projects', count: emptyResume.projects?.length || 0 },
      { key: 'skills', label: 'Skills', short: 'Skills', count: emptyResume.skills?.length || 0 },
      { key: 'leadership', label: 'Leadership & Activities', short: 'Leadership', count: emptyResume.leadership?.length || 0, optional: true },
      { key: 'education', label: 'Education', short: 'Education', count: emptyResume.education?.length || 0 },
      { key: 'certifications', label: 'Certifications', short: 'Certifications', count: emptyResume.certifications?.length || 0 },
      { key: 'languages', label: 'Languages', short: 'Languages', count: emptyResume.languages?.length || 0 },
    ];
    const completedCount = steps.filter((s) => s.count > 0).length;
    const completion = Math.round((completedCount / steps.length) * 100);

    expect(completion).toBe(0);

    render(<StepNav steps={steps} current={0} onSelect={vi.fn()} completion={completion} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText(/Resume completion/i)).toBeInTheDocument();
  });

  it('Preview pane displays empty state and no fake sample content when resume is empty', () => {
    const emptyResume = makeEmptyResume();

    render(
      <ResumeProvider initial={emptyResume}>
        <Preview />
      </ResumeProvider>
    );

    // Empty state should be visible
    expect(screen.getByTestId('preview-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/Your resume will appear here/i)).toBeInTheDocument();

    // No leftover sample text
    expect(screen.queryByText(/Alex Morgan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Your Name/i)).not.toBeInTheDocument();

    // Export buttons should be disabled
    expect(screen.queryByRole('button', { name: /Print/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Download DOCX/i })).toBeDisabled();
  });

  it('ATSResumeTemplate does not render "Your Name" or fake sample data when empty', () => {
    const emptyResume = makeEmptyResume();
    const { container } = render(<ATSResumeTemplate resume={emptyResume} />);

    expect(screen.queryByText(/Your Name/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Alex Morgan/i)).not.toBeInTheDocument();
    // In empty resume, no header is rendered
    expect(container.querySelector('.ats-header')).toBeNull();
  });

  it('Preview pane displays filled resume when user inputs details', () => {
    const populated = makeEmptyResume();
    populated.personal_info.name = 'Sarah Connor';
    populated.personal_info.headline = 'Cybersecurity Engineer';

    render(
      <ResumeProvider initial={populated}>
        <Preview />
      </ResumeProvider>
    );

    // Empty state should NOT be visible
    expect(screen.queryByTestId('preview-empty-state')).not.toBeInTheDocument();
    expect(screen.queryByText(/Your resume will appear here/i)).not.toBeInTheDocument();

    // The user entered details should be shown
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('Cybersecurity Engineer')).toBeInTheDocument();

    // Export buttons should be enabled
    expect(screen.queryByRole('button', { name: /Print/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download PDF/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Download DOCX/i })).not.toBeDisabled();
  });
});
