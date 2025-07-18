import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

function Header() {
  const { currentUser, logout } = useContext(AttendanceContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = currentUser?.username || currentUser?.name || 'User';

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
        {/* Logo and Title */}
        <Link to="/" className="text-xl font-bold text-center lg:text-left">
          Attendance Register
        </Link>

        {/* Navigation and User Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-center space-y-2 sm:space-y-0">
          {/* Navigation Links - always visible */}
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/history" className="hover:text-blue-200">History</Link>
            <Link to="/reports" className="hover:text-blue-200">Reports</Link>
            <Link to="/settings" className="hover:text-blue-200">Settings</Link>
          </nav>

          {/* User Info and Logout */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
            <span className="text-white text-center">
              Welcome, <span className="font-semibold">{displayName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
