import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeProvider } from '../context/ResumeContext';
import ExperienceStep from '../components/builder/sections/ExperienceStep';
import ProjectsStep from '../components/builder/sections/ProjectsStep';
import LeadershipStep from '../components/builder/sections/LeadershipStep';
import EducationStep from '../components/builder/sections/EducationStep';
import PersonalInfoStep from '../components/builder/sections/PersonalInfoStep';
import SkillsStep from '../components/builder/sections/SkillsStep';
import CertificationsStep from '../components/builder/sections/CertificationsStep';
import LanguagesStep from '../components/builder/sections/LanguagesStep';
import { Input, Textarea } from '../components/builder/fields';
import { EntryReorder } from '../components/builder/EntryReorder';

const TEST_PHRASE = 'AI Engineer at Google';

function typePhrase(element, phrase) {
  // Fire keydown for each character including space
  for (let i = 0; i < phrase.length; i++) {
    const char = phrase[i];
    fireEvent.keyDown(element, { key: char, code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}` });
  }
  // Change value to simulate typing phrase with spaces
  fireEvent.change(element, { target: { value: phrase } });
}

describe('Spacebar Registration Across All Builder Fields', () => {
  it('does not prevent default on Space key in shared Input and Textarea inside EntryReorder', () => {
    let inputValue = '';
    let textareaValue = '';
    const items = [{ _key: '1' }];

    render(
      <EntryReorder
        items={items}
        renderItem={() => (
          <div>
            <Input
              label="Job title"
              value={inputValue}
              onChange={(v) => {
                inputValue = v;
              }}
              placeholder="Job title"
            />
            <Textarea
              label="Description"
              value={textareaValue}
              onChange={(v) => {
                textareaValue = v;
              }}
              placeholder="Description"
            />
          </div>
        )}
        onChange={() => {}}
      />
    );

    const input = screen.getByPlaceholderText('Job title');
    const textarea = screen.getByPlaceholderText('Description');

    const inputAllowed = fireEvent.keyDown(input, { key: ' ', code: 'Space' });
    expect(inputAllowed).toBe(true);

    const textareaAllowed = fireEvent.keyDown(textarea, { key: ' ', code: 'Space' });
    expect(textareaAllowed).toBe(true);
  });

  it('Work Experience: allows typing multi-word phrases with spaces in Job title, Company, and Bullets', () => {
    render(
      <ResumeProvider
        initial={{
          experience: [
            { _key: 'exp-1', role: '', company: '', start_date: '', end_date: '', bullets: [''] },
          ],
        }}
      >
        <ExperienceStep />
      </ResumeProvider>
    );

    const jobTitleInput = screen.getByPlaceholderText('Full-Stack Engineer');
    const companyInput = screen.getByPlaceholderText('Acme Corp');
    const bulletInput = screen.getByPlaceholderText('Built an analytics dashboard used by 40k+ users');

    typePhrase(jobTitleInput, TEST_PHRASE);
    expect(jobTitleInput).toHaveValue(TEST_PHRASE);

    typePhrase(companyInput, TEST_PHRASE);
    expect(companyInput).toHaveValue(TEST_PHRASE);

    typePhrase(bulletInput, TEST_PHRASE);
    expect(bulletInput).toHaveValue(TEST_PHRASE);
  });

  it('Projects: allows typing multi-word phrases with spaces in Title, Bullets, Tech picker, and Link', () => {
    render(
      <ResumeProvider
        initial={{
          projects: [
            { _key: 'proj-1', title: '', description: '', bullets: [''], tech: [], link: '' },
          ],
        }}
      >
        <ProjectsStep />
      </ResumeProvider>
    );

    const titleInput = screen.getByPlaceholderText('Devmetrics');
    const bulletInput = screen.getByPlaceholderText('Built an analytics dashboard used by 40k+ users');
    const techInput = screen.getByPlaceholderText('React, Node.js…');
    const linkInput = screen.getByPlaceholderText('github.com/you/project');

    typePhrase(titleInput, TEST_PHRASE);
    expect(titleInput).toHaveValue(TEST_PHRASE);

    typePhrase(bulletInput, TEST_PHRASE);
    expect(bulletInput).toHaveValue(TEST_PHRASE);

    typePhrase(techInput, TEST_PHRASE);
    expect(techInput).toHaveValue(TEST_PHRASE);

    typePhrase(linkInput, TEST_PHRASE);
    expect(linkInput).toHaveValue(TEST_PHRASE);
  });

  it('Leadership & Activities: allows typing multi-word phrases with spaces in Role, Organization, and Bullets', () => {
    render(
      <ResumeProvider
        initial={{
          leadership: [
            { _key: 'lead-1', role: '', organization: '', start_date: '', end_date: '', bullets: [''] },
          ],
        }}
      >
        <LeadershipStep />
      </ResumeProvider>
    );

    const roleInput = screen.getByPlaceholderText('President / Lead Organizer');
    const orgInput = screen.getByPlaceholderText('ACM Student Chapter / Robotics Club');
    const bulletInput = screen.getByPlaceholderText('Led 15+ student volunteers and organized campus hackathon');

    typePhrase(roleInput, TEST_PHRASE);
    expect(roleInput).toHaveValue(TEST_PHRASE);

    typePhrase(orgInput, TEST_PHRASE);
    expect(orgInput).toHaveValue(TEST_PHRASE);

    typePhrase(bulletInput, TEST_PHRASE);
    expect(bulletInput).toHaveValue(TEST_PHRASE);
  });

  it('Education: allows typing multi-word phrases with spaces in School, Degree, and Field', () => {
    render(
      <ResumeProvider
        initial={{
          education: [
            { _key: 'edu-1', institution: '', degree: '', field: '', start_date: '', end_date: '', gpa: '' },
          ],
        }}
      >
        <EducationStep />
      </ResumeProvider>
    );

    const schoolInput = screen.getByPlaceholderText('University of Texas');
    const degreeInput = screen.getByPlaceholderText('B.S.');
    const fieldInput = screen.getByPlaceholderText('Computer Science');

    typePhrase(schoolInput, TEST_PHRASE);
    expect(schoolInput).toHaveValue(TEST_PHRASE);

    typePhrase(degreeInput, TEST_PHRASE);
    expect(degreeInput).toHaveValue(TEST_PHRASE);

    typePhrase(fieldInput, TEST_PHRASE);
    expect(fieldInput).toHaveValue(TEST_PHRASE);
  });

  it('Personal Info: allows typing multi-word phrases with spaces in Name, Headline, Summary, Location, and Links', () => {
    render(
      <ResumeProvider
        initial={{
          personal_info: { name: '', headline: '', email: '', phone: '', location: '', summary: '', links: [] },
        }}
      >
        <PersonalInfoStep />
      </ResumeProvider>
    );

    const nameInput = screen.getByPlaceholderText('Jane Doe');
    const headlineInput = screen.getByPlaceholderText('e.g. Software Engineer');
    const summaryInput = screen.getByPlaceholderText(/A short 2–3 sentence summary/i);
    const locationInput = screen.getByPlaceholderText(/Austin, TX/i);
    const linksInput = screen.getByPlaceholderText('github.com/username');

    typePhrase(nameInput, TEST_PHRASE);
    expect(nameInput).toHaveValue(TEST_PHRASE);

    typePhrase(headlineInput, TEST_PHRASE);
    expect(headlineInput).toHaveValue(TEST_PHRASE);

    typePhrase(summaryInput, TEST_PHRASE);
    expect(summaryInput).toHaveValue(TEST_PHRASE);

    typePhrase(locationInput, TEST_PHRASE);
    expect(locationInput).toHaveValue(TEST_PHRASE);

    typePhrase(linksInput, TEST_PHRASE);
    expect(linksInput).toHaveValue(TEST_PHRASE);
  });

  it('Skills: allows typing multi-word phrases with spaces into draft input', () => {
    render(
      <ResumeProvider initial={{ skills: [] }}>
        <SkillsStep />
      </ResumeProvider>
    );

    const skillInput = screen.getByPlaceholderText('React, Node.js, Docker…');
    typePhrase(skillInput, TEST_PHRASE);
    expect(skillInput).toHaveValue(TEST_PHRASE);
  });

  it('Certifications: allows typing multi-word phrases with spaces in Name and Issuer', () => {
    render(
      <ResumeProvider
        initial={{
          certifications: [{ _key: 'cert-1', name: '', issuer: '', date: '' }],
        }}
      >
        <CertificationsStep />
      </ResumeProvider>
    );

    const nameInput = screen.getByPlaceholderText('AWS Solutions Architect');
    const issuerInput = screen.getByPlaceholderText('Amazon Web Services');

    typePhrase(nameInput, TEST_PHRASE);
    expect(nameInput).toHaveValue(TEST_PHRASE);

    typePhrase(issuerInput, TEST_PHRASE);
    expect(issuerInput).toHaveValue(TEST_PHRASE);
  });

  it('Languages: allows typing multi-word phrases with spaces in Language input', () => {
    render(
      <ResumeProvider initial={{ languages: [] }}>
        <LanguagesStep />
      </ResumeProvider>
    );

    const langInput = screen.getByPlaceholderText('e.g. English, Malayalam, Spanish...');
    typePhrase(langInput, TEST_PHRASE);
    expect(langInput).toHaveValue(TEST_PHRASE);
  });
});
