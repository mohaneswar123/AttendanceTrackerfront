import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import ThemeToggle from './ThemeToggle';
import { LogOutIcon } from './icons';

// The phone top bar. Navigation lives in the bottom bar, so this is only the brand
// and the two things that have nowhere else to go.
function Header() {
  const { currentUser, logout } = useContext(AttendanceContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 bg-background-paper border-b border-line">
      <div className="h-full px-4 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded bg-primary-600 text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0">AH</span>
          <span className="font-semibold tracking-tight text-white truncate">Attendance In Hand</span>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle compact />
          {currentUser ? (
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOutIcon />
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
