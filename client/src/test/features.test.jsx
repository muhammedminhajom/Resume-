import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResumeCard from '../components/ResumeCard';
import ATSResumeTemplate from '../components/preview/ATSResumeTemplate';
import { DEFAULT_SECTION_ORDER, SECTION_META, makeSampleResume } from '../lib/resume';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';

describe('Three-Dot Menu on ResumeCard', () => {
  const sampleResume = {
    _id: 'resume-123',
    title: 'Software Engineer Resume',
    template: 'modern',
    updated_at: new Date().toISOString(),
    personal_info: { name: 'Jane Doe' },
  };

  it('renders three-dot menu button and opens dropdown menu on click', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onDuplicate = vi.fn();
    const onRename = vi.fn();
    const onDownload = vi.fn();

    render(
      <ResumeCard
        resume={sampleResume}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onDuplicate}
        onRename={onRename}
        onDownload={onDownload}
      />
    );

    const moreActionsBtn = screen.getByLabelText(/More actions for Software Engineer Resume/i);
    expect(moreActionsBtn).toBeInTheDocument();

    // Menu should initially be closed
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(moreActionsBtn);

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    // Check actions: Rename, View, Download PDF, Delete
    expect(screen.getByRole('menuitem', { name: /Rename/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /View/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Duplicate/i })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Download PDF/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Delete/i })).toBeInTheDocument();
  });

  it('fires callbacks when menu items are clicked', () => {
    const onRename = vi.fn();
    const onView = vi.fn();
    const onDownload = vi.fn();
    const onDelete = vi.fn();

    render(
      <ResumeCard
        resume={sampleResume}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onView={onView}
        onRename={onRename}
        onDownload={onDownload}
      />
    );

    // Open menu
    fireEvent.click(screen.getByLabelText(/More actions for Software Engineer Resume/i));

    // Click Rename
    fireEvent.click(screen.getByRole('menuitem', { name: /Rename/i }));
    expect(onRename).toHaveBeenCalledWith(sampleResume);

    // Open menu again
    fireEvent.click(screen.getByLabelText(/More actions for Software Engineer Resume/i));

    // Click View
    fireEvent.click(screen.getByRole('menuitem', { name: /View/i }));
    expect(onView).toHaveBeenCalledWith(sampleResume);

    // Open menu again
    fireEvent.click(screen.getByLabelText(/More actions for Software Engineer Resume/i));

    // Click Download PDF
    fireEvent.click(screen.getByRole('menuitem', { name: /Download PDF/i }));
    expect(onDownload).toHaveBeenCalledWith(sampleResume);

    // Open menu again
    fireEvent.click(screen.getByLabelText(/More actions for Software Engineer Resume/i));

    // Click Delete
    fireEvent.click(screen.getByRole('menuitem', { name: /Delete/i }));
    expect(onDelete).toHaveBeenCalledWith(sampleResume);
  });
});

