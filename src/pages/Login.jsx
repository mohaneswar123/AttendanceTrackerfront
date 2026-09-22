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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-[100px] -z-10 animate-float" />

      <div className="max-w-md w-full space-y-8 glass-card p-8 md:p-10 relative z-10">
        <div>
          <div className="flex justify-center mb-6">
            <div className="text-5xl">📚</div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 drop-shadow-sm">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to access your attendance register
          </p>
        </div>

        {justRegistered && !error && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-fade-in" role="status">
            <span className="text-lg">✅</span>
            <span className="block sm:inline mt-0.5">Account created. Sign in to continue.</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-fade-in" role="alert">
            <span className="text-lg">⚠️</span>
            <span className="block sm:inline mt-0.5">{error}</span>
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
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 hover:shadow-neon-primary hover:-translate-y-0.5'
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
