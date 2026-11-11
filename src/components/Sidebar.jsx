import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { APP_NAME } from '../branding';
import ThemeToggle from './ThemeToggle';
import { GridIcon, LogOutIcon, SettingsIcon } from './icons';
import { FEATURES, toneOf } from '../features/registry';



// Home first, then one entry per app, built from the same registry the phone nav uses
export const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: GridIcon },
  ...FEATURES.map(feature => ({
    to: feature.tabs[0].path, label: feature.name, Icon: feature.Icon, id: feature.id
  })),
  { to: '/settings', label: 'Settings', Icon: SettingsIcon }
];

// The phone bar carries the five places you move between. Settings sits beside the page
// title instead, so the bar stays wide enough to read at 360px.

// An app's item stays lit on every one of its sections, Home only on Home itself
export const isNavActive = (to, pathname) =>
  (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to.split('/').slice(0, 2).join('/')}/`));

function Sidebar() {
  const { currentUser, logout } = useContext(AttendanceContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = currentUser?.username || 'Guest';

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 bg-background-paper border-r border-line z-40">
      <div className="h-14 flex items-center px-5 border-b border-line">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded bg-primary-600 text-primary-foreground text-xs font-bold flex items-center justify-center">AH</span>
          <span className="font-semibold tracking-tight text-white">{APP_NAME}</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, Icon, id }) => {
          const active = isNavActive(to, location.pathname);
          // An app's own colour marks it here too, so the sidebar and the screen agree
          const tone = id ? toneOf(id) : null;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors ${active
                ? `${tone ? `${tone.tint} ${tone.text}` : 'bg-primary-500/10 text-white'} font-medium`
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Icon className="w-[18px] h-[18px]" filled={active} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-line space-y-2">
        <div className="flex items-center justify-between h-9 px-3">
          <span className="text-xs text-slate-400">Appearance</span>
          <ThemeToggle compact />
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2.5 h-11 px-3 rounded-lg">
            <span className="w-7 h-7 rounded-full bg-white/10 text-slate-200 text-xs font-semibold uppercase flex items-center justify-center shrink-0">
              {displayName.substring(0, 2)}
            </span>
            <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">{displayName}</span>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              <LogOutIcon className="w-[18px] h-[18px]" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary w-full">Sign in</Link>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