describe('Languages, Leadership & Projects - Placement & Rendering', () => {
  it('places sections in exact requested 8-part sequence in DEFAULT_SECTION_ORDER', () => {
    expect(DEFAULT_SECTION_ORDER).toEqual([
      'personal_info',
      'experience',
      'projects',
      'skills',
      'leadership',
      'education',
      'certifications',
      'languages',
    ]);
    expect(DEFAULT_SECTION_ORDER[DEFAULT_SECTION_ORDER.length - 1]).toBe('languages');
    const lastMeta = SECTION_META[SECTION_META.length - 1];
    expect(lastMeta.key).toBe('languages');
    expect(lastMeta.label).toBe('Languages');
  });

  it('makeSampleResume includes sample languages, leadership, project bullets and location', () => {
    const sample = makeSampleResume();
    expect(sample.personal_info.location).toBeTruthy();
    expect(Array.isArray(sample.languages)).toBe(true);
    expect(sample.languages.length).toBeGreaterThanOrEqual(2);
    expect(sample.languages[0].language).toBe('English');
    expect(sample.languages[0].proficiency).toBe('Professional');
    expect(sample.languages[1].language).toBe('Malayalam');
    expect(sample.languages[1].proficiency).toBe('Native');

    expect(Array.isArray(sample.leadership)).toBe(true);
    expect(sample.leadership.length).toBeGreaterThanOrEqual(1);
    expect(sample.leadership[0].role).toBe('President');
    expect(sample.leadership[0].organization).toBe('ACM Student Chapter');

    expect(Array.isArray(sample.projects[0].bullets)).toBe(true);
    expect(sample.projects[0].bullets.length).toBeGreaterThanOrEqual(2);
  });

  it('renders all sections including Leadership & Activities in ATSResumeTemplate when present', () => {
    const sample = makeSampleResume();
    const { container } = render(<ATSResumeTemplate resume={sample} />);

    // Check that Location is rendered in header
    expect(container.textContent).toContain(sample.personal_info.location);

    // Check that Headings follow exact 8-part order
    const headings = container.querySelectorAll('h2');
    const headingTexts = Array.from(headings).map((h) => h.textContent.trim());

    expect(headingTexts).toEqual([
      'Professional Summary',
      'Work Experience',
      'Projects',
      'Skills',
      'Leadership & Activities',
      'Education',
      'Certifications',
      'Languages',
    ]);

    // Languages must be the last heading in the document
    expect(headingTexts[headingTexts.length - 1]).toBe('Languages');

    // Content includes formatted language string
    expect(container.textContent).toContain('English — Professional');
    expect(container.textContent).toContain('Malayalam — Native');

    // Leadership content is rendered
    expect(container.textContent).toContain('President — ACM Student Chapter');

    // Project bullets are rendered
    expect(container.textContent).toContain('Open-source tool that analyzes GitHub repositories');
  });

  it('hides Leadership & Activities section completely when empty', () => {
    const sample = makeSampleResume();
    sample.leadership = []; // empty leadership
    const { container } = render(<ATSResumeTemplate resume={sample} />);

    const headings = container.querySelectorAll('h2');
    const headingTexts = Array.from(headings).map((h) => h.textContent.trim());

    // Should not contain 'Leadership & Activities'
    expect(headingTexts).not.toContain('Leadership & Activities');
    expect(headingTexts).toEqual([
      'Professional Summary',
      'Work Experience',
      'Projects',
      'Skills',
      'Education',
      'Certifications',
      'Languages',
    ]);
  });
});

