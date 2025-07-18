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
      <div className="container mx-auto px-4 py-3">
        {/* Logo and Title */}
        <div className="text-xl font-bold text-center lg:text-left mb-2 lg:mb-0">
          Attendance Register
        </div>

        {/* Navigation + Logout (Horizontal layout on all screen sizes) */}
        <div className="flex flex-wrap justify-center lg:justify-between items-center gap-4 text-sm">
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/history" className="hover:text-blue-200">History</Link>
            <Link to="/reports" className="hover:text-blue-200">Reports</Link>
            <Link to="/settings" className="hover:text-blue-200">Settings</Link>
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
