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
      <div className="container mx-auto px-4 py-3 flex flex-col lg:flex-row justify-between items-center gap-3">
        {/* Logo/Title */}
        <div className="text-xl font-bold">
          Attendance Register
        </div>

        {/* Navigation + Logout */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 text-sm">
          {/* Navigation Links */}
          <nav className="flex flex-wrap gap-4">
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
