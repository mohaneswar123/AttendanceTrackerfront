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

  // Get the user's name from the currentUser object
  // Access username property as per your API model, with fallbacks
  const displayName = currentUser?.username || currentUser?.name || 'User';

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Attendance Register</Link>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-4">
            <Link to="/" className="hover:text-blue-200 transition-colors">Dashboard</Link>
            <Link to="/history" className="hover:text-blue-200 transition-colors">History</Link>
            <Link to="/reports" className="hover:text-blue-200 transition-colors">Reports</Link>
            <Link to="/settings" className="hover:text-blue-200 transition-colors">Settings</Link>
          </nav>
          
          <div className="flex items-center space-x-3">
            <span className="hidden md:block">
              Welcome, {displayName}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden bg-blue-700">
        <div className="container mx-auto px-4 py-2 flex justify-between">
          <Link to="/" className="text-blue-100 hover:text-white">Dashboard</Link>
          <Link to="/history" className="text-blue-100 hover:text-white">History</Link>
          <Link to="/reports" className="text-blue-100 hover:text-white">Reports</Link>
          <Link to="/settings" className="text-blue-100 hover:text-white">Settings</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;