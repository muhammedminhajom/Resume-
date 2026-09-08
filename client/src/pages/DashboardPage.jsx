import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, downloadBlob } from '../api/client';
import { makeSampleResume } from '../lib/resume';
import ResumeCard from '../components/ResumeCard';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';

function formatRelative(value) {
  if (!value) return 'Never';
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} minute${min > 1 ? 's' : ''} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatCard({ label, value, icon, accent = 'brand' }) {
  const accentMap = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    slate: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  };
  return (
    <div className="card flex items-center gap-4 p-4 sm:p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentMap[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">{value}</p>
        <p className="truncate text-sm text-surface-500 dark:text-surface-400">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [renamingResume, setRenamingResume] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [deletingResume, setDeletingResume] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.get('/resumes');
        if (mounted) setResumes(data.resumes);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleRenameSubmit(e) {
    e?.preventDefault();
    if (!renamingResume) return;
    const trimmed = renameTitle.trim();
    if (!trimmed) return;
    setRenameLoading(true);
    try {
      await api.put(`/resumes/${renamingResume._id}`, { title: trimmed });
      setResumes((prev) =>
        prev.map((r) => (r._id === renamingResume._id ? { ...r, title: trimmed } : r))
      );
      setRenamingResume(null);
    } catch (err) {
      alert(err.message || 'Failed to rename resume.');
    } finally {
      setRenameLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingResume) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/resumes/${deletingResume._id}`);
      setResumes((prev) => prev.filter((r) => r._id !== deletingResume._id));
      setDeletingResume(null);
    } catch (err) {
      alert(err.message || 'Failed to delete resume.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleDownload(resume) {
    try {
      const blob = await api.exportPdf(resume._id);
      const base =
        (resume.title || 'resume')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || 'resume';
      downloadBlob(blob, `${base}.pdf`);
    } catch (err) {
      alert(err.message || 'Failed to download PDF.');
    }
  }

  async function handleDuplicate(resume) {
    try {
      const data = await api.post('/resumes', {
        ...resume,
        title: `${resume.title} (copy)`,
      });
      navigate(`/builder/${data.resume._id}`, { replace: true });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleCreate() {
    try {
      const data = await api.post('/resumes', makeSampleResume());
      navigate(`/builder/${data.resume._id}`, { replace: true });
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = useMemo(
    () =>
      resumes.filter(
        (r) => !search || (r.title || '').toLowerCase().includes(search.toLowerCase())
      ),
    [resumes, search]
  );

  const totalResumes = resumes.length;
  const templatesUsed = useMemo(
    () => new Set(resumes.map((r) => r.template).filter(Boolean)).size,
    [resumes]
  );
  const sortedByDate = useMemo(
    () => [...resumes].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)),
    [resumes]
  );
  const latestUpdated = sortedByDate[0]?.updated_at
    ? formatRelative(sortedByDate[0].updated_at)
    : '—';

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-100">My Resumes</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Create and manage all your resumes in one place.</p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Resumes"
          value={totalResumes}
          accent="brand"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
        />
        <StatCard
          label="Templates Used"
          value={templatesUsed}
          accent="green"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          }
        />
        <StatCard
          label="Last Updated"
          value={latestUpdated}
          accent="slate"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Search + Create */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resumes..."
            className="input-field pl-10"
            aria-label="Search resumes"
          />
        </div>
        <button onClick={handleCreate} className="btn-primary shrink-0">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Resume
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-input border border-red-200 bg-red-50 px-4 py-3 animate-fade-in">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-700">
              {error.includes('Failed to fetch') ? 'Unable to connect to the server.' : error}
            </p>
            <button onClick={load} className="mt-1 text-sm font-semibold text-red-600 underline hover:text-red-700">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 && !search ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title="No resumes yet"
          description="Create your first resume and start applying with confidence."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={handleCreate} className="btn-primary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Resume
              </button>
              <button className="btn-secondary" onClick={() => navigate('/builder')}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
                Explore Templates
              </button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center px-8 py-16 text-center">
          <p className="text-sm text-surface-500">No resumes match &quot;{search}&quot;.</p>
        </div>
      ) : (
        <div>
          <h2 className="section-title mb-4">Recent Resumes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((r) => (
              <ResumeCard
                key={r._id}
                resume={r}
                onEdit={() => navigate(`/builder/${r._id}`)}
                onRename={(resume) => {
                  setRenamingResume(resume);
                  setRenameTitle(resume.title || '');
                }}
                onDelete={(resume) => setDeletingResume(resume)}
                onDuplicate={() => handleDuplicate(r)}
                onDownload={() => handleDownload(r)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rename Modal */}
      <Modal
        open={Boolean(renamingResume)}
        onClose={() => setRenamingResume(null)}
        title="Rename Resume"
        subtitle="Give your resume a distinct and memorable title."
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div>
            <label className="label-text">Resume Title</label>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              className="input-field"
              placeholder="e.g. Software Engineer 2026"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRenamingResume(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={renameLoading || !renameTitle.trim()}
              className="btn-primary"
            >
              {renameLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deletingResume)}
        onClose={() => setDeletingResume(null)}
        title="Delete Resume"
        subtitle="This action cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-600">
            Are you sure you want to permanently delete{' '}
            <strong className="text-surface-900">&quot;{deletingResume?.title || 'this resume'}&quot;</strong>?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingResume(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="btn-danger"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
