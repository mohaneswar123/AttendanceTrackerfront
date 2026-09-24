import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import ThemeToggle from './ThemeToggle';
import {
  CalendarIcon, ClipboardCheckIcon, ListIcon, LogOutIcon, SettingsIcon, TableIcon, TimerIcon
} from './icons';

// Attendance is one page with four addresses, so all of them mark its item
const ATTENDANCE_PATHS = ['/', '/history', '/reports', '/subjects'];

export const NAV_ITEMS = [
  { to: '/', label: 'Attendance', Icon: ClipboardCheckIcon },
  { to: '/tasks', label: 'Tasks', Icon: ListIcon },
  { to: '/calendar', label: 'Calendar', Icon: CalendarIcon },
  { to: '/timetable', label: 'Timetable', Icon: TableIcon },
  { to: '/pomodoro', label: 'Pomodoro', Icon: TimerIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon }
];

export const isNavActive = (to, pathname) =>
  (to === '/' ? ATTENDANCE_PATHS.includes(pathname) : pathname === to);

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
          <span className="w-6 h-6 rounded bg-primary-600 text-primary-foreground text-[11px] font-bold flex items-center justify-center">AH</span>
          <span className="font-semibold tracking-tight text-white">Attendance In Hand</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = isNavActive(to, location.pathname);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm transition-colors ${active
                ? 'bg-primary-500/12 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-primary-400' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-line space-y-2">
        <div className="flex items-center justify-between h-9 px-3">
          <span className="text-xs text-slate-500">Appearance</span>
          <ThemeToggle compact />
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2.5 h-11 px-3 rounded-lg">
            <span className="w-7 h-7 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold uppercase flex items-center justify-center shrink-0">
              {displayName.substring(0, 2)}
            </span>
            <span className="flex-1 min-w-0 text-sm text-slate-200 truncate">{displayName}</span>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
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