describe('Dark Mode Theme Toggle & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders ThemeToggle and toggles theme on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /Switch to dark mode/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to toggle to dark
    fireEvent.click(toggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument();

    // Click again to toggle back to light
    fireEvent.click(screen.getByRole('button', { name: /Switch to light mode/i }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('initializes with dark theme if stored in localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument();
  });

  it('resume document remains pure white/black regardless of dark mode on html', () => {
    document.documentElement.classList.add('dark');
    const sample = makeSampleResume();
    const { container } = render(<ATSResumeTemplate resume={sample} />);

    const resumeRoot = container.firstChild;
    expect(resumeRoot).toHaveStyle({ backgroundColor: '#ffffff', color: '#000000' });
    const headings = container.querySelectorAll('h2');
    headings.forEach((h) => {
      expect(h.className).toContain('text-black');
    });
  });
});

describe('Google Sign-In Integration', () => {
  it('renders GoogleSignInButton with Google logo and correct text', async () => {
    const { default: GoogleSignInButton } = await import('../components/auth/GoogleSignInButton');
    render(<GoogleSignInButton />);

    const button = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain('Sign in with Google');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders Google sign-in button and email divider on LoginPage', async () => {
    const { default: LoginPage } = await import('../pages/LoginPage');
    const { BrowserRouter } = await import('react-router-dom');
    const { AuthProvider } = await import('../context/AuthContext');

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Google Sign-In button present
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
    // Divider present
    expect(screen.getByText(/or continue with email/i)).toBeInTheDocument();
    // Original email/password inputs present
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  it('renders Google sign-in button and email divider on SignupPage', async () => {
    const { default: SignupPage } = await import('../pages/SignupPage');
    const { BrowserRouter } = await import('react-router-dom');
    const { AuthProvider } = await import('../context/AuthContext');

    render(
      <BrowserRouter>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Google Sign-In button present
    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument();
    // Divider present
    expect(screen.getByText(/or continue with email/i)).toBeInTheDocument();
    // Original signup inputs present
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
  });
});

describe('Dashboard View Modal and Builder Toolbar & Finish Actions', () => {
  const mockResume = {
    _id: 'resume-view-123',
    title: 'Software Engineer Resume',
    template: 'modern',
    updated_at: new Date().toISOString(),
    personal_info: { name: 'Jane Doe', email: 'jane@example.com', headline: 'Staff Engineer' },
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    leadership: [],
    projects: [],
  };

  it('DashboardPage displays read-only View modal when View is selected from ResumeCard', async () => {
    const { default: DashboardPage } = await import('../pages/DashboardPage');
    const { BrowserRouter } = await import('react-router-dom');
    const { api } = await import('../api/client');

    vi.spyOn(api, 'get').mockImplementation(async (path) => {
      if (path === '/resumes') {
        return { resumes: [mockResume] };
      }
      if (path === `/resumes/${mockResume._id}`) {
        return { resume: mockResume };
      }
      return {};
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    const titleEl = await screen.findByText('Software Engineer Resume');
    expect(titleEl).toBeInTheDocument();

    // Open three-dot menu
    const moreActionsBtn = screen.getByLabelText(/More actions for Software Engineer Resume/i);
    fireEvent.click(moreActionsBtn);

    // Duplicate should NOT exist
    expect(screen.queryByRole('menuitem', { name: /Duplicate/i })).not.toBeInTheDocument();

    // View should exist
    const viewBtn = screen.getByRole('menuitem', { name: /View/i });
    expect(viewBtn).toBeInTheDocument();

    // Click View
    fireEvent.click(viewBtn);

    // Modal should appear with resume title and ATS template preview
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Read-only preview of your formatted resume.')).toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', { name: /Close/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();

    // Close modal
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Preview toolbar contains Download PDF and no Print or Download DOCX buttons', async () => {
    const { default: Preview } = await import('../components/builder/Preview');
    const { ResumeProvider } = await import('../context/ResumeContext');

    render(
      <ResumeProvider initial={mockResume}>
        <Preview />
      </ResumeProvider>
    );

    expect(screen.queryByRole('button', { name: /Print/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Download DOCX/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download PDF/i })).toBeInTheDocument();
  });

  it('BuilderPage fetches and populates saved resume matching URL id without wiping data', async () => {
    const { default: BuilderPage } = await import('../pages/BuilderPage');
    const { MemoryRouter, Routes, Route } = await import('react-router-dom');
    const { api } = await import('../api/client');

    const sampleExisting = {
      _id: 'resume-edit-999',
      id: 'resume-edit-999',
      title: 'Principal Architect Resume',
      template: 'Arial',
      font: 'Arial',
      personal_info: {
        name: 'Ada Lovelace',
        headline: 'Lead Computing Architect',
        email: 'ada@example.com',
        phone: '1234567890',
        location: 'London, UK',
        links: [],
        summary: 'First computer programmer.',
      },
      experience: [],
      projects: [],
      skills: ['Algorithms', 'Mathematics'],
      leadership: [],
      education: [],
      certifications: [],
      languages: [{ _id: 'lang-1', language: 'English', proficiency: 'Native' }],
    };

    const getSpy = vi.spyOn(api, 'get').mockImplementation(async (path) => {
      if (path === '/resumes/resume-edit-999') {
        return { resume: sampleExisting };
      }
      return {};
    });

    const postSpy = vi.spyOn(api, 'post');

    render(
      <MemoryRouter initialEntries={['/builder/resume-edit-999']}>
        <Routes>
          <Route path="/builder/:id" element={<BuilderPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should fetch the existing resume
    expect(getSpy).toHaveBeenCalledWith('/resumes/resume-edit-999');

    // Title should be populated with the saved title
    const titleInput = await screen.findByDisplayValue('Principal Architect Resume');
    expect(titleInput).toBeInTheDocument();

    // Full name and headline inputs should be populated with saved data
    expect(await screen.findByDisplayValue('Ada Lovelace')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Lead Computing Architect')).toBeInTheDocument();

    // Autosave should NOT create a new resume record
    expect(postSpy).not.toHaveBeenCalled();
  });
});

