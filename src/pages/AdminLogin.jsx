import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';

function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { adminLogin, loading } = useContext(AttendanceContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await adminLogin(credentials.email, credentials.password);
      
      // If we get here, login was successful
      navigate('/admin/dashboard');
    } catch (err) {
      // Handle specific error responses from the API
      if (err.response?.status === 401) {
        setError('Invalid admin credentials');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
      console.error('Admin login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-light-primary">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-light-primary opacity-70">
            Access the administrative dashboard
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-500 text-light-primary px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input rounded-t-md rounded-b-none"
                placeholder="Admin email address"
                value={credentials.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input rounded-b-md rounded-t-none"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <a href="/login" className="font-medium text-primary-500 hover:underline">
              Go to regular user login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;