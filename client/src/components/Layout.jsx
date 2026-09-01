import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    exact: true,
  },
  {
    to: '/resumes',
    label: 'My Resumes',
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    exact: false,
  },
  {
    to: '/builder',
    label: 'Create Resume',
    icon: (
      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    exact: false,
  },
];

function SidebarNav({ onNavigate }) {
  const location = useLocation();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Sidebar navigation">
      {navItems.map((item) => {
        const isActive = item.exact
          ? location.pathname === item.to
          : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-button px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'
            }`}
          >
            <span className={isActive ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'}>{item.icon}</span>
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function UserCard({ user, onLogout, compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'rounded-button px-3 py-2.5'}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      {!compact && (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-surface-800">{user?.name || 'User'}</p>
            <p className="truncate text-[11px] text-surface-400">{user?.email || ''}</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="rounded-button p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
              title="Log out"
              aria-label="Log out"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Desktop sidebar */}
      <aside className="no-print hidden w-[260px] shrink-0 flex-col border-r border-surface-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-surface-100 px-5">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Resume Builder home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </span>
            <span className="text-[15px] font-bold text-surface-900">Resume Builder</span>
          </Link>
        </div>

        <SidebarNav />

        <div className="border-t border-surface-100 p-3">
          <UserCard user={user} onLogout={logout} />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-surface-900/25 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-surface-200 bg-white shadow-elevated lg:hidden animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-surface-100 px-5">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </span>
                <span className="text-[15px] font-bold text-surface-900">Resume Builder</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-button p-2 text-surface-400 hover:text-surface-600"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav onNavigate={() => setSidebarOpen(false)} />
            <div className="border-t border-surface-100 p-3">
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-button px-3 py-2.5 text-[13px] font-medium text-surface-500 hover:bg-surface-100">
                <svg className="h-[18px] w-[18px] text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Log out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="no-print flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-button p-2 text-surface-500 hover:bg-surface-100 lg:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-2.5 lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              <span className="text-[13px] font-bold text-surface-900">Resume Builder</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-surface-500 sm:inline">{user?.name}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
