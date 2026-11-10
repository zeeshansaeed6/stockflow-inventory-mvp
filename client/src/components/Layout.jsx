/**
 * Shell for authenticated pages: sidebar nav + top bar.
 * Includes dark-mode toggle and grouped nav sections.
 */

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Grouped navigation so the sidebar reads like a real app.
const NAV_SECTIONS = [
  {
    title: 'Overview',
    links: [
      { to: '/', label: 'Dashboard', end: true, icon: '◧' },
      { to: '/reports', label: 'Reports', icon: '≡' },
      { to: '/movements', label: 'Stock history', icon: '⟳' },
    ],
  },
  {
    title: 'Catalog',
    links: [
      { to: '/products', label: 'Products', icon: '◼' },
      { to: '/categories', label: 'Categories', icon: '◉' },
      { to: '/suppliers', label: 'Suppliers', icon: '◇' },
    ],
  },
  {
    title: 'Admin',
    links: [{ to: '/settings', label: 'Settings', icon: '✱' }],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col dark:bg-slate-950 dark:border-r dark:border-slate-800">
        <div className="px-6 py-5 text-xl font-bold border-b border-slate-800">
          Stock<span className="text-brand-500">Flow</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.links.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <span className="opacity-70 w-4 text-center">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          StockFlow · v0.2
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between
                           dark:bg-slate-900 dark:border-slate-800">
          <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {user?.organization?.name}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="btn-secondary px-3 py-1.5 text-xs"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☼ Light' : '☾ Dark'}
            </button>
            <span className="text-sm text-slate-700 dark:text-slate-200 hidden sm:inline">
              {user?.email}
            </span>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
