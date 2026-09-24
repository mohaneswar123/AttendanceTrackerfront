import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { errorMessage, isSubscriptionError } from '../services/api';

function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;
  const { currentUser, login, loading } = useContext(AttendanceContext);

  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      navigate('/');
    }
  }, [currentUser, navigate]);

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
      await login(credentials.email, credentials.password);
      navigate("/");
    } catch (err) {
      if (isSubscriptionError(err.response?.data?.code)) {
        navigate("/inactive");
        return;
      }
      setError(errorMessage(err, "Invalid email or password"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-8 surface p-8 md:p-10">
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-11 h-11 mx-auto rounded-lg bg-primary-600 text-primary-foreground text-sm font-bold flex items-center justify-center">AH</div>
          </div>
          <h1 className="text-center text-xl font-semibold text-white">Sign in</h1>
          <p className="mt-1 text-center text-sm text-slate-400">Welcome back to Attendance In Hand</p>
        </div>

        {justRegistered && !error && (
          <div className="notice notice-success" role="status">
            <span className="block sm:inline">Account created. Sign in to continue.</span>
          </div>
        )}

        {error && (
          <div className="notice notice-danger" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="label">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300 ${loading
 ? 'bg-slate-700 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 hover:'
                }`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 text-sm mt-6">
            <Link to="/register" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Don't have an account? Sign up
            </Link>
            <a href="/admin/login" className="text-slate-500 hover:text-slate-300 transition-colors text-xs">
              Access Admin Portal
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
