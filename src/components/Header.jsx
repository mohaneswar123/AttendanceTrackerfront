import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

function Header() {
  const { currentUser, logout } = useContext(AttendanceContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const displayName = currentUser?.username || currentUser?.name || 'User';

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/history', label: 'History', icon: '📅' },
    { to: '/reports', label: 'Reports', icon: '📈' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path) => location.pathname === path;
  const isPublicRoot = location.pathname === '/';

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-dark-secondary shadow-elevated backdrop-blur-sm border-b border-dark-primary">
      <div className="container h-full px-4 flex flex-row justify-between items-center gap-4">
        {/* Logo with gradient */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-2xl transform group-hover:scale-110 transition-transform">📚</div>
          <div className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 bg-clip-text text-transparent">
            Attendance Register
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="flex items-center gap-3 text-sm">
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive(link.to)
                    ? 'bg-primary-500 shadow-soft text-dark-primary'
                    : 'text-light-primary hover:bg-dark-primary hover:text-primary-500'
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* User/Login section */}
          {isPublicRoot ? (
            // Always show Login on public home, even if session exists
            <button
              onClick={handleLogin}
              className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-dark-primary font-semibold shadow-soft transition-all duration-300 transform hover:scale-105"
            >
              Login
            </button>
          ) : currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-dark-primary rounded-full">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <span className="text-light-primary font-medium">{displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-dark-primary hover:bg-dark-primary/80 text-light-primary font-medium shadow-soft transition-all duration-300 transform hover:scale-105 border border-primary-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-dark-primary font-semibold shadow-soft transition-all duration-300 transform hover:scale-105"
            >
              Login
            </button>
          )}
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-dark-primary transition-colors"
          >
            <svg className="w-6 h-6 text-light-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-dark-secondary shadow-elevated border-t border-primary-500/30 animate-slide-up">
          <nav className="container px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-primary-500 text-dark-primary'
                    : 'text-light-primary hover:bg-dark-primary'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
