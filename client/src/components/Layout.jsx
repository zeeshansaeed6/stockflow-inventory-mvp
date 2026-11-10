/**
 * Shell for authenticated pages: sidebar nav + top bar.
 * Icons come from the shared icon set so the whole UI stays consistent.
 */

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  IconDashboard,
  IconReports,
  IconHistory,
  IconBox,
  IconTag,
  IconTruck,
  IconSettings,
  IconSun,
  IconMoon,
  IconLogout,
  Logo,
} from './icons/index.jsx';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    links: [
      { to: '/', label: 'Dashboard', end: true, Icon: IconDashboard },
      { to: '/reports', label: 'Reports', Icon: IconReports },
      { to: '/movements', label: 'Stock history', Icon: IconHistory },
    ],
  },
  {
    title: 'Catalog',
    links: [
      { to: '/products', label: 'Products', Icon: IconBox },
      { to: '/categories', label: 'Categories', Icon: IconTag },
      { to: '/suppliers', label: 'Suppliers', Icon: IconTruck },
    ],
  },
  {
    title: 'Admin',
    links: [{ to: '/settings', label: 'Settings', Icon: IconSettings }],
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
        <div className="px-5 py-4 flex items-center gap-2 border-b border-slate-800">
          <Logo className="w-9 h-9" />
          <div className="leading-tight">
            <div className="text-lg font-bold">
              Stock<span className="text-brand-400">Flow</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              Inventory OS
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.links.map(({ Icon, ...item }) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          StockFlow · v0.3
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
              className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <span className="text-sm text-slate-700 dark:text-slate-200 hidden sm:inline">
              {user?.email}
            </span>
            <button
              className="btn-secondary inline-flex items-center gap-1.5"
              onClick={handleLogout}
            >
              <IconLogout className="w-4 h-4" />
              <span>Logout</span>
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
