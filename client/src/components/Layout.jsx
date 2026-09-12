import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  FilePlus2,
  ShieldCheck,
  Target,
  LogOut,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import Footer from './common/Footer';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutGrid,
    exact: true,
  },
  {
    to: '/builder',
    label: 'Create Resume',
    icon: FilePlus2,
    exact: false,
  },
  {
    to: '/ats-checker',
    label: 'ATS Checker',
    icon: ShieldCheck,
    exact: false,
  },
  {
    to: '/job-match',
    label: 'Job Match',
    icon: Target,
    exact: false,
  },
];

function NavItem({ item, onClick }) {
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.to
    : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.exact}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-[13.5px] font-medium transition-all duration-150 ${
        isActive
          ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold'
          : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
      }`}
    >
      <Icon
        size={20}
        strokeWidth={isActive ? 2 : 1.75}
        className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400 dark:text-surface-500 group-hover:text-surface-700 dark:group-hover:text-surface-300 transition-colors'}
      />
      <span>{item.label}</span>
    </NavLink>
  );
}

function LogoBlock() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Resume Builder home">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
        <FileText size={18} className="text-white" strokeWidth={1.75} />
      </span>
      <span className="text-[15px] font-bold text-brand-700 dark:text-brand-400 tracking-tight leading-none">
        Resume<br />
        <span className="font-semibold text-surface-700 dark:text-surface-300">Builder</span>
      </span>
    </Link>
  );
}

function UserCard({ user, onLogout }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-sm">
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-surface-800 dark:text-surface-200">{user?.name || 'User'}</p>
        <p className="truncate text-[11px] text-surface-400 dark:text-surface-500">{user?.email || ''}</p>
      </div>
      {onLogout && (
        <button
          onClick={onLogout}
          className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-rose-500 dark:text-surface-500 dark:hover:bg-surface-800 dark:hover:text-rose-400 transition-colors"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={16} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-colors">
      {/* Logo block */}
      <div className="flex h-16 items-center px-5 border-b border-surface-100 dark:border-surface-800">
        <LogoBlock />
      </div>

      {/* Nav section label */}
      <div className="px-5 pt-5 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500">
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-3 py-2 flex-1" aria-label="Sidebar navigation">
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} onClick={onNavigate} />
        ))}
      </nav>

      {/* Support link */}
      <div className="px-3 pb-2 border-t border-surface-100 dark:border-surface-800 pt-2">
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=supportbuilderresume@gmail.com&su=Resume%20Builder%20Support"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-all duration-150"
          title="Contact & Support (Opens Gmail)"
        >
          <HelpCircle
            size={18}
            strokeWidth={1.75}
            className="text-surface-400 dark:text-surface-500 group-hover:text-surface-700 dark:group-hover:text-surface-300 transition-colors"
          />
          <span>Contact &amp; Support</span>
        </a>
      </div>

      {/* User footer */}
      <div className="border-t border-surface-100 dark:border-surface-800 p-3">
        <UserCard user={user} onLogout={logout} />
      </div>
    </div>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isBuilder = location.pathname.startsWith('/builder');

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-200">
      {/* Desktop sidebar — fixed 240px */}
      <aside className="no-print hidden w-[240px] shrink-0 lg:flex">
        <div className="w-full">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-surface-900/40 dark:bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[240px] lg:hidden shadow-elevated animate-fade-in">
            {/* Close button overlay */}
            <div className="absolute -right-10 top-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-surface-800 shadow-card text-surface-500 dark:text-surface-300"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>
            <div className="h-full">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="no-print flex h-16 shrink-0 items-center justify-between border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-4 lg:px-6 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
            {/* Mobile logo */}
            <Link to="/" className="flex items-center gap-2.5 lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
                <FileText size={14} className="text-white" strokeWidth={1.75} />
              </span>
              <span className="text-[13px] font-bold text-brand-700 dark:text-brand-400">Resume Builder</span>
            </Link>
          </div>

          {/* Right: theme toggle + user avatar */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-5 w-px bg-surface-200 dark:bg-surface-800" />
            <span className="hidden text-sm text-surface-600 dark:text-surface-300 sm:inline font-medium">{user?.name}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className={`mx-auto w-full ${isBuilder ? 'max-w-[1536px]' : 'max-w-7xl'} px-4 py-6 sm:px-6 lg:px-8 flex-1 flex flex-col`}>
            <Outlet />
          </div>
          {!isBuilder && <Footer />}
        </main>
      </div>
    </div>
  );
}
